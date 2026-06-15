import React, { useEffect, useState } from 'react';
import { apibaseurl, callApi } from '../lib';
import { RecommendIcon, CalendarIcon, StarIcon } from './Icons';
import './BookingSystem.css';

const Recommendations = ({ logout }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        loadUserProfile();
    }, []);

    function loadUserProfile() {
        setLoading(true);
        const token = localStorage.getItem("token");
        callApi("GET", apibaseurl + "/authservice/profile", null, null, (res) => {
            if (res.code === 200) {
                // profile endpoint returns [Users, Roles] array
                const userObj = Array.isArray(res.user) ? res.user[0] : res.user;
                if (userObj && userObj.id) {
                    setUserId(userObj.id);
                    loadRecommendations(userObj.id, token);
                } else {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        }, token);
    }

    function loadRecommendations(uid, token) {
        callApi("GET", apibaseurl + `/api/recommendations/${uid}`, null, null, (res) => {
            setLoading(false);
            if (res.code === 200) {
                setRecommendations(res.recommendations);
            } else {
                alert(res.message || "Failed to load suggestions");
            }
        }, token);
    }

    function bookRecommendedSlot(rec) {
        if (!window.confirm(`Would you like to book this suggested slot with ${rec.provider.name}?`)) {
            return;
        }

        setLoading(true);
        const token = localStorage.getItem("token");

        // Parse slot: "YYYY-MM-DD HH:MM-HH:MM" -> e.g. "2026-06-15 10:00:00"
        const parts = rec.suggestedSlot.split(" ");
        const date = parts[0];
        const times = parts[1].split("-");
        const start = times[0].length === 5 ? times[0] + ":00" : times[0];
        const end = times[1].length === 5 ? times[1] + ":00" : times[1];

        const payload = {
            provider: { providerId: rec.provider.providerId },
            appointmentDate: date,
            startTime: start,
            endTime: end
        };

        callApi("POST", apibaseurl + "/api/appointments", payload, null, (res) => {
            setLoading(false);
            if (res.code === 200) {
                alert("Appointment booked successfully!");
                // Reload recommendations to clear booked slot
                setLoading(true);
                loadRecommendations(userId, token);
            } else {
                alert(res.message || "Unable to book this slot.");
            }
        }, token);
    }

    return (
        <div className="recommendations-view">
            <div className="dashboard-title">
                <RecommendIcon size={24} /> AI-Powered Recommendations
            </div>

            <p style={{color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '14px'}}>
                Our smart recommendation engine analyzes your preferred timings, frequent bookings, and top provider ratings to suggest conflict-free slots over the next 3 days.
            </p>

            {loading && <div className="progress" />}

            <div className="recommendation-list">
                {recommendations.map((rec) => (
                    <div key={rec.recommendationId} className="glass-panel rec-card">
                        <div className="info-col">
                            <div className="provider-name">{rec.provider.name}</div>
                            <div style={{color: 'var(--text-secondary)', fontSize: '13px', marginTop: '-4px'}}>
                                Specialization: <strong>{rec.provider.specialization}</strong>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', gap: '5px', color: 'gold', fontSize: '13px', margin: '4px 0'}}>
                                <StarIcon fill="gold" color="gold" size={14} />
                                {rec.provider.rating ? rec.provider.rating.toFixed(1) : "5.0"} Rating
                            </div>
                            <div className="slot-time">
                                <CalendarIcon size={16} /> {rec.suggestedSlot}
                            </div>
                        </div>
                        <button className="btn-primary" onClick={() => bookRecommendedSlot(rec)}>
                            Book Instantly
                        </button>
                    </div>
                ))}

                {recommendations.length === 0 && !loading && (
                    <div className="glass-panel" style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '50px 20px'}}>
                        No recommendation slots available at this time. Try booking some appointments to populate history!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Recommendations;
