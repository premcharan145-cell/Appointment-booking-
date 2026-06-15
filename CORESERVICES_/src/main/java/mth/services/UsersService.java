package mth.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import mth.models.Roles;
import mth.models.ServiceProviders;
import mth.models.Users;
import mth.repository.RolesRepository;
import mth.repository.ServiceProvidersRepository;
import mth.repository.UsersRepository;

@Service
public class UsersService {

	@Autowired
	UsersRepository UR;
	
	@Autowired 
	JWTService JWT;
	
	@Autowired
	RolesRepository RR;

	@Autowired
	ServiceProvidersRepository SPR;
	
	//Singup Operation
	public Object signup(Users U)
	{
		Map<String, Object> response = new HashMap<>();
		try
		{
			if (U.getRole() == 0) {
				U.setRole(1); // Default to Customer (1)
			}
			U.setStatus(1); //1 -> Active, 0 -> In-Active Users
			
			UR.save(U); //Insert into database

			if (U.getRole() == 2) {
				ServiceProviders provider = new ServiceProviders();
				provider.setUser(U);
				provider.setName(U.getFullname());
				provider.setRating(5.0);
				provider.setSpecialization("General");
				provider.setAvailability("{\"Monday\":\"09:00-17:00\",\"Tuesday\":\"09:00-17:00\",\"Wednesday\":\"09:00-17:00\",\"Thursday\":\"09:00-17:00\",\"Friday\":\"09:00-17:00\"}");
				SPR.save(provider);
			}
			
			response.put("code", 200);
			response.put("message", "User account has been created");
		}catch(Exception e)
		{
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
	
	//Signin Operation
	public Object signin(Map<String, Object> data)
	{
		Map<String, Object> response = new HashMap<>();
		try
		{
			Users U = (Users) UR.validateCredentials(data.get("username").toString(), data.get("password").toString());
			if(U == null)
				throw new Exception("Invalid Credentials!");
			
			response.put("code", 200);
			response.put("message", "Validation Success");
			response.put("jwt", JWT.generateToken(U.getEmail(), U.getRole(), U.getId()));
		}catch(Exception e)
		{
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}

	// Forgot Password Operation
	public Object forgotPassword(Map<String, Object> data) {
		Map<String, Object> response = new HashMap<>();
		try {
			String email = data.get("email").toString();
			String newPassword = data.get("password").toString();

			Object userIdObj = UR.checkEmail(email);
			if (userIdObj == null) {
				throw new Exception("Email ID not found!");
			}

			Long id = Long.parseLong(userIdObj.toString());
			Users U = UR.findById(id).orElseThrow(() -> new Exception("User not found"));
			U.setPassword(newPassword);
			UR.save(U);

			response.put("code", 200);
			response.put("message", "Password has been reset successfully");
		} catch (Exception e) {
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
	
	//RBAC
	public Object rbac(String token)
	{
		Map<String, Object> response = new HashMap<>();
		try
		{
			Map<String, Object> payload = JWT.validateToken(token);
			Long role = Long.parseLong(payload.get("role").toString());
			
			List<Object> menulist = UR.getMenuList(role);
			
			String email = payload.get("username").toString();
			Object fullname = UR.getFullName(email);
			
			response.put("code", 200);
			response.put("fullname", fullname);
			response.put("menulist", menulist);
		}catch(Exception e)
		{
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
	
	//Get Profile Information
	public Object getProfile(String token)
	{
		Map<String, Object> response = new HashMap<>();
		try
		{
			Map<String, Object> payload = JWT.validateToken(token);
			
			String email = payload.get("username").toString();
			
			Object user = UR.getProfile(email);
			
			response.put("code", 200);
			response.put("user", user);			
		}catch(Exception e)
		{
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
	
	//Fetch all users using pagination
	public Object getAllUsers(int page, int size, String token)
	{
		Map<String, Object> response = new HashMap<>();
		try
		{
			JWT.validateToken(token); //Authorization
			Pageable pageable = PageRequest.of(page - 1, size, Sort.by("id").ascending());
			Page<Users> users = UR.findAll(pageable);
			
			List<Roles> roles = RR.findAll();
			
			response.put("code", 200);
			response.put("page", page);
			response.put("size", size);
			response.put("totalpages", users.getTotalPages());
			response.put("users", users.getContent());
			response.put("roles", roles);
		}catch(Exception e)
		{
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
	
	//Save User
	public Object saveUser(Users U, String token)
	{
		Map<String, Object> response = new HashMap<>();
		try
		{
			JWT.validateToken(token); //Authorization
			
			Object id = UR.checkEmail(U.getEmail());
			if(id != null)
				throw new Exception("Email ID already registered!");
			
			UR.save(U); //Create (or) Insert Operation

			if (U.getRole() == 2) {
				ServiceProviders provider = new ServiceProviders();
				provider.setUser(U);
				provider.setName(U.getFullname());
				provider.setRating(5.0);
				provider.setSpecialization("General");
				provider.setAvailability("{\"Monday\":\"09:00-17:00\",\"Tuesday\":\"09:00-17:00\",\"Wednesday\":\"09:00-17:00\",\"Thursday\":\"09:00-17:00\",\"Friday\":\"09:00-17:00\"}");
				SPR.save(provider);
			}
			
			response.put("code", 200);
			response.put("message", "New user has been created");
		}catch(Exception e)
		{
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
	
	//Get User by ID
	public Object getUserByID(Long id, String token)
	{
		Map<String, Object> response = new HashMap<>();
		try
		{
			JWT.validateToken(token); // Authorization
			
			Users user = UR.findById(id).get(); 
			
			response.put("code", 200);
			response.put("user", user);
		}catch(Exception e)
		{
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
	
	//Update User
	public Object updateUser(Long id, Users U, String token)
	{
		Map<String, Object> response = new HashMap<>();
		try
		{
			JWT.validateToken(token); // Authorization
			
			Users temp = UR.findById(id).get();
			temp.setFullname(U.getFullname());
			temp.setPhone(U.getPhone());
			temp.setRole(U.getRole());
			temp.setEmail(U.getEmail());
			temp.setPassword(U.getPassword());
			
			UR.save(temp); // Update changes into database
			
			response.put("code", 200);
			response.put("message", "User has been updated");
		}catch(Exception e)
		{
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
	
	//Delete User
	public Object deleteUser(Long id, String token)
	{
		Map<String, Object> response = new HashMap<>();
		try
		{
			JWT.validateToken(token); //Authorization
			
			UR.deleteById(id); // Delete user 
			
			response.put("code", 200);
			response.put("message", "User has been deleted");
		}catch(Exception e)
		{
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
	
	//Search User
	public Object searchUser(String key)
	{
		Map<String, Object> response = new HashMap<>();
		try
		{
			List<Object> users = UR.searchUser(key);
			
			response.put("code", 200);
			response.put("users", users);
		}catch(Exception e)
		{
			response.put("code", 500);
			response.put("message", e.getMessage());
		}
		return response;
	}
}
