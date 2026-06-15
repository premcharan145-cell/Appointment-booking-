import React, { useEffect, useState } from 'react';
import { apibaseurl, callApi } from '../lib';
import { CalendarIcon } from './Icons';
import { to12 } from '../membersData';
import './Members.css';

function initials(name) {
    if (!name) return "?";
    const parts = name.replace(/^(Dr\.?|Prof\.?|Mr\.?|Mrs\.?|Ms\.?)\s*/i, "").trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

// "14:00:00" -> "02:00 PM"
function fmt(t) {
    return to12((t || "").substring(0, 5));
}

const BookAppointment = ({ logout }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAppointments();
    }, []);

    function loadAppointments() {
        setLoading(true);
        const token = localStorage.getItem("token");
        callApi("GET", apibaseurl + "/api/appointments", null, null, (res) => {
            setLoading(false);
            if (res.code === 200 && res.appointments) {
                // Newest first
                setAppointments([...res.appointments].reverse());
            } else {
                alert(res.message || "Failed to load appointments");
            }
        }, token);
    }

    function cancelAppointment(id) {
        if (!window.confirm("Cancel this appointment?")) return;
        setLoading(true);
        const token = localStorage.getItem("token");
        callApi("PUT", apibaseurl + `/api/appointments/${id}/status`, { status: "CANCELLED" }, null, (res) => {
            setLoading(false);
            if (res.code === 200) {
                alert("Appointment cancelled");
                loadAppointments();
            } else {
                alert(res.message || "Failed to cancel appointment");
            }
        }, token);
    }

    return (
        <div className="members-page">
            <div className="mp-head">
                <div>
                    <h1 className="mp-title">Booked Appointments</h1>
                    <p className="mp-subtitle">Your booked appointments with lecturers.</p>
                </div>
            </div>

            {loading && <div className="mp-empty">Loading…</div>}

            {!loading && appointments.length === 0 ? (
                <div className="mp-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <CalendarIcon size={32} />
                    No appointments booked yet.
                </div>
            ) : (
                <div className="mp-appt-list">
                    {appointments.map((a) => {
                        const status = (a.status || "").toLowerCase();
                        return (
                            <div key={a.appointmentId} className="mp-appt-card">
                                <div className="mp-appt-info">
                                    <div className="mp-appt-avatar">{initials(a.provider ? a.provider.name : "?")}</div>
                                    <div>
                                        <div className="mp-appt-name">{a.provider ? a.provider.name : "N/A"}</div>
                                        <div className="mp-appt-subject">{a.provider ? a.provider.specialization : ""}</div>
                                        <div className="mp-appt-when">
                                            {a.appointmentDate} · {fmt(a.startTime)} – {fmt(a.endTime)}
                                        </div>
                                    </div>
                                </div>
                                <div className="mp-appt-right">
                                    <span className={`mp-status ${status}`}>{a.status}</span>
                                    {(a.status === "PENDING" || a.status === "CONFIRMED") && (
                                        <button className="mp-cancel-btn" onClick={() => cancelAppointment(a.appointmentId)}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BookAppointment;
