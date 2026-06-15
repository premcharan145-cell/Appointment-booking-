package mth.services;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JWTService {

	final String SECRETE_KEY = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0987654321";
	final SecretKey key = Keys.hmacShaKeyFor(SECRETE_KEY.getBytes());
	
	//Generate Token
	public Object generateToken(Object username, Object role, Object id)
	{
		Map<String, Object> payload = new HashMap<>();
		payload.put("username", username);
		payload.put("role", role);
		payload.put("crid", id);
		
		return Jwts.builder()
				.claims(payload)
				.issuedAt(new Date())
				.expiration(new Date(new Date().getTime() + 86400000))
				.signWith(key)
				.compact();
	}
	
	//Validating Token
	public Map<String, Object> validateToken(String token) throws Exception
	{
		Claims claims = Jwts.parser()
							.verifyWith(key)
							.build()
							.parseSignedClaims(token)
							.getPayload();
		
		Date expity = claims.getExpiration();
		if(expity == null || expity.before(new Date()))
			throw new Exception("Invalid Token!");
		
		Map<String, Object> payload =  new HashMap<>();
		payload.put("username", claims.get("username"));
		payload.put("role", claims.get("role"));
		
		return payload;
	}
}
