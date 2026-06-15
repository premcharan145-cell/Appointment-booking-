package mth.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mth.services.RecommendationsService;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationsController {

	@Autowired
	private RecommendationsService RS;

	@GetMapping("/{userId}")
	public Object getRecommendations(@PathVariable("userId") Long userId, @RequestHeader("Token") String token) {
		return RS.getRecommendations(userId, token);
	}
}
