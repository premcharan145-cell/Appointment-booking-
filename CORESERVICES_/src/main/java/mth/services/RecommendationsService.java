package mth.services;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import mth.models.Appointments;
import mth.models.Recommendations;
import mth.models.ServiceProviders;
import mth.models.Users;
import mth.repository.AppointmentsRepository;
import mth.repository.RecommendationsRepository;
import mth.repository.ServiceProvidersRepository;
import mth.repository.UsersRepository;

@Service
@Transactional
public class RecommendationsService {

	@Autowired
	private RecommendationsRepository RR;

	@Autowired
	private AppointmentsRepository AR;

	@Autowired
	private ServiceProvidersRepository SPR;

	@Autowired
	private UsersRepository UR;

	@Autowired
	private JWTService JWT;

	public Object getRecommendations(Long userId, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateToken(token);
			
			Users user = UR.findById(userId).orElseThrow(() -> new Exception("User not found"));

			// Delete old recommendations for this user
			RR.deleteByUser_Id(userId);

			// 1. Analyze user appointment history
			List<Appointments> history = AR.findByUser_Id(userId);
			
			// Find preferred provider ID
			Long preferredProviderId = null;
			if (!history.isEmpty()) {
				preferredProviderId = history.stream()
					.filter(a -> a.getProvider() != null)
					.collect(Collectors.groupingBy(a -> a.getProvider().getProviderId(), Collectors.counting()))
					.entrySet().stream()
					.max(Map.Entry.comparingByValue())
					.map(Map.Entry::getKey)
					.orElse(null);
			}

			// Find preferred hour of day
			int preferredHour = 10; // Default: 10:00 AM
			if (!history.isEmpty()) {
				preferredHour = history.stream()
					.filter(a -> a.getStartTime() != null)
					.collect(Collectors.groupingBy(a -> a.getStartTime().getHour(), Collectors.counting()))
					.entrySet().stream()
					.max(Map.Entry.comparingByValue())
					.map(Map.Entry::getKey)
					.orElse(10);
			}

			// 2. Fetch providers to recommend
			List<ServiceProviders> allProviders = SPR.findAll();
			List<ServiceProviders> recommendationsList = new ArrayList<>();

			// First priority: user preferred provider
			if (preferredProviderId != null) {
				final Long prefId = preferredProviderId;
				allProviders.stream()
					.filter(p -> p.getProviderId().equals(prefId))
					.findFirst()
					.ifPresent(recommendationsList::add);
			}

			// Next priority: top-rated providers (rating >= 4.5)
			List<ServiceProviders> topRated = allProviders.stream()
				.filter(p -> p.getRating() != null && p.getRating() >= 4.5)
				.filter(p -> !recommendationsList.contains(p))
				.collect(Collectors.toList());
			recommendationsList.addAll(topRated);

			// Fallback: any providers
			if (recommendationsList.isEmpty()) {
				recommendationsList.addAll(allProviders);
			}

			// Limit to top 3 providers for suggestions
			List<ServiceProviders> targets = recommendationsList.stream().limit(3).collect(Collectors.toList());

			// 3. Generate slots over the next 3 days
			List<Recommendations> generated = new ArrayList<>();
			LocalDate today = LocalDate.now();

			for (ServiceProviders provider : targets) {
				boolean slotFound = false;
				for (int dayOffset = 1; dayOffset <= 3; dayOffset++) {
					LocalDate date = today.plusDays(dayOffset);
					// Formulate slot: e.g. preferred hour
					LocalTime start = LocalTime.of(preferredHour, 0);
					LocalTime end = start.plusHours(1);

					// Check if provider is available and slot has no conflicts
					if (isSlotConflictFree(provider.getProviderId(), userId, date, start, end)) {
						Recommendations rec = new Recommendations();
						rec.setUser(user);
						rec.setProvider(provider);
						rec.setSuggestedSlot(date + " " + start + "-" + end);
						RR.save(rec);
						generated.add(rec);
						slotFound = true;
						break; // Found a slot for this provider, move to next provider
					}
				}

				// If preferred hour is blocked, try default hour (e.g., 2 hours later)
				if (!slotFound) {
					for (int dayOffset = 1; dayOffset <= 3; dayOffset++) {
						LocalDate date = today.plusDays(dayOffset);
						LocalTime start = LocalTime.of((preferredHour + 2) % 20, 0);
						if (start.isBefore(LocalTime.of(8, 0))) start = LocalTime.of(9, 0);
						LocalTime end = start.plusHours(1);

						if (isSlotConflictFree(provider.getProviderId(), userId, date, start, end)) {
							Recommendations rec = new Recommendations();
							rec.setUser(user);
							rec.setProvider(provider);
							rec.setSuggestedSlot(date + " " + start + "-" + end);
							RR.save(rec);
							generated.add(rec);
							break;
						}
					}
				}
			}

			response.put("code", 200);
			response.put("recommendations", generated);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	private boolean isSlotConflictFree(Long providerId, Long customerId, LocalDate date, LocalTime start, LocalTime end) {
		try {
			// Check provider conflict
			List<Appointments> pApps = AR.findByProvider_ProviderIdAndAppointmentDateAndStatusIn(
					providerId, date, List.of("PENDING", "CONFIRMED"));
			for (Appointments a : pApps) {
				if (start.isBefore(a.getEndTime()) && a.getStartTime().isBefore(end)) {
					return false;
				}
			}
			// Check customer conflict
			List<Appointments> cApps = AR.findByUser_IdAndAppointmentDateAndStatusIn(
					customerId, date, List.of("PENDING", "CONFIRMED"));
			for (Appointments a : cApps) {
				if (start.isBefore(a.getEndTime()) && a.getStartTime().isBefore(end)) {
					return false;
				}
			}
			return true;
		} catch (Exception e) {
			return false;
		}
	}
}
