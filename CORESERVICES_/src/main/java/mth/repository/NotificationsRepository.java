package mth.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mth.models.Notifications;

@Repository
public interface NotificationsRepository extends JpaRepository<Notifications, Long> {

	List<Notifications> findByUser_IdOrderByCreatedAtDesc(Long userId);

	long countByUser_IdAndIsReadFalse(Long userId);
}
