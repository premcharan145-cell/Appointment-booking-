import React, { useEffect, useState } from 'react';
import './Home.css';
import { apibaseurl, callApi } from '../lib';
import ProgressBar from './ProgressBar';
import Profile from './Profile';
import UserManager from './UserManager';
import BookAppointment from './BookAppointment';
import ManageAvailability from './ManageAvailability';
import ProviderAppointments from './ProviderAppointments';
import ProviderManager from './ProviderManager';
import AnalyticsDashboard from './AnalyticsDashboard';
import MembersManager from './MembersManager';
import {
    BookIcon, CalendarIcon,
    ListIcon, UsersIcon, ProvidersIcon, AnalyticsIcon, UserIcon, LogoutIcon
} from './Icons';

// Frontend-only feature: not part of the backend RBAC menu list
const MEMBERS_MENU = { mid: "members", menu: "Members" };

// Sidebar order: Members first, then Book Appointment (2), then Profile (11);
// any other role-specific items follow in their original order.
const MENU_ORDER = { members: 0, 2: 1, 11: 2 };
const menuRank = (mid) => (mid in MENU_ORDER ? MENU_ORDER[mid] : 50);

// Menu items removed from the frontend (Appointment History = 3, Recommendations = 4, Notifications = 5)
const HIDDEN_MIDS = [3, 4, 5];

// Override backend menu labels on the frontend (mid 2 lists booked appointments)
const MENU_LABELS = { 2: "Booked Appointments" };
const menuLabel = (m) => MENU_LABELS[m.mid] || m.menu;

const Home = () => {
    const [fullname, setFullname] = useState("");
    const [isProgress, setIsProgress] = useState(false);
    const [token, setToken] = useState("");
    const [menuList, setMenuList] = useState([]);
    const [activeComponent, setActiveComponent] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);

    useEffect(() => {
        const storedtoken = localStorage.getItem("token");
        if (!storedtoken) {
            logout();
        } else {
            setToken(storedtoken);
            setIsProgress(true);
            callApi("GET", apibaseurl + "/authservice/rbac", null, null, loadRBAC, storedtoken);
        }
    }, []);

    function loadRBAC(res) {
        setIsProgress(false);
        if (res.code !== 200) {
            logout();
            return;
        }
        setFullname(res.fullname);
        // Persist for frontend-only features (e.g. local appointment bookings)
        localStorage.setItem("fullname", res.fullname || "");
        // Drop menu items that have been removed from the frontend
        const visibleMenus = (res.menulist || []).filter(m => !HIDDEN_MIDS.includes(m.mid));
        setMenuList(visibleMenus);

        // Members is the default landing page
        setActiveMenu(MEMBERS_MENU.mid);
        setActiveComponent(getComponentForMenu(MEMBERS_MENU.mid));
    }

    function logout() {
        localStorage.clear();
        window.location.replace("/");
    }

    function getComponentForMenu(mid) {
        const components = {
            2: <BookAppointment logout={logout} />,
            6: <ManageAvailability logout={logout} />,
            7: <ProviderAppointments logout={logout} />,
            8: <UserManager logout={logout} />,
            9: <ProviderManager logout={logout} />,
            10: <AnalyticsDashboard logout={logout} />,
            11: <Profile logout={logout} />,
            members: <MembersManager />
        };
        return components[mid] || <Profile logout={logout} />;
    }

    function loadModule(mid) {
        setIsProgress(true);
        setActiveMenu(mid);
        setActiveComponent(getComponentForMenu(mid));
        setIsProgress(false);
    }

    const getMenuIcon = (mid) => {
        const icons = {
            2: <BookIcon />,
            6: <CalendarIcon />,
            7: <ListIcon />,
            8: <UsersIcon />,
            9: <ProvidersIcon />,
            10: <AnalyticsIcon />,
            11: <UserIcon />,
            members: <UsersIcon />
        };
        return icons[mid] || <UserIcon />;
    };

    return (
        <div className='home'>
            <div className='home-header'>
                <div className="logo-area">
                    <div className="logo-icon">S</div>
                    <div className="logo-text">Smart<span>Book</span></div>
                </div>
                <div className='info'>
                    <div className="avatar">
                        {fullname ? fullname.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span>{fullname}</span>
                    <button className="logout-btn" onClick={() => logout()} title="Logout">
                        <LogoutIcon size={18} />
                    </button>
                </div>
            </div>
            
            <div className='home-workspace'>
                <div className='home-menus'>
                    <ul>
                        {[MEMBERS_MENU, ...menuList]
                            .sort((a, b) => menuRank(a.mid) - menuRank(b.mid))
                            .map((m) => (
                                <li
                                    key={m.mid}
                                    className={activeMenu === m.mid ? 'active' : ''}
                                    onClick={() => loadModule(m.mid)}
                                >
                                    {getMenuIcon(m.mid)}
                                    <span>{menuLabel(m)}</span>
                                </li>
                            ))}
                    </ul>
                </div>
                <div className='home-content'>{activeComponent}</div>
            </div>
            
            <div className='home-footer'>Copyright @ 2026. All rights reserved.</div>

            <ProgressBar isProgress={isProgress}/>
        </div>
    );
}

export default Home;
