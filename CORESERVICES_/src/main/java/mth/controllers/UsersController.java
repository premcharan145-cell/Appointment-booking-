package mth.controllers;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mth.models.Users;
import mth.services.UsersService;

@RestController
@RequestMapping("/user")
public class UsersController {

	@Autowired
	UsersService US;
	
	@PostMapping("/signup")
	public Object signup(@RequestBody Users U)
	{
		return US.signup(U); 
	}
	
	@PostMapping("/signin")
	public Object signin(@RequestBody Map<String, Object> data)
	{
		return US.signin(data);
	}

	@PostMapping("/forgot-password")
	public Object forgotPassword(@RequestBody Map<String, Object> data)
	{
		return US.forgotPassword(data);
	}
		
	@GetMapping("/rbac")
	public Object rbac(@RequestHeader("Token") String token)
	{
		return US.rbac(token);
	}
	
	@GetMapping("/profile")
	public Object getProfile(@RequestHeader("Token") String token)
	{
		return US.getProfile(token);
	}
	
	@GetMapping("/getallusers/{PAGE}/{SIZE}")
	public Object getAllUsers(@PathVariable("PAGE") int page,@PathVariable("SIZE") int size,@RequestHeader String Token)
	{
		return US.getAllUsers(page, size, Token);
	}
	
	@PostMapping("/saveuser")
	public Object saveUser(@RequestBody Users U, @RequestHeader String Token)
	{
		return US.saveUser(U, Token);
	}
	
	@GetMapping("/getuser/{ID}")
	public Object getUser(@PathVariable("ID") Long id,@RequestHeader String Token)
	{
		return US.getUserByID(id, Token);
	}
	
	@PutMapping("/updateuser/{ID}")
	public Object updateUser(@PathVariable("ID") Long id, @RequestBody Users U, @RequestHeader String Token)
	{
		return US.updateUser(id, U, Token);
	}
	
	@DeleteMapping("/deleteuser/{ID}")
	public Object deleteUser(@PathVariable("ID") Long id, @RequestHeader String Token)
	{
		return US.deleteUser(id, Token);
	}
	
	@GetMapping("/searchuser/{KEY}")
	public Object searchUser(@PathVariable("KEY") String key)
	{
		return US.searchUser(key);
	}
}
