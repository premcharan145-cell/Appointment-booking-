package mth.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mth.models.Appointments;
import mth.services.AppointmentsService;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentsController {

	@Autowired
	private AppointmentsService AS;

	@GetMapping
	public Object getAppointments(@RequestHeader("Token") String token) {
		return AS.getAppointments(token);
	}

	@PostMapping
	public Object bookAppointment(@RequestBody Appointments app, @RequestHeader("Token") String token) {
		return AS.bookAppointment(app, token);
	}

	@PutMapping("/{id}")
	public Object rescheduleAppointment(@PathVariable("id") Long id, @RequestBody Appointments app, @RequestHeader("Token") String token) {
		return AS.rescheduleAppointment(id, app, token);
	}

	@PutMapping("/{id}/status")
	public Object updateStatus(@PathVariable("id") Long id, @RequestBody Map<String, String> body, @RequestHeader("Token") String token) {
		String status = body.get("status");
		return AS.updateStatus(id, status, token);
	}

	@DeleteMapping("/{id}")
	public Object deleteAppointment(@PathVariable("id") Long id, @RequestHeader("Token") String token) {
		return AS.deleteAppointment(id, token);
	}

	@GetMapping("/search/{key}")
	public Object searchAppointments(@PathVariable("key") String key) {
		return AS.searchAppointments(key);
	}
}
