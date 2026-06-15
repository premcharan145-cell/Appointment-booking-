package mth.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mth.models.Appointments;

@Repository
public interface AppointmentsRepository extends JpaRepository<Appointments, Long> {

	List<Appointments> findByUser_Id(Long userId);

	List<Appointments> findByProvider_ProviderId(Long providerId);

	List<Appointments> findByProvider_User_Id(Long userId);

	List<Appointments> findByProvider_ProviderIdAndAppointmentDateAndStatusIn(
			Long providerId, LocalDate date, List<String> statuses);

	List<Appointments> findByUser_IdAndAppointmentDateAndStatusIn(
			Long userId, LocalDate date, List<String> statuses);

	@Query("select a from Appointments a where a.appointmentDate = :date")
	List<Appointments> filterByDate(@Param("date") LocalDate date);

	@Query("select a from Appointments a where lower(a.provider.name) like concat('%', lower(:key), '%') or lower(a.status) like concat('%', lower(:key), '%')")
	List<Appointments> searchAppointments(@Param("key") String key);
}
