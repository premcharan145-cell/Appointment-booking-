package mth.services;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mth.models.Appointments;
import mth.models.ServiceProviders;
import mth.models.Users;
import mth.repository.AppointmentsRepository;
import mth.repository.ServiceProvidersRepository;
import mth.repository.UsersRepository;

@Service
public class AppointmentsService {

	@Autowired
	private AppointmentsRepository AR;

	@Autowired
	private ServiceProvidersRepository SPR;

	@Autowired
	private UsersRepository UR;

	@Autowired
	private NotificationsService NS;

	@Autowired
	private JWTService JWT;

	// Fetch appointments based on role
	public Object getAppointments(String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			Map<String, Object> payload = JWT.validateToken(token);
			String email = payload.get("username").toString();
			Long role = Long.parseLong(payload.get("role").toString());
			Long userId = Long.parseLong(UR.checkEmail(email).toString());

			List<Appointments> list;
			if (role == 3) {
				// Admin: see all
				list = AR.findAll();
			} else if (role == 2) {
				// Provider: see provider's appointments
				list = AR.findByProvider_User_Id(userId);
			} else {
				// Customer: see customer's appointments
				list = AR.findByUser_Id(userId);
			}

			response.put("code", 200);
			response.put("appointments", list);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	// Book appointment
	public Object bookAppointment(Appointments app, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			Map<String, Object> payload = JWT.validateToken(token);
			String email = payload.get("username").toString();
			Long userId = Long.parseLong(UR.checkEmail(email).toString());

			Users customer = UR.findById(userId).orElseThrow(() -> new Exception("Customer not found"));
			ServiceProviders provider = SPR.findById(app.getProvider().getProviderId())
					.orElseThrow(() -> new Exception("Provider not found"));

			// Check scheduling conflicts
			checkScheduleConflict(provider.getProviderId(), customer.getId(), app.getAppointmentDate(),
					app.getStartTime(), app.getEndTime(), null);

			app.setUser(customer);
			app.setProvider(provider);
			app.setStatus("PENDING");
			AR.save(app);

			// Notify provider
			NS.send(provider.getUser(), "New appointment booking request from " + customer.getFullname() + " for " + app.getAppointmentDate() + " at " + app.getStartTime());
			// Notify customer
			NS.send(customer, "Your appointment with " + provider.getName() + " is pending confirmation.");

			response.put("code", 200);
			response.put("message", "Appointment booked successfully. Status: PENDING");
			response.put("appointment", app);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	// Update / Reschedule appointment
	public Object rescheduleAppointment(Long id, Appointments updated, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateToken(token);
			Appointments app = AR.findById(id).orElseThrow(() -> new Exception("Appointment not found"));

			// Check scheduling conflicts (excluding current appointment id)
			checkScheduleConflict(app.getProvider().getProviderId(), app.getUser().getId(),
					updated.getAppointmentDate(), updated.getStartTime(), updated.getEndTime(), id);

			app.setAppointmentDate(updated.getAppointmentDate());
			app.setStartTime(updated.getStartTime());
			app.setEndTime(updated.getEndTime());
			app.setStatus("PENDING"); // Reset to pending after reschedule
			AR.save(app);

			// Notifications
			NS.send(app.getProvider().getUser(), "Appointment with " + app.getUser().getFullname() + " has been rescheduled to " + app.getAppointmentDate() + " at " + app.getStartTime());
			NS.send(app.getUser(), "You rescheduled your appointment with " + app.getProvider().getName() + " to " + app.getAppointmentDate() + " at " + app.getStartTime());

			response.put("code", 200);
			response.put("message", "Appointment rescheduled successfully. Status: PENDING");
			response.put("appointment", app);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	// Update Status (Accept/Reject/Complete)
	public Object updateStatus(Long id, String status, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateToken(token);
			Appointments app = AR.findById(id).orElseThrow(() -> new Exception("Appointment not found"));
			app.setStatus(status.toUpperCase());
			AR.save(app);

			// Send notifications based on new status
			if (status.equalsIgnoreCase("CONFIRMED")) {
				NS.send(app.getUser(), "Your appointment with " + app.getProvider().getName() + " on " + app.getAppointmentDate() + " at " + app.getStartTime() + " has been CONFIRMED.");
			} else if (status.equalsIgnoreCase("CANCELLED")) {
				NS.send(app.getUser(), "Your appointment with " + app.getProvider().getName() + " has been CANCELLED.");
				NS.send(app.getProvider().getUser(), "Appointment with " + app.getUser().getFullname() + " has been CANCELLED.");
			} else if (status.equalsIgnoreCase("COMPLETED")) {
				NS.send(app.getUser(), "Your appointment with " + app.getProvider().getName() + " has been completed. Please leave a rating!");
			}

			response.put("code", 200);
			response.put("message", "Appointment status updated to " + status);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	// Delete appointment (Customer cancels or Admin deletes)
	public Object deleteAppointment(Long id, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateToken(token);
			Appointments app = AR.findById(id).orElseThrow(() -> new Exception("Appointment not found"));
			
			// Notify both parties
			NS.send(app.getUser(), "Appointment with " + app.getProvider().getName() + " has been cancelled and removed.");
			NS.send(app.getProvider().getUser(), "Appointment with " + app.getUser().getFullname() + " has been cancelled and removed.");

			AR.deleteById(id);
			response.put("code", 200);
			response.put("message", "Appointment deleted successfully");
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	// Search & filters
	public Object searchAppointments(String key) {
		Map<String, Object> response = new HashMap<>();
		try {
			List<Appointments> list = AR.searchAppointments(key);
			response.put("code", 200);
			response.put("appointments", list);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	// Conflict checker logic
	private void checkScheduleConflict(Long providerId, Long customerId, LocalDate date, LocalTime start, LocalTime end, Long excludeAppId) throws Exception {
		List<String> activeStatuses = Arrays.asList("PENDING", "CONFIRMED");

		// 1. Check provider overlaps
		List<Appointments> providerApps = AR.findByProvider_ProviderIdAndAppointmentDateAndStatusIn(providerId, date, activeStatuses);
		for (Appointments app : providerApps) {
			if (excludeAppId != null && app.getAppointmentId().equals(excludeAppId)) {
				continue;
			}
			if (isOverlapping(start, end, app.getStartTime(), app.getEndTime())) {
				throw new Exception("Conflict: The provider is already booked during this time slot.");
			}
		}

		// 2. Check customer overlaps
		List<Appointments> customerApps = AR.findByUser_IdAndAppointmentDateAndStatusIn(customerId, date, activeStatuses);
		for (Appointments app : customerApps) {
			if (excludeAppId != null && app.getAppointmentId().equals(excludeAppId)) {
				continue;
			}
			if (isOverlapping(start, end, app.getStartTime(), app.getEndTime())) {
				throw new Exception("Conflict: You already have another appointment booked during this time slot.");
			}
		}
	}

	private boolean isOverlapping(LocalTime start1, LocalTime end1, LocalTime start2, LocalTime end2) {
		// Overlap condition: start1 < end2 AND start2 < end1
		return start1.isBefore(end2) && start2.isBefore(end1);
	}
}
