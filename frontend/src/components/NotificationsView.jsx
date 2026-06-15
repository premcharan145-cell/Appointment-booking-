import React, { useEffect, useState } from 'react';
import { apibaseurl, callApi } from '../lib';
import { BellIcon, CheckIcon } from './Icons';
import './BookingSystem.css';

const NotificationsView = ({ logout }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadNotifications();
    }, []);

    function loadNotifications() {
        setLoading(true);
        const token = localStorage.getItem("token");
        callApi("GET", apibaseurl + "/api/notifications", null, null, (res) => {
            setLoading(false);
            if (res.code === 200) {
                setNotifications(res.notifications);
                setUnreadCount(res.unreadCount);
            }
        }, token);
    }

    function markRead(id) {
        setLoading(true);
        const token = localStorage.getItem("token");
        callApi("PUT", apibaseurl + `/api/notifications/${id}/read`, null, null, (res) => {
            if (res.code === 200) {
                loadNotifications();
            } else {
                setLoading(false);
            }
        }, token);
    }

    function formatDateTime(dateTimeStr) {
        try {
            const date = new Date(dateTimeStr);
            return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return dateTimeStr;
        }
    }

    return (
        <div className="notifications-view-component">
            <div className="dashboard-title" style={{justifyContent: 'space-between'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <BellIcon size={24} /> Notifications
                </div>
                {unreadCount > 0 && (
                    <span className="status-badge status-pending" style={{fontSize: '10pt'}}>
                        {unreadCount} Unread
                    </span>
                )}
            </div>

            {loading && <div className="progress" />}

            <div className="notification-list">
                {notifications.map((n) => (
                    <div 
                        key={n.notificationId} 
                        className={`glass-panel notification-item ${!n.isRead ? 'unread' : ''}`}
                    >
                        <div className="content-col">
                            <div className="msg" style={{fontWeight: !n.isRead ? '600' : 'normal'}}>
                                {n.message}
                            </div>
                            <div className="time">{formatDateTime(n.createdAt)}</div>
                        </div>
                        {!n.isRead && (
                            <button 
                                className="btn-secondary" 
                                style={{padding: '6px 12px', fontSize: '11px', display: 'flex', gap: '4px', alignItems: 'center'}}
                                onClick={() => markRead(n.notificationId)}
                            >
                                <CheckIcon size={12} /> Mark Read
                            </button>
                        )}
                    </div>
                ))}

                {notifications.length === 0 && !loading && (
                    <div className="glass-panel" style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '50px 20px'}}>
                        Your notification tray is empty.
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsView;
