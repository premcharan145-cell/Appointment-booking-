import React, { useEffect, useState } from 'react';
import { apibaseurl, callApi } from '../lib';
import { UserIcon, EditIcon, CheckIcon } from './Icons';
import './BookingSystem.css';

const Profile = ({ logout }) => {
    const [profile, setProfile] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        fullname: "",
        phone: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    function loadProfile() {
        setLoading(true);
        const token = localStorage.getItem("token");
        callApi("GET", apibaseurl + "/authservice/profile", null, null, (res) => {
            setLoading(false);
            if (res.code === 200) {
                // profile endpoint returns [Users, Roles] array
                const userObj = Array.isArray(res.user) ? res.user[0] : res.user;
                const roleObj = Array.isArray(res.user) ? res.user[1] : { rolename: "CUSTOMER" };
                setProfile({ user: userObj, role: roleObj });
                setFormData({
                    fullname: userObj.fullname || "",
                    phone: userObj.phone || "",
                    email: userObj.email || "",
                    password: userObj.password || ""
                });
            } else {
                logout();
            }
        }, token);
    }

    function handleUpdateProfile(e) {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Prepare payload (match user model)
        const payload = {
            id: profile.user.id,
            fullname: formData.fullname,
            phone: formData.phone,
            email: formData.email,
            password: formData.password,
            role: profile.user.role,
            status: profile.user.status
        };

        callApi("PUT", apibaseurl + `/user/updateuser/${profile.user.id}`, payload, null, (res) => {
            setLoading(false);
            if (res.code === 200) {
                alert("Profile details updated successfully!");
                setEditMode(false);
                loadProfile();
            } else {
                alert(res.message || "Failed to update profile");
            }
        }, token);
    }

    if (!profile) return null;

    return (
        <div className="profile-view">
            <div className="dashboard-title">
                <UserIcon size={24} /> Account Profile
            </div>

            {loading && <div className="progress" />}

            <div className="dashboard-grid" style={{gridTemplateColumns: '1fr'}}>
                <div className="glass-panel" style={{padding: '35px', maxWidth: '600px', margin: '0 auto', width: '100%'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px'}}>
                        <div className="avatar" style={{width: '64px', height: '64px', fontSize: '24px'}}>
                            {formData.fullname.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{fontSize: '20px', fontWeight: '700'}}>{formData.fullname}</div>
                            <span className="status-badge status-completed" style={{marginTop: '5px'}}>
                                {profile.role.rolename}
                            </span>
                        </div>
                    </div>

                    {!editMode ? (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                            <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px'}}>
                                <span style={{color: 'var(--text-secondary)'}}>Full Name:</span>
                                <strong>{formData.fullname}</strong>
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px'}}>
                                <span style={{color: 'var(--text-secondary)'}}>Phone Number:</span>
                                <strong>{formData.phone}</strong>
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '10px'}}>
                                <span style={{color: 'var(--text-secondary)'}}>Email Address:</span>
                                <strong>{formData.email}</strong>
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: '150px 1fr', fontSize: '14px', paddingBottom: '10px'}}>
                                <span style={{color: 'var(--text-secondary)'}}>Account Status:</span>
                                <span className="status-badge status-confirmed" style={{alignSelf: 'flex-start'}}>Active</span>
                            </div>

                            <button className="btn-primary" style={{marginTop: '10px'}} onClick={() => setEditMode(true)}>
                                <EditIcon size={16} /> Edit Profile Details
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateProfile} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                            <div className="field-wrapper">
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    required
                                    value={formData.fullname}
                                    onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                                />
                            </div>
                            <div className="field-wrapper">
                                <label>Phone Number</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            <div className="field-wrapper">
                                <label>Email Address (read-only)</label>
                                <input 
                                    type="email" 
                                    className="form-input" 
                                    readOnly
                                    disabled
                                    style={{opacity: '0.6', cursor: 'not-allowed'}}
                                    value={formData.email}
                                />
                            </div>
                            <div className="field-wrapper">
                                <label>New Password</label>
                                <input 
                                    type="password" 
                                    className="form-input" 
                                    placeholder="Enter new password to update..."
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>

                            <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                                <button type="submit" className="btn-primary" style={{flex: '1'}}>
                                    <CheckIcon size={16} /> Save Changes
                                </button>
                                <button type="button" className="btn-secondary" onClick={() => setEditMode(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
