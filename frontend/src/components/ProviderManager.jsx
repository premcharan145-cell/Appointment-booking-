import React, { useEffect, useState } from 'react';
import { apibaseurl, callApi } from '../lib';
import { ProvidersIcon, EditIcon, XIcon, CheckIcon } from './Icons';
import './BookingSystem.css';

const ProviderManager = ({ logout }) => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [editData, setEditData] = useState({
        name: "",
        specialization: "",
        rating: 5.0,
        availability: ""
    });

    useEffect(() => {
        loadProviders();
    }, []);

    function loadProviders() {
        setLoading(true);
        const token = localStorage.getItem("token");
        callApi("GET", apibaseurl + "/api/providers", null, null, (res) => {
            setLoading(false);
            if (res.code === 200) {
                setProviders(res.providers);
            }
        }, token);
    }

    function openEdit(p) {
        setEditTarget(p);
        setEditData({
            name: p.name,
            specialization: p.specialization,
            rating: p.rating,
            availability: p.availability
        });
    }

    function handleEditSubmit(e) {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("token");
        
        callApi("PUT", apibaseurl + `/api/providers/${editTarget.providerId}`, editData, null, (res) => {
            setLoading(false);
            if (res.code === 200) {
                alert("Provider settings updated successfully");
                setEditTarget(null);
                loadProviders();
            } else {
                alert(res.message || "Failed to update provider settings");
            }
        }, token);
    }

    return (
        <div className="provider-manager-component">
            <div className="dashboard-title">
                <ProvidersIcon size={24} /> Provider Management Directory
            </div>

            {loading && <div className="progress" />}

            <div className="glass-panel table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Provider ID</th>
                            <th>Name</th>
                            <th>Specialization</th>
                            <th>Rating</th>
                            <th>Availability Hours</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {providers.map((p) => (
                            <tr key={p.providerId}>
                                <td>#{p.providerId}</td>
                                <td><strong>{p.name}</strong></td>
                                <td><span className="spec">{p.specialization}</span></td>
                                <td><span style={{color: 'gold', fontWeight: 'bold'}}>★ {p.rating ? p.rating.toFixed(1) : "5.0"}</span></td>
                                <td style={{maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                    {p.availability}
                                </td>
                                <td>
                                    <button className="btn-secondary" style={{padding: '5px 10px', fontSize: '11px', display: 'flex', gap: '4px'}} onClick={() => openEdit(p)}>
                                        <EditIcon size={12} /> Configure
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editTarget && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content" style={{width: '600px'}}>
                        <div className="modal-header">
                            <div className="modal-title">Configure Provider Profile</div>
                            <span className="modal-close" onClick={() => setEditTarget(null)}><XIcon /></span>
                        </div>
                        <form onSubmit={handleEditSubmit} className="container-content" style={{padding:0, gap: '15px'}}>
                            <div className="field-wrapper">
                                <label>Provider Name</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    required
                                    value={editData.name}
                                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                                />
                            </div>
                            <div className="field-wrapper">
                                <label>Specialization</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    required
                                    value={editData.specialization}
                                    onChange={(e) => setEditData({...editData, specialization: e.target.value})}
                                />
                            </div>
                            <div className="field-wrapper">
                                <label>Rating Override (0.0 to 5.0)</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    className="form-input" 
                                    required
                                    value={editData.rating}
                                    onChange={(e) => setEditData({...editData, rating: parseFloat(e.target.value)})}
                                />
                            </div>
                            <div className="field-wrapper">
                                <label>Availability (JSON Format string)</label>
                                <textarea 
                                    className="form-input" 
                                    rows="3"
                                    required
                                    style={{fontFamily: 'monospace', resize: 'vertical'}}
                                    value={editData.availability}
                                    onChange={(e) => setEditData({...editData, availability: e.target.value})}
                                />
                                <span style={{fontSize: '9px', color: 'var(--text-muted)'}}>
                                    Example: {"{\"Monday\":\"09:00-17:00\",\"Wednesday\":\"09:00-17:00\"}"}
                                </span>
                            </div>
                            <button type="submit" className="btn-primary btn-submit">
                                <CheckIcon size={16} /> Save Configurations
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderManager;
