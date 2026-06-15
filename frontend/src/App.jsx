import { useEffect, useRef, useState } from 'react';
import { imgurl, callApi, apibaseurl } from './lib';
import './App.css';
import ProgressBar from './components/ProgressBar.jsx';
import { UserIcon, LockIcon, BellIcon, CalendarIcon } from './components/Icons';

const App = () => {
    // Modes: 'signin', 'signup', 'forgot'
    const [authMode, setAuthMode] = useState('signin');
    const finput = useRef();
    const [isProgress, setIsProgress] = useState(false);
    const [errorData, setErrorData] = useState({});

    const [signupData, setSignupData] = useState({
        fullname: "",
        phone: "",
        email: "",
        password: "",
        retypepassword: "",
        role: 1 // Default to Customer (1)
    });

    const [signinData, setSigninData] = useState({
        username: "",
        password: ""
    });

    const [forgotData, setForgotData] = useState({
        email: "",
        password: "",
        retypepassword: ""
    });

    useEffect(() => {
        setTimeout(() => { finput.current?.focus(); }, 0);
    }, [authMode]);

    function switchMode(mode) {
        setAuthMode(mode);
        setErrorData({});
        setSigninData({ username: "", password: "" });
        setSignupData({ fullname: "", phone: "", email: "", password: "", retypepassword: "", role: 1 });
        setForgotData({ email: "", password: "", retypepassword: "" });
    }

    function handleSigninInput(e) {
        const { name, value } = e.target;
        setSigninData({ ...signinData, [name]: value });
    }

    function handleSignupInput(e) {
        const { name, value } = e.target;
        setSignupData({ ...signupData, [name]: name === "role" ? parseInt(value) : value });
    }

    function handleForgotInput(e) {
        const { name, value } = e.target;
        setForgotData({ ...forgotData, [name]: value });
    }

    function validateSignup() {
        let errors = {};
        if (!signupData.fullname) errors.fullname = true;
        if (!signupData.phone) errors.phone = true;
        if (!signupData.email) errors.email = true;
        if (!signupData.password) errors.password = true;
        if (!signupData.retypepassword || signupData.password !== signupData.retypepassword) errors.retypepassword = true;
        setErrorData(errors);
        return Object.keys(errors).length > 0;
    }

    function validateSignin() {
        let errors = {};
        if (!signinData.username) errors.username = true;
        if (!signinData.password) errors.password = true;
        setErrorData(errors);
        return Object.keys(errors).length > 0;
    }

    function validateForgot() {
        let errors = {};
        if (!forgotData.email) errors.email = true;
        if (!forgotData.password) errors.password = true;
        if (!forgotData.retypepassword || forgotData.password !== forgotData.retypepassword) errors.retypepassword = true;
        setErrorData(errors);
        return Object.keys(errors).length > 0;
    }

    function signin() {
        if (validateSignin()) return;
        setIsProgress(true);
        callApi("POST", apibaseurl + "/authservice/signin", signinData, null, signinResponseHandler);
    }

    function signup() {
        if (validateSignup()) return;
        setIsProgress(true);
        callApi("POST", apibaseurl + "/authservice/signup", signupData, null, signupResponseHandler);
    }

    function resetPassword() {
        if (validateForgot()) return;
        setIsProgress(true);
        callApi("POST", apibaseurl + "/authservice/forgot-password", forgotData, null, forgotResponseHandler);
    }

    function signinResponseHandler(res) {
        setIsProgress(false);
        if (res.code !== 200) {
            alert(res.message);
        } else {
            localStorage.setItem("token", res.jwt);
            window.location.replace("/home");
        }
    }

    function signupResponseHandler(res) {
        setIsProgress(false);
        alert(res.message);
        if (res.code === 200) {
            switchMode('signin');
        }
    }

    function forgotResponseHandler(res) {
        setIsProgress(false);
        alert(res.message);
        if (res.code === 200) {
            switchMode('signin');
        }
    }

    return (
        <div className="app">
            <div className="glass-panel container">
                
                <div className="container-header">
                    <div className="logo-area">
                        <div className="logo-icon">S</div>
                        <div className="logo-text">Smart<span>Book</span></div>
                    </div>
                    <label>
                        {authMode === 'signin' && "Welcome Back"}
                        {authMode === 'signup' && "Create Account"}
                        {authMode === 'forgot' && "Reset Password"}
                    </label>
                </div>

                <div className="container-content">
                    {authMode === 'signin' && (
                        <>
                            <div className="field-wrapper">
                                <label>Email Address</label>
                                <div className="input-group">
                                    <span className="input-icon"><UserIcon /></span>
                                    <input 
                                        type="text" 
                                        ref={finput} 
                                        className={`form-input ${errorData.username ? 'error' : ''}`} 
                                        placeholder="Enter registered email" 
                                        autoComplete="off" 
                                        name="username" 
                                        value={signinData.username} 
                                        onChange={handleSigninInput} 
                                    />
                                </div>
                            </div>
                            
                            <div className="field-wrapper">
                                <label>Password</label>
                                <div className="input-group">
                                    <span className="input-icon"><LockIcon /></span>
                                    <input 
                                        type="password" 
                                        className={`form-input ${errorData.password ? 'error' : ''}`} 
                                        placeholder="Enter account password" 
                                        name="password" 
                                        value={signinData.password} 
                                        onChange={handleSigninInput} 
                                        onKeyDown={(e) => e.key === 'Enter' && signin()}
                                    />
                                </div>
                            </div>
                            
                            <span className="forgot-password-link" onClick={() => switchMode('forgot')}>
                                Forgot Password?
                            </span>
                            
                            <button className="btn-primary btn-submit" onClick={signin}>Sign In</button>
                            
                            <div className="switch-mode" onClick={() => switchMode('signup')}>
                                Don't have an account? <span>Register here</span>
                            </div>
                        </>
                    )}

                    {authMode === 'signup' && (
                        <>
                            <div className="field-wrapper">
                                <label>Full Name</label>
                                <div className="input-group">
                                    <span className="input-icon"><UserIcon /></span>
                                    <input 
                                        type="text" 
                                        ref={finput} 
                                        className={`form-input ${errorData.fullname ? 'error' : ''}`} 
                                        placeholder="Enter full name" 
                                        autoComplete="off" 
                                        name="fullname" 
                                        value={signupData.fullname} 
                                        onChange={handleSignupInput} 
                                    />
                                </div>
                            </div>

                            <div className="field-wrapper">
                                <label>Mobile Number</label>
                                <div className="input-group">
                                    <span className="input-icon"><UserIcon /></span>
                                    <input 
                                        type="text" 
                                        className={`form-input ${errorData.phone ? 'error' : ''}`} 
                                        placeholder="Enter phone number" 
                                        autoComplete="off" 
                                        name="phone" 
                                        value={signupData.phone} 
                                        onChange={handleSignupInput} 
                                    />
                                </div>
                            </div>

                            <div className="field-wrapper">
                                <label>Account Role</label>
                                <select 
                                    className="form-input" 
                                    name="role" 
                                    value={signupData.role} 
                                    onChange={handleSignupInput}
                                >
                                    <option value={1}>Customer / Booking Client</option>
                                    <option value={2}>Service Provider</option>
                                </select>
                            </div>

                            <div className="field-wrapper">
                                <label>Email Address</label>
                                <div className="input-group">
                                    <span className="input-icon"><UserIcon /></span>
                                    <input 
                                        type="email" 
                                        className={`form-input ${errorData.email ? 'error' : ''}`} 
                                        placeholder="Enter email address" 
                                        autoComplete="off" 
                                        name="email" 
                                        value={signupData.email} 
                                        onChange={handleSignupInput} 
                                    />
                                </div>
                            </div>

                            <div className="field-wrapper">
                                <label>Password</label>
                                <div className="input-group">
                                    <span className="input-icon"><LockIcon /></span>
                                    <input 
                                        type="password" 
                                        className={`form-input ${errorData.password ? 'error' : ''}`} 
                                        placeholder="Create password" 
                                        autoComplete="off" 
                                        name="password" 
                                        value={signupData.password} 
                                        onChange={handleSignupInput} 
                                    />
                                </div>
                            </div>

                            <div className="field-wrapper">
                                <label>Confirm Password</label>
                                <div className="input-group">
                                    <span className="input-icon"><LockIcon /></span>
                                    <input 
                                        type="password" 
                                        className={`form-input ${errorData.retypepassword ? 'error' : ''}`} 
                                        placeholder="Re-type password" 
                                        autoComplete="off" 
                                        name="retypepassword" 
                                        value={signupData.retypepassword} 
                                        onChange={handleSignupInput} 
                                        onKeyDown={(e) => e.key === 'Enter' && signup()}
                                    />
                                </div>
                            </div>

                            <button className="btn-primary btn-submit" onClick={signup}>Register Account</button>
                            
                            <div className="switch-mode" onClick={() => switchMode('signin')}>
                                Already have an account? <span>Sign In</span>
                            </div>
                        </>
                    )}

                    {authMode === 'forgot' && (
                        <>
                            <div className="field-wrapper">
                                <label>Email Address</label>
                                <div className="input-group">
                                    <span className="input-icon"><UserIcon /></span>
                                    <input 
                                        type="email" 
                                        ref={finput} 
                                        className={`form-input ${errorData.email ? 'error' : ''}`} 
                                        placeholder="Enter registered email" 
                                        autoComplete="off" 
                                        name="email" 
                                        value={forgotData.email} 
                                        onChange={handleForgotInput} 
                                    />
                                </div>
                            </div>

                            <div className="field-wrapper">
                                <label>New Password</label>
                                <div className="input-group">
                                    <span className="input-icon"><LockIcon /></span>
                                    <input 
                                        type="password" 
                                        className={`form-input ${errorData.password ? 'error' : ''}`} 
                                        placeholder="Enter new password" 
                                        autoComplete="off" 
                                        name="password" 
                                        value={forgotData.password} 
                                        onChange={handleForgotInput} 
                                    />
                                </div>
                            </div>

                            <div className="field-wrapper">
                                <label>Confirm New Password</label>
                                <div className="input-group">
                                    <span className="input-icon"><LockIcon /></span>
                                    <input 
                                        type="password" 
                                        className={`form-input ${errorData.retypepassword ? 'error' : ''}`} 
                                        placeholder="Re-type new password" 
                                        autoComplete="off" 
                                        name="retypepassword" 
                                        value={forgotData.retypepassword} 
                                        onChange={handleForgotInput} 
                                        onKeyDown={(e) => e.key === 'Enter' && resetPassword()}
                                    />
                                </div>
                            </div>

                            <button className="btn-primary btn-submit" onClick={resetPassword}>Reset Password</button>
                            
                            <div className="switch-mode" onClick={() => switchMode('signin')}>
                                Back to <span>Sign In</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="container-footer">Copyright @ 2026. All rights reserved.</div>
            </div>

            <ProgressBar isProgress={isProgress} />
        </div>
    );
}

export default App;
