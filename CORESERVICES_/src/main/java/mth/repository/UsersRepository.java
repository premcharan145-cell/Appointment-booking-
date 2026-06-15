package mth.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import mth.models.Users;

@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {

	@Query("select U from Users U where U.email=:email and U.password=:password")
	public Object validateCredentials(@Param("email") String email, @Param("password") String password);
	
	@Query("select M from Menus M join Rolesmapping R on M.mid=R.mid where R.role=:role order by M.mid")
	public List<Object> getMenuList(@Param("role") Long role);
	
	@Query("select U.fullname from Users U where U.email=:email")
	public Object getFullName(@Param("email") String email);
	
	@Query("select U,R from Users U left join Roles R on U.role=R.role where email=:email")
	public Object getProfile(@Param("email") String email);
	
	@Query("select U.id from Users U where U.email=:email")
	public Object checkEmail(@Param("email") String email);
	
	@Query("select U from Users U where lower(U.fullname) like concat('%', lower(:key) ,'%')")
	public List<Object> searchUser(@Param("key") String key);
}
