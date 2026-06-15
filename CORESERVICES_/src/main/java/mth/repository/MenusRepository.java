package mth.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import mth.models.Menus;

@Repository
public interface MenusRepository extends JpaRepository<Menus, Long> {

}
