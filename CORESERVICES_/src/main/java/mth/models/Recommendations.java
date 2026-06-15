package mth.models;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "recommendations")
public class Recommendations {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long recommendationId;

	@ManyToOne
	@JoinColumn(name = "user_id", referencedColumnName = "id")
	private Users user;

	@ManyToOne
	@JoinColumn(name = "provider_id", referencedColumnName = "providerId")
	private ServiceProviders provider;

	private String suggestedSlot; // e.g. "Monday 10:00-11:00" or "YYYY-MM-DD HH:MM"

	public Long getRecommendationId() {
		return recommendationId;
	}

	public void setRecommendationId(Long recommendationId) {
		this.recommendationId = recommendationId;
	}

	public Users getUser() {
		return user;
	}

	public void setUser(Users user) {
		this.user = user;
	}

	public ServiceProviders getProvider() {
		return provider;
	}

	public void setProvider(ServiceProviders provider) {
		this.provider = provider;
	}

	public String getSuggestedSlot() {
		return suggestedSlot;
	}

	public void setSuggestedSlot(String suggestedSlot) {
		this.suggestedSlot = suggestedSlot;
	}
}
