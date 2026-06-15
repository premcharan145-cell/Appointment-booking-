import React, { useEffect, useState } from 'react';
import { apibaseurl, callApi } from '../lib';
import { SearchIcon, XIcon } from './Icons';
import { MEMBERS } from '../membersData';
import './Members.css';

const AVATAR_COLORS = [
    "#2563eb", "#0891b2", "#7c3aed", "#db2777", "#ea580c",
    "#16a34a", "#0d9488", "#9333ea", "#dc2626", "#ca8a04",
];

function initials(name) {
    const parts = name.replace(/^(Dr\.?|Prof\.?|Mr\.?|Mrs\.?|Ms\.?)\s*/i, "").trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

function shortDay(d) {
    return d.slice(0, 3);
}

const MembersManager = () => {
    // The 10 members are rendered from static data so the cards always appear.
    const lecturers = MEMBERS.map((m) => ({
        name: m.name,
        subject: m.subject,
        days: m.availableDays,
        timeSlot: m.timeSlot,
        defaultStart: m.defaultStart,
        defaultEnd: m.defaultEnd,
        login: m.login,
    }));
    const [showSearch, setShowSearch] = useState(false);
    const [query, setQuery] = useState("");
    const [bookTarget, setBookTarget] = useState(null);
    const [booking, setBooking] = useState({ appointmentDate: "", startTime: "", endTime: "" });
    const [submitting, setSubmitting] = useState(false);
    // Map lecturer name -> real DB providerId (booking must target the right provider).
    const [providerIdByName, setProviderIdByName] = useState({});

    useEffect(() => {
        const token = localStorage.getItem("token");
        callApi("GET", apibaseurl + "/api/providers", null, null, (res) => {
            if (res.code === 200 && res.providers) {
                const map = {};
                res.providers.forEach((p) => { map[p.name] = p.providerId; });
                setProviderIdByName(map);
            }
        }, token);
    }, []);

    const q = query.trim().toLowerCase();
    const filtered = lecturers.filter((m) =>
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        (m.days || []).some((d) => d.toLowerCase().includes(q))
    );

    function openBook(m) {
        setBookTarget(m);
        setBooking({ appointmentDate: "", startTime: m.defaultStart || "", endTime: m.defaultEnd || "" });
    }

    function confirmBooking(e) {
        e.preventDefault();
        if (!booking.appointmentDate || !booking.startTime || !booking.endTime) {
            alert("Please fill in all booking fields");
            return;
        }
        const providerId = providerIdByName[bookTarget.name];
        if (!providerId) {
            alert("This lecturer is not available for booking right now. Please try again in a moment.");
            return;
        }
        setSubmitting(true);
        const token = localStorage.getItem("token");
        const payload = {
            provider: { providerId },
            appointmentDate: booking.appointmentDate,
            startTime: booking.startTime + ":00",
            endTime: booking.endTime + ":00",
        };
        callApi("POST", apibaseurl + "/api/appointments", payload, null, (res) => {
            setSubmitting(false);
            if (res.code === 200) {
                alert(res.message || "Appointment booked successfully. See it under 'Booked Appointments'.");
                setBookTarget(null);
            } else {
                alert(res.message || "Conflict: Unable to book this slot.");
            }
        }, token);
    }

    return (
        <div className="members-page">
            <div className="mp-head">
                <div>
                    <h1 className="mp-title">Members (Lecturers)</h1>
                    <p className="mp-subtitle">View lecturer details and book an appointment.</p>
                </div>
                <button className="mp-filter-btn" onClick={() => setShowSearch((s) => !s)}>
                    <SearchIcon size={15} /> Filter / Search
                </button>
            </div>

            {showSearch && (
                <div className="mp-search">
                    <input
                        type="text"
                        placeholder="Search by name, subject or day..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                </div>
            )}

            <div className="mp-grid">
                {filtered.length === 0 ? (
                    <div className="mp-empty">No lecturers found.</div>
                ) : filtered.map((m, i) => (
                    <div key={m.name} className="mp-card">
                        <div className="mp-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                            {initials(m.name)}
                        </div>
                        <div className="mp-name">{m.name}</div>
                        <div className="mp-subject">{m.subject}</div>

                        <div className="mp-field-label">Available Days</div>
                        <div className="mp-field-value">{(m.days || []).map(shortDay).join(", ")}</div>

                        <div className="mp-field-label">Time Slot</div>
                        <div className="mp-field-value">{m.timeSlot}</div>

                        <button className="mp-book-btn" onClick={() => openBook(m)}>
                            Book Appointment
                        </button>
                    </div>
                ))}
            </div>

            <div className="mp-note">
                Each lecturer is available on exactly the days listed in a week. Please check the available days and time before booking.
            </div>

            {bookTarget && (
                <div className="mp-overlay">
                    <div className="mp-modal">
                        <div className="mp-modal-head">
                            <div className="mp-modal-title">Book Appointment</div>
                            <span className="mp-modal-close" onClick={() => setBookTarget(null)}><XIcon /></span>
                        </div>
                        <div className="mp-modal-sub">
                            <strong>{bookTarget.name}</strong> — {bookTarget.subject}<br />
                            Available: {(bookTarget.days || []).map(shortDay).join(", ")} · {bookTarget.timeSlot}
                        </div>
                        <form onSubmit={confirmBooking}>
                            <div className="mp-form-field">
                                <label>Date</label>
                                <input
                                    type="date"
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    value={booking.appointmentDate}
                                    onChange={(e) => setBooking({ ...booking, appointmentDate: e.target.value })}
                                />
                            </div>
                            <div className="mp-form-field">
                                <label>Start Time</label>
                                <input
                                    type="time"
                                    required
                                    value={booking.startTime}
                                    onChange={(e) => setBooking({ ...booking, startTime: e.target.value })}
                                />
                            </div>
                            <div className="mp-form-field">
                                <label>End Time</label>
                                <input
                                    type="time"
                                    required
                                    value={booking.endTime}
                                    onChange={(e) => setBooking({ ...booking, endTime: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="mp-confirm-btn" disabled={submitting}>
                                {submitting ? "Booking…" : "Confirm Booking"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembersManager;
