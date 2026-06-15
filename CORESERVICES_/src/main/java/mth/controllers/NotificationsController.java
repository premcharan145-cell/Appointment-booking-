package mth.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mth.services.NotificationsService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationsController {

	@Autowired
	private NotificationsService NS;

	@GetMapping
	public Object getNotifications(@RequestHeader("Token") String token) {
		return NS.getNotifications(token);
	}

	@PutMapping("/{id}/read")
	public Object markAsRead(@PathVariable("id") Long id, @RequestHeader("Token") String token) {
		return NS.markAsRead(id, token);
	}
}
