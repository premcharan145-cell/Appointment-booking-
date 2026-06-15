package mth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mth.models.Rolesmapping;

@Repository
public interface RolesmappingRepository extends JpaRepository<Rolesmapping, Long> {

}
