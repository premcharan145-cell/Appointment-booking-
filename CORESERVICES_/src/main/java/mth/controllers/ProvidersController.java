package mth.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mth.models.ServiceProviders;
import mth.services.ServiceProvidersService;

@RestController
@RequestMapping("/api/providers")
public class ProvidersController {

	@Autowired
	private ServiceProvidersService SPS;

	@GetMapping
	public Object getAllProviders() {
		return SPS.getAllProviders();
	}

	@GetMapping("/{id}")
	public Object getProviderById(@PathVariable("id") Long id) {
		return SPS.getProviderById(id);
	}

	@GetMapping("/profile")
	public Object getProviderProfile(@RequestHeader("Token") String token) {
		return SPS.getProviderProfile(token);
	}

	@PostMapping
	public Object createOrUpdateProvider(@RequestBody ServiceProviders provider, @RequestHeader("Token") String token) {
		return SPS.updateProviderProfile(provider.getProviderId(), provider, token);
	}

	@PutMapping("/{id}")
	public Object updateProvider(@PathVariable("id") Long id, @RequestBody ServiceProviders provider, @RequestHeader("Token") String token) {
		return SPS.updateProviderProfile(id, provider, token);
	}

	@GetMapping("/search/{key}")
	public Object searchProviders(@PathVariable("key") String key) {
		return SPS.searchProviders(key);
	}
}
