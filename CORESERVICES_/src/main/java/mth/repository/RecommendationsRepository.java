package mth.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mth.models.Recommendations;

@Repository
public interface RecommendationsRepository extends JpaRepository<Recommendations, Long> {

	List<Recommendations> findByUser_Id(Long userId);

	void deleteByUser_Id(Long userId);
}
