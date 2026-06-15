package mth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global CORS configuration so the React frontend (running on a different
 * origin/port, e.g. http://localhost:5173) can call every endpoint, including
 * the auth endpoints under /user/* used for sign in / sign up / forgot password.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**")
				.allowedOriginPatterns("*")
				.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
				.allowedHeaders("*")
				.exposedHeaders("Token")
				.allowCredentials(true)
				.maxAge(3600);
	}
}
