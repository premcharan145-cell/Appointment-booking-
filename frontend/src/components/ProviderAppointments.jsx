import React, { useEffect, useState } from 'react';
import { apibaseurl, callApi } from '../lib';
import { ListIcon, CheckIcon, XIcon, StarIcon } from './Icons';
import './BookingSystem.css';

const ProviderAppointments = ({ logout }) => {
    const [appointments, setAppointments] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [activeTab, setActiveTab] = useState("PENDING");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAppointments();
    }, []);

    function loadAppointments() {
        setLoading(true);
        const token = localStorage.getItem("token");
        callApi("GET", apibaseurl + "/api/appointments", null, null, (res) => {
            setLoading(false);
            if (res.code === 200) {
                setAppointments(res.appointments);
            }
        }, token);
    }

    useEffect(() => {
        let result = appointments;
        if (activeTab === "HISTORY") {
            result = result.filter(a => a.status === "COMPLETED" || a.status === "CANCELLED");
        } else {
            result = result.filter(a => a.status === activeTab);
        }
        setFiltered(result);
    }, [activeTab, appointments]);

    function updateStatus(id, newStatus) {
        if (!window.confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) {
            return;
        }
        setLoading(true);
        const token = localStorage.getItem("token");
        callApi("PUT", apibaseurl + `/api/appointments/${id}/status`, { status: newStatus }, null, (res) => {
            setLoading(false);
            if (res.code === 200) {
                alert(`Appointment status updated to ${newStatus}`);
                loadAppointments();
            } else {
                alert(res.message || "Failed to update status");
            }
        }, token);
    }

    return (
        <div className="provider-appointments-component">
            <div className="dashboard-title">
                <ListIcon size={24} /> Manage Bookings & Requests
            </div>

            <div className="tabs-bar">
                <button className={`tab-btn ${activeTab === 'PENDING' ? 'active' : ''}`} onClick={() => setActiveTab("PENDING")}>
                    Pending Requests
                </button>
                <button className={`tab-btn ${activeTab === 'CONFIRMED' ? 'active' : ''}`} onClick={() => setActiveTab("CONFIRMED")}>
                    Confirmed Schedule
                </button>
                <button className={`tab-btn ${activeTab === 'HISTORY' ? 'active' : ''}`} onClick={() => setActiveTab("HISTORY")}>
                    Archived History
                </button>
            </div>

            {loading && <div className="progress" />}

            <div className="glass-panel table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Customer Name</th>
                            <th>Mobile Number</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            {activeTab !== "HISTORY" && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((a) => (
                            <tr key={a.appointmentId}>
                                <td>#{a.appointmentId}</td>
                                <td>
                                    <strong>{a.user ? a.user.fullname : "N/A"}</strong> <br/>
                                    <span style={{fontSize: '8.5pt', color: 'var(--text-secondary)'}}>
                                        {a.user ? a.user.email : ""}
                                    </span>
                                </td>
                                <td>{a.user ? a.user.phone : "N/A"}</td>
                                <td>{a.appointmentDate}</td>
                                <td>{a.startTime.substring(0, 5)} - {a.endTime.substring(0, 5)}</td>
                                <td>
                                    <span className={`status-badge status-${a.status.toLowerCase()}`}>
                                        {a.status}
                                    </span>
                                </td>
                                {activeTab !== "HISTORY" && (
                                    <td>
                                        {a.status === "PENDING" && (
                                            <div style={{display: 'flex', gap: '8px'}}>
                                                <button className="btn-primary" style={{padding: '6px 12px', fontSize: '11px', gap: '4px', background: 'var(--status-confirmed)', boxShadow: 'none'}} onClick={() => updateStatus(a.appointmentId, "CONFIRMED")}>
                                                    <CheckIcon size={12} /> Confirm
                                                </button>
                                                <button className="btn-secondary" style={{padding: '6px 12px', fontSize: '11px', gap: '4px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)'}} onClick={() => updateStatus(a.appointmentId, "CANCELLED")}>
                                                    <XIcon size={12} /> Reject
                                                </button>
                                            </div>
                                        )}
                                        {a.status === "CONFIRMED" && (
                                            <div style={{display: 'flex', gap: '8px'}}>
                                                <button className="btn-primary" style={{padding: '6px 12px', fontSize: '11px', gap: '4px', background: 'var(--status-completed)', boxShadow: 'none'}} onClick={() => updateStatus(a.appointmentId, "COMPLETED")}>
                                                    <CheckIcon size={12} /> Mark Completed
                                                </button>
                                                <button className="btn-secondary" style={{padding: '6px 12px', fontSize: '11px', gap: '4px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)'}} onClick={() => updateStatus(a.appointmentId, "CANCELLED")}>
                                                    <XIcon size={12} /> Cancel
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filtered.length === 0 && !loading && (
                <div style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '50px 0'}}>
                    No appointments in this tab.
                </div>
            )}
        </div>
    );
};

export default ProviderAppointments;
