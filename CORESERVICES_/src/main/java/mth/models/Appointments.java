package mth.models;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "appointments")
public class Appointments {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long appointmentId;

	@ManyToOne
	@JoinColumn(name = "user_id", referencedColumnName = "id")
	private Users user;

	@ManyToOne
	@JoinColumn(name = "provider_id", referencedColumnName = "providerId")
	private ServiceProviders provider;

	private LocalDate appointmentDate;
	private LocalTime startTime;
	private LocalTime endTime;
	private String status; // PENDING, CONFIRMED, COMPLETED, CANCELLED

	public Long getAppointmentId() {
		return appointmentId;
	}

	public void setAppointmentId(Long appointmentId) {
		this.appointmentId = appointmentId;
	}

	public Users getUser() {
		return user;
	}

	public void setUser(Users user) {
		this.user = user;
	}

	public ServiceProviders getProvider() {
		return provider;
	}

	public void setProvider(ServiceProviders provider) {
		this.provider = provider;
	}

	public LocalDate getAppointmentDate() {
		return appointmentDate;
	}

	public void setAppointmentDate(LocalDate appointmentDate) {
		this.appointmentDate = appointmentDate;
	}

	public LocalTime getStartTime() {
		return startTime;
	}

	public void setStartTime(LocalTime startTime) {
		this.startTime = startTime;
	}

	public LocalTime getEndTime() {
		return endTime;
	}

	public void setEndTime(LocalTime endTime) {
		this.endTime = endTime;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
}
