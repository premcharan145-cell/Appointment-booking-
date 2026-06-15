package mth.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "menus")
public class Menus {

	@Id
	Long mid;
	String menu;
	String micon;
	public Long getMid() {
		return mid;
	}
	public void setMid(Long mid) {
		this.mid = mid;
	}
	public String getMenu() {
		return menu;
	}
	public void setMenu(String menu) {
		this.menu = menu;
	}
	public String getMicon() {
		return micon;
	}
	public void setMicon(String micon) {
		this.micon = micon;
	}
}
