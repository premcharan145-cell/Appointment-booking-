package mth.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mth.models.ServiceProviders;
import mth.models.Users;
import mth.repository.ServiceProvidersRepository;
import mth.repository.UsersRepository;

@Service
public class ServiceProvidersService {

	@Autowired
	private ServiceProvidersRepository SPR;

	@Autowired
	private UsersRepository UR;

	@Autowired
	private JWTService JWT;

	// List all providers
	public Object getAllProviders() {
		Map<String, Object> response = new HashMap<>();
		try {
			List<ServiceProviders> list = SPR.findAll();
			response.put("code", 200);
			response.put("providers", list);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	// Get provider by ID
	public Object getProviderById(Long id) {
		Map<String, Object> response = new HashMap<>();
		try {
			ServiceProviders p = SPR.findById(id).orElseThrow(() -> new Exception("Provider not found"));
			response.put("code", 200);
			response.put("provider", p);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	// Get provider profile by User ID (for logged-in providers)
	public Object getProviderProfile(String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			Map<String, Object> payload = JWT.validateToken(token);
			String email = payload.get("username").toString();
			Long userId = Long.parseLong(UR.checkEmail(email).toString());

			Optional<ServiceProviders> pOpt = SPR.findByUser_Id(userId);
			if (pOpt.isPresent()) {
				response.put("code", 200);
				response.put("provider", pOpt.get());
			} else {
				// Create a default profile if not exists
				Users user = UR.findById(userId).orElseThrow(() -> new Exception("User not found"));
				ServiceProviders provider = new ServiceProviders();
				provider.setUser(user);
				provider.setName(user.getFullname());
				provider.setRating(5.0);
				provider.setSpecialization("General");
				provider.setAvailability("{\"Monday\":\"09:00-17:00\",\"Tuesday\":\"09:00-17:00\",\"Wednesday\":\"09:00-17:00\",\"Thursday\":\"09:00-17:00\",\"Friday\":\"09:00-17:00\"}");
				SPR.save(provider);
				response.put("code", 200);
				response.put("provider", provider);
			}
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	// Update provider profile
	public Object updateProviderProfile(Long id, ServiceProviders updated, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateToken(token);
			ServiceProviders provider = SPR.findById(id).orElseThrow(() -> new Exception("Provider not found"));
			provider.setName(updated.getName());
			provider.setSpecialization(updated.getSpecialization());
			provider.setAvailability(updated.getAvailability());
			if (updated.getRating() != null) {
				provider.setRating(updated.getRating());
			}
			SPR.save(provider);
			
			// Also update user's fullname if it changed
			if (provider.getUser() != null) {
				Users user = provider.getUser();
				user.setFullname(updated.getName());
				UR.save(user);
			}

			response.put("code", 200);
			response.put("message", "Provider profile updated successfully");
			response.put("provider", provider);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	// Search providers
	public Object searchProviders(String key) {
		Map<String, Object> response = new HashMap<>();
		try {
			List<ServiceProviders> list = SPR.searchProviders(key);
			response.put("code", 200);
			response.put("providers", list);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
}
