import React, { useEffect, useState } from 'react';
import { apibaseurl, callApi } from '../lib';
import { CalendarIcon, CheckIcon } from './Icons';
import './BookingSystem.css';

const ManageAvailability = ({ logout }) => {
    const [providerId, setProviderId] = useState(null);
    const [name, setName] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [rating, setRating] = useState(5.0);
    const [availability, setAvailability] = useState({
        Monday: { active: false, start: "09:00", end: "17:00" },
        Tuesday: { active: false, start: "09:00", end: "17:00" },
        Wednesday: { active: false, start: "09:00", end: "17:00" },
        Thursday: { active: false, start: "09:00", end: "17:00" },
        Friday: { active: false, start: "09:00", end: "17:00" },
        Saturday: { active: false, start: "09:00", end: "17:00" },
        Sunday: { active: false, start: "09:00", end: "17:00" },
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    function loadProfile() {
        setLoading(true);
        const token = localStorage.getItem("token");
        callApi("GET", apibaseurl + "/api/providers/profile", null, null, (res) => {
            setLoading(false);
            if (res.code === 200 && res.provider) {
                setProviderId(res.provider.providerId);
                setName(res.provider.name);
                setSpecialization(res.provider.specialization);
                setRating(res.provider.rating);
                parseAvailability(res.provider.availability);
            }
        }, token);
    }

    function parseAvailability(availStr) {
        if (!availStr) return;
        try {
            const parsed = JSON.parse(availStr);
            const updated = { ...availability };
            
            // reset all first
            Object.keys(updated).forEach(day => {
                updated[day].active = false;
            });

            // fill active ones
            Object.entries(parsed).forEach(([day, times]) => {
                if (updated[day]) {
                    const parts = times.split("-");
                    updated[day].active = true;
                    updated[day].start = parts[0];
                    updated[day].end = parts[1];
                }
            });
            setAvailability(updated);
        } catch (e) {
            console.error("Failed to parse availability JSON string: ", availStr);
        }
    }

    function toggleDay(day) {
        setAvailability({
            ...availability,
            [day]: { ...availability[day], active: !availability[day].active }
        });
    }

    function handleTimeChange(day, field, value) {
        setAvailability({
            ...availability,
            [day]: { ...availability[day], [field]: value }
        });
    }

    function saveAvailability(e) {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("token");

        // Format as JSON object
        const activeAvailability = {};
        Object.entries(availability).forEach(([day, settings]) => {
            if (settings.active) {
                activeAvailability[day] = `${settings.start}-${settings.end}`;
            }
        });

        const payload = {
            providerId: providerId,
            name: name,
            specialization: specialization,
            rating: rating,
            availability: JSON.stringify(activeAvailability)
        };

        callApi("POST", apibaseurl + "/api/providers", payload, null, (res) => {
            setLoading(false);
            if (res.code === 200) {
                alert("Working schedule saved successfully!");
                loadProfile();
            } else {
                alert(res.message || "Failed to save schedule");
            }
        }, token);
    }

    return (
        <div className="manage-availability">
            <div className="dashboard-title">
                <CalendarIcon size={24} /> Manage Availability Schedule
            </div>

            <p style={{color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '14px'}}>
                Set your active workdays and standard office hours. Customers will only be able to schedule appointments with you during these designated periods.
            </p>

            {loading && <div className="progress" />}

            <form onSubmit={saveAvailability} className="glass-panel" style={{padding: '20px'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                    {Object.entries(availability).map(([day, settings]) => (
                        <div key={day} className="availability-day-row">
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <input 
                                    type="checkbox" 
                                    id={`check-${day}`}
                                    checked={settings.active}
                                    onChange={() => toggleDay(day)}
                                    style={{cursor: 'pointer', width: '16px', height: '16px'}}
                                />
                                <label htmlFor={`check-${day}`} className="day-name" style={{cursor: 'pointer', fontSize: '14px'}}>
                                    {day}
                                </label>
                            </div>
                            
                            {settings.active ? (
                                <div className="inputs">
                                    <input 
                                        type="time" 
                                        value={settings.start}
                                        onChange={(e) => handleTimeChange(day, "start", e.target.value)}
                                        required
                                    />
                                    <span style={{color: 'var(--text-muted)'}}>to</span>
                                    <input 
                                        type="time" 
                                        value={settings.end}
                                        onChange={(e) => handleTimeChange(day, "end", e.target.value)}
                                        required
                                    />
                                </div>
                            ) : (
                                <span style={{fontSize: '13px', color: 'var(--text-muted)'}}>Unavailable / Day Off</span>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{marginTop: '25px', display: 'flex', justifyContent: 'flex-end'}}>
                    <button type="submit" className="btn-primary" style={{padding: '12px 30px'}}>
                        <CheckIcon size={18} /> Save Work Schedule
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ManageAvailability;
