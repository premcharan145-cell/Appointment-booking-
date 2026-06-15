package mth.services;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import mth.models.Notifications;
import mth.models.Users;
import mth.repository.NotificationsRepository;
import mth.repository.UsersRepository;

@Service
public class NotificationsService {

	@Autowired
	private NotificationsRepository NR;

	@Autowired
	private UsersRepository UR;

	@Autowired
	private JWTService JWT;

	// Send notification
	public void send(Users user, String message) {
		Notifications notification = new Notifications();
		notification.setUser(user);
		notification.setMessage(message);
		notification.setCreatedAt(LocalDateTime.now());
		notification.setIsRead(false);
		NR.save(notification);
		
		// Mock Email Notification
		System.out.println("SMTP EMAIL SENT TO: " + user.getEmail() + " | CONTENT: " + message);
	}

	// Get notifications for current user
	public Object getNotifications(String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			Map<String, Object> payload = JWT.validateToken(token);
			String email = payload.get("username").toString();
			Long userId = getUserIdFromEmail(email);

			List<Notifications> list = NR.findByUser_IdOrderByCreatedAtDesc(userId);
			long unreadCount = NR.countByUser_IdAndIsReadFalse(userId);

			response.put("code", 200);
			response.put("notifications", list);
			response.put("unreadCount", unreadCount);
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	// Mark notification as read
	public Object markAsRead(Long id, String token) {
		Map<String, Object> response = new HashMap<>();
		try {
			JWT.validateToken(token);
			Notifications n = NR.findById(id).orElseThrow(() -> new Exception("Notification not found"));
			n.setIsRead(true);
			NR.save(n);
			response.put("code", 200);
			response.put("message", "Notification marked as read");
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	private Long getUserIdFromEmail(String email) {
		return Long.parseLong(UR.checkEmail(email).toString());
	}
}
