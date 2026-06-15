package mth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mth.models.ServiceProviders;

@Repository
public interface ServiceProvidersRepository extends JpaRepository<ServiceProviders, Long> {

	Optional<ServiceProviders> findByUser_Id(Long userId);

	@Query("select p from ServiceProviders p where lower(p.name) like concat('%', lower(:key), '%') or lower(p.specialization) like concat('%', lower(:key), '%')")
	List<ServiceProviders> searchProviders(@Param("key") String key);
}
