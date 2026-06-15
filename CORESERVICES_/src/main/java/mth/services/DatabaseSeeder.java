package mth.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import mth.models.Menus;
import mth.models.Roles;
import mth.models.Rolesmapping;
import mth.models.ServiceProviders;
import mth.models.Users;
import mth.repository.MenusRepository;
import mth.repository.RolesRepository;
import mth.repository.RolesmappingRepository;
import mth.repository.ServiceProvidersRepository;
import mth.repository.UsersRepository;

@Component
public class DatabaseSeeder {

	@Autowired
	private RolesRepository RR;

	@Autowired
	private MenusRepository MR;

	@Autowired
	private RolesmappingRepository RMR;

	@Autowired
	private UsersRepository UR;

	@Autowired
	private ServiceProvidersRepository SPR;

	@EventListener(ApplicationReadyEvent.class)
	public void seedDatabase() {
		try {
			seedRoles();
			seedMenus();
			seedRolesMapping();
			seedUsersAndProviders();
			seedLecturers();
			System.out.println("DATABASE SEEDING SUCCESSFUL");
		} catch (Exception e) {
			System.err.println("DATABASE SEEDING ERROR: " + e.getMessage());
		}
	}

	private void seedRoles() {
		if (RR.count() == 0) {
			saveRole(1L, "CUSTOMER");
			saveRole(2L, "PROVIDER");
			saveRole(3L, "ADMIN");
		}
	}

	private void saveRole(Long id, String name) {
		Roles r = new Roles();
		r.setRole(id);
		r.setRolename(name);
		RR.save(r);
	}

	private void seedMenus() {
		if (MR.count() == 0) {
			saveMenu(2L, "Book Appointment", "book.png");
			saveMenu(3L, "Appointment History", "history.png");
			saveMenu(4L, "Recommendations", "recommend.png");
			saveMenu(5L, "Notifications", "bell.png");
			saveMenu(6L, "Manage Availability", "calendar.png");
			saveMenu(7L, "Appointments List", "list.png");
			saveMenu(8L, "User Management", "users.png");
			saveMenu(9L, "Provider Management", "providers.png");
			saveMenu(10L, "Analytics Dashboard", "analytics.png");
			saveMenu(11L, "Profile", "user.png");
		}
	}

	private void saveMenu(Long id, String name, String icon) {
		Menus m = new Menus();
		m.setMid(id);
		m.setMenu(name);
		m.setMicon(icon);
		MR.save(m);
	}

	private void seedRolesMapping() {
		if (RMR.count() == 0) {
			// Customer (Role 1) Menu mappings
			saveMapping(2L, 1L); // Book Appointment
			saveMapping(3L, 1L); // Appointment History
			saveMapping(4L, 1L); // Recommendations
			saveMapping(5L, 1L); // Notifications
			saveMapping(11L, 1L); // Profile

			// Provider (Role 2) Menu mappings
			saveMapping(6L, 2L); // Manage Availability
			saveMapping(7L, 2L); // Appointments List
			saveMapping(5L, 2L); // Notifications
			saveMapping(11L, 2L); // Profile

			// Admin (Role 3) Menu mappings
			saveMapping(8L, 3L); // User Management
			saveMapping(9L, 3L); // Provider Management
			saveMapping(10L, 3L); // Analytics Dashboard
			saveMapping(11L, 3L); // Profile
		}
	}

	private void saveMapping(Long mid, Long role) {
		Rolesmapping rm = new Rolesmapping();
		rm.setMid(mid);
		rm.setRole(role);
		RMR.save(rm);
	}

	private void seedUsersAndProviders() {
		if (UR.count() == 0) {
			// 1. Seed Customer
			Users customer = new Users();
			customer.setFullname("Alice Johnson");
			customer.setEmail("customer@booking.com");
			customer.setPassword("password");
			customer.setPhone("1234567890");
			customer.setRole(1);
			customer.setStatus(1);
			UR.save(customer);

			// 2. Seed Providers
			Users p1User = new Users();
			p1User.setFullname("Dr. John Smith");
			p1User.setEmail("provider1@booking.com");
			p1User.setPassword("password");
			p1User.setPhone("9876543210");
			p1User.setRole(2);
			p1User.setStatus(1);
			UR.save(p1User);

			ServiceProviders p1 = new ServiceProviders();
			p1.setUser(p1User);
			p1.setName("Dr. John Smith");
			p1.setSpecialization("Cardiologist");
			p1.setRating(4.8);
			p1.setAvailability("{\"Monday\":\"09:00-17:00\",\"Wednesday\":\"09:00-17:00\",\"Friday\":\"09:00-17:00\"}");
			SPR.save(p1);

			Users p2User = new Users();
			p2User.setFullname("Dr. Sarah Connor");
			p2User.setEmail("provider2@booking.com");
			p2User.setPassword("password");
			p2User.setPhone("9876543211");
			p2User.setRole(2);
			p2User.setStatus(1);
			UR.save(p2User);

			ServiceProviders p2 = new ServiceProviders();
			p2.setUser(p2User);
			p2.setName("Dr. Sarah Connor");
			p2.setSpecialization("Therapist");
			p2.setRating(4.9);
			p2.setAvailability("{\"Tuesday\":\"10:00-18:00\",\"Thursday\":\"10:00-18:00\"}");
			SPR.save(p2);

			// 3. Seed Admin
			Users admin = new Users();
			admin.setFullname("System Administrator");
			admin.setEmail("admin@booking.com");
			admin.setPassword("password");
			admin.setPhone("5551234567");
			admin.setRole(3);
			admin.setStatus(1);
			UR.save(admin);

			// 4. Seed the documented sample accounts (see README "Sample Login Accounts")
			Users specCustomer = new Users();
			specCustomer.setFullname("Mohith");
			specCustomer.setEmail("mohith@example.com");
			specCustomer.setPassword("1");
			specCustomer.setPhone("9000000001");
			specCustomer.setRole(1);
			specCustomer.setStatus(1);
			UR.save(specCustomer);

			Users specProviderUser = new Users();
			specProviderUser.setFullname("Prem Sai");
			specProviderUser.setEmail("premsai@example.com");
			specProviderUser.setPassword("12");
			specProviderUser.setPhone("9000000002");
			specProviderUser.setRole(2);
			specProviderUser.setStatus(1);
			UR.save(specProviderUser);

			ServiceProviders specProvider = new ServiceProviders();
			specProvider.setUser(specProviderUser);
			specProvider.setName("Prem Sai");
			specProvider.setSpecialization("Dermatologist");
			specProvider.setRating(4.7);
			specProvider.setAvailability("{\"Monday\":\"09:00-17:00\",\"Tuesday\":\"09:00-17:00\",\"Wednesday\":\"09:00-17:00\",\"Thursday\":\"09:00-17:00\",\"Friday\":\"09:00-17:00\"}");
			SPR.save(specProvider);

			Users specAdmin = new Users();
			specAdmin.setFullname("Rakesh");
			specAdmin.setEmail("rakesh@example.com");
			specAdmin.setPassword("123");
			specAdmin.setPhone("9000000003");
			specAdmin.setRole(3);
			specAdmin.setStatus(1);
			UR.save(specAdmin);
		}
	}

	// Seed the 10 lecturers as real service providers (idempotent: only inserts
	// lecturers whose account does not already exist, so it is safe on an
	// existing database).
	private void seedLecturers() {
		seedLecturer("Dr. Rajesh Kumar",    "DBMS",                    "lecturer1@booking.com",  "10:00", "12:00", "Monday", "Tuesday", "Thursday", "Friday");
		seedLecturer("Prof. Anitha Reddy",  "Operating Systems",       "lecturer2@booking.com",  "14:00", "16:00", "Monday", "Wednesday", "Thursday", "Saturday");
		seedLecturer("Dr. Srinivas Rao",    "Computer Networks",       "lecturer3@booking.com",  "09:00", "11:00", "Tuesday", "Wednesday", "Friday", "Saturday");
		seedLecturer("Prof. Kavitha Devi",  "Data Structures",         "lecturer4@booking.com",  "11:00", "13:00", "Monday", "Tuesday", "Wednesday", "Friday");
		seedLecturer("Dr. Praveen Kumar",   "Software Engineering",    "lecturer5@booking.com",  "15:00", "17:00", "Tuesday", "Thursday", "Friday", "Saturday");
		seedLecturer("Prof. Lakshmi Priya", "Java Programming",        "lecturer6@booking.com",  "09:00", "11:00", "Monday", "Wednesday", "Thursday", "Saturday");
		seedLecturer("Dr. Harish Chandra",  "Artificial Intelligence", "lecturer7@booking.com",  "13:00", "15:00", "Monday", "Tuesday", "Thursday", "Saturday");
		seedLecturer("Prof. Suresh Babu",   "Machine Learning",        "lecturer8@booking.com",  "10:00", "12:00", "Wednesday", "Thursday", "Friday", "Saturday");
		seedLecturer("Dr. Meena Rani",      "Cloud Computing",         "lecturer9@booking.com",  "14:00", "16:00", "Monday", "Tuesday", "Friday", "Saturday");
		seedLecturer("Prof. Naveen Kumar",  "Cyber Security",          "lecturer10@booking.com", "11:00", "13:00", "Monday", "Wednesday", "Thursday", "Friday");
	}

	private void seedLecturer(String name, String subject, String email, String start, String end, String... days) {
		// Skip if this lecturer account already exists
		if (UR.checkEmail(email) != null) {
			return;
		}

		Users user = new Users();
		user.setFullname(name);
		user.setEmail(email);
		user.setPassword("password");
		user.setPhone("9000000000");
		user.setRole(2); // PROVIDER
		user.setStatus(1);
		UR.save(user);

		StringBuilder availability = new StringBuilder("{");
		for (int i = 0; i < days.length; i++) {
			if (i > 0) availability.append(",");
			availability.append("\"").append(days[i]).append("\":\"").append(start).append("-").append(end).append("\"");
		}
		availability.append("}");

		ServiceProviders provider = new ServiceProviders();
		provider.setUser(user);
		provider.setName(name);
		provider.setSpecialization(subject);
		provider.setRating(5.0);
		provider.setAvailability(availability.toString());
		SPR.save(provider);
	}
}
