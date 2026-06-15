import React, { useEffect, useRef, useState } from 'react';
import { apibaseurl, callApi } from '../lib';
import { UsersIcon, EditIcon, TrashIcon, XIcon, PlusIcon } from './Icons';
import './BookingSystem.css';

const UserManager = ({ logout }) => {
    const [data, setData] = useState(null);
    const [token, setToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [activePage, setActivePage] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    
    const [userData, setUserData] = useState(null);
    const [rolesData, setRolesData] = useState([]);
    const [errorData, setErrorData] = useState(null);

    useEffect(() => {
        const storedtoken = localStorage.getItem("token");
        if (!storedtoken) return logout();
        setToken(storedtoken);
        loadUsers(1, storedtoken);
    }, []);

    function loadUsers(page, t = token) {
        setLoading(true);
        setActivePage(page - 1);
        callApi("GET", apibaseurl + `/authservice/getallusers/${page}/10`, null, null, (res) => {
            setLoading(false);
            if (res.code === 200) {
                setData(res);
                setRolesData(res.roles || []);
            } else {
                alert(res.message || "Failed to load users");
            }
        }, t);
    }

    function handleInput(e) {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: name === "role" || name === "status" ? parseInt(value) : value });
    }

    function addUser() {
        setErrorData(null);
        setUserData({
            id: "",
            fullname: "",
            phone: "",
            email: "",
            password: "",
            role: 1,
            status: 1
        });
        setShowPopup(true);
    }

    function editUser(id) {
        setLoading(true);
        setErrorData(null);
        callApi("GET", apibaseurl + `/authservice/getuser/${id}`, null, null, (res) => {
            setLoading(false);
            if (res.code === 200) {
                setUserData(res.user);
                setShowPopup(true);
            } else {
                alert(res.message);
            }
        }, token);
    }

    function deleteUser(id) {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        setLoading(true);
        callApi("DELETE", apibaseurl + `/authservice/deleteuser/${id}`, null, null, (res) => {
            setLoading(false);
            if (res.code === 200) {
                alert(res.message);
                loadUsers(activePage + 1);
            } else {
                alert(res.message || "Failed to delete user");
            }
        }, token);
    }

    function validateData() {
        let errors = {};
        if (!userData.fullname) errors.fullname = true;
        if (!userData.phone) errors.phone = true;
        if (!userData.email) errors.email = true;
        if (userData.id === "" && !userData.password) errors.password = true;
        setErrorData(errors);
        return Object.keys(errors).length > 0;
    }

    function saveUser(e) {
        e.preventDefault();
        if (validateData()) return;

        setLoading(true);
        if (userData.id === "") {
            callApi("POST", apibaseurl + "/authservice/saveuser", userData, null, saveUserHandler, token);
        } else {
            callApi("PUT", apibaseurl + `/authservice/updateuser/${userData.id}`, userData, null, saveUserHandler, token);
        }
    }

    function saveUserHandler(res) {
        setLoading(false);
        alert(res.message);
        if (res.code === 200) {
            setShowPopup(false);
            setUserData(null);
            loadUsers(activePage + 1);
        }
    }

    return (
        <div className="user-manager-view">
            <div className="dashboard-title" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <UsersIcon size={24} /> User Accounts Manager
                </div>
                <button className="btn-primary" onClick={addUser}>
                    <PlusIcon size={16} /> Add User
                </button>
            </div>

            {loading && <div className="progress" />}

            <div className="glass-panel table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>S#</th>
                            <th>Full Name</th>
                            <th>Phone Number</th>
                            <th>Registered Email</th>
                            <th>Role ID</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.users.map((user, index) => (
                            <tr key={user.id}>
                                <td>{((data.page - 1) * data.size) + (index + 1)}</td>
                                <td><strong>{user.fullname}</strong></td>
                                <td>{user.phone}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`status-badge ${user.role === 3 ? 'status-cancelled' : user.role === 2 ? 'status-completed' : 'status-confirmed'}`}>
                                        {user.role === 3 ? 'ADMIN' : user.role === 2 ? 'PROVIDER' : 'CUSTOMER'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '11px', display: 'flex', gap: '4px' }} onClick={() => editUser(user.id)}>
                                            <EditIcon size={12} /> Edit
                                        </button>
                                        <button className="btn-secondary" style={{ padding: '5px 10px', fontSize: '11px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', gap: '4px' }} onClick={() => deleteUser(user.id)}>
                                            <TrashIcon size={12} /> Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {data?.totalpages > 1 && (
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {Array.from({ length: data?.totalpages }, (_, index) => (
                        <button 
                            key={index} 
                            className={`btn-secondary ${index === activePage ? 'btn-primary' : ''}`}
                            style={{ minWidth: '40px', padding: '8px', background: index === activePage ? 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' : 'transparent' }}
                            onClick={() => loadUsers(index + 1)}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* User Edit/Add Modal */}
            {showPopup && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content">
                        <div className="modal-header">
                            <div className="modal-title">{userData?.id === "" ? "Add New Account" : "Modify User Profile"}</div>
                            <span className="modal-close" onClick={() => setShowPopup(false)}><XIcon /></span>
                        </div>
                        <form onSubmit={saveUser} className="container-content" style={{ padding: 0, gap: '15px' }}>
                            <div className="field-wrapper">
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    className={`form-input ${errorData?.fullname ? 'error' : ''}`} 
                                    required 
                                    value={userData?.fullname} 
                                    name="fullname"
                                    onChange={handleInput} 
                                />
                            </div>
                            <div className="field-wrapper">
                                <label>Phone Number</label>
                                <input 
                                    type="text" 
                                    className={`form-input ${errorData?.phone ? 'error' : ''}`} 
                                    required 
                                    value={userData?.phone} 
                                    name="phone"
                                    onChange={handleInput} 
                                />
                            </div>
                            <div className="field-wrapper">
                                <label>Role Type</label>
                                <select 
                                    className={`form-input ${errorData?.role ? 'error' : ''}`} 
                                    value={userData?.role} 
                                    name="role"
                                    onChange={handleInput}
                                >
                                    {rolesData.map((r) => (
                                        <option key={r.role} value={r.role}>{r.rolename}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="field-wrapper">
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    className={`form-input ${errorData?.email ? 'error' : ''}`} 
                                    required 
                                    value={userData?.email} 
                                    name="email"
                                    onChange={handleInput} 
                                />
                            </div>
                            <div className="field-wrapper">
                                <label>Password</label>
                                <input 
                                    type="password" 
                                    className={`form-input ${errorData?.password ? 'error' : ''}`} 
                                    required={userData?.id === ""}
                                    placeholder={userData?.id !== "" ? "Type new password to update..." : ""}
                                    value={userData?.password} 
                                    name="password"
                                    onChange={handleInput} 
                                />
                            </div>
                            <button type="submit" className="btn-primary btn-submit">
                                {userData?.id === "" ? "Create Account" : "Save Configurations"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManager;
