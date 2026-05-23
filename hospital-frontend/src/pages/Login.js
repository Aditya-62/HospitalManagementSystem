import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUserShield, FaLock, FaHeartbeat, FaHospital, FaUser, FaUserPlus, FaSignInAlt, FaUserTag } from 'react-icons/fa';

const API = 'https://localhost:7202/api/Auth';

function Login() {
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [registerData, setRegisterData] = useState({ username: '', password: '', confirmPassword: '', role: 'Patient' });

    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
    const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post(`${API}/login`, { username: loginData.username, password: loginData.password });
            localStorage.setItem('token', res.data.token);
            toast.success(`Welcome, ${loginData.username}! ✅`);
            navigate('/dashboard');
        } catch {
            toast.error('Invalid username or password ❌');
        } finally { setLoading(false); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (registerData.password !== registerData.confirmPassword) { toast.warning('Passwords do not match ⚠️'); return; }
        if (registerData.password.length < 4) { toast.warning('Password must be at least 4 characters'); return; }
        setLoading(true);
        try {
            await axios.post(`${API}/register`, { username: registerData.username, password: registerData.password, role: registerData.role });
            toast.success(`Account created! Please login, ${registerData.username} ✅`);
            setIsRegister(false);
            setLoginData({ username: registerData.username, password: '' });
            setRegisterData({ username: '', password: '', confirmPassword: '', role: 'Patient' });
        } catch {
            toast.error('Registration failed. Username already exists ❌');
        } finally { setLoading(false); }
    };

    const iStyle = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '0 14px 14px 0', padding: '13px 16px', fontSize: '15px', width: '100%', outline: 'none', transition: '0.3s' };
    const iconBox = (color = '#60a5fa') => ({ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRight: 'none', color, borderRadius: '14px 0 0 14px', padding: '0 14px', display: 'flex', alignItems: 'center', flexShrink: 0 });

    const roles = [
        { value: 'Patient', label: '🤒 Patient', desc: 'View your medical records' },
        { value: 'Doctor', label: '🩺 Doctor', desc: 'Manage your patients' },
        { value: 'Nurse', label: '💉 Nurse', desc: 'View assigned patients' },
        { value: 'Admin', label: '🛡️ Admin', desc: 'Manage everything' },
    ];

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden"
            style={{ backgroundImage: "linear-gradient(rgba(5,10,25,0.9), rgba(5,10,25,0.93)), url('https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2128&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }}>

            <div style={{ position: 'absolute', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(37,99,235,0.25), transparent)', borderRadius: '50%', top: '-100px', left: '-100px', filter: 'blur(60px)', animation: 'float 6s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(124,58,237,0.2), transparent)', borderRadius: '50%', bottom: '-80px', right: '-80px', filter: 'blur(60px)', animation: 'float 8s ease-in-out infinite reverse' }} />

            <div className="container position-relative" style={{ zIndex: 1 }}>
                <div className="row justify-content-center align-items-center g-5">

                    {/* LEFT */}
                    <div className="col-lg-6 d-none d-lg-block text-white text-center fade-left">
                        <div className="mb-4 mx-auto d-flex justify-content-center align-items-center pulse-anim"
                            style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
                            <FaHeartbeat size={50} className="heartbeat" color="white" />
                        </div>
                        <h1 className="fw-bold mb-3" style={{ fontSize: '3rem', background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Hospital Management
                        </h1>
                        <p className="mb-5" style={{ opacity: 0.7, fontSize: '16px' }}>Smart Healthcare Dashboard System</p>
                        <img src="https://cdn-icons-png.flaticon.com/512/2966/2966486.png" alt="Hospital" className="img-fluid float-anim"
                            style={{ maxHeight: '260px', filter: 'drop-shadow(0 20px 40px rgba(37,99,235,0.4))' }} />

                        {/* ROLE INFO CARDS */}
                        <div className="row g-2 mt-4">
                            {roles.map(r => (
                                <div className="col-6" key={r.value}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px', textAlign: 'left' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>{r.label}</div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>{r.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FORM CARD */}
                    <div className="col-lg-5 col-md-8 fade-in">
                        <div className="glass-card p-5">
                            <div className="text-center mb-4">
                                <div className="mx-auto mb-3 d-flex justify-content-center align-items-center"
                                    style={{ width: '75px', height: '75px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow: '0 10px 30px rgba(37,99,235,0.4)' }}>
                                    {isRegister ? <FaUserPlus size={30} color="white" /> : <FaHospital size={30} color="white" />}
                                </div>
                                <h2 className="fw-bold text-white mb-1">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                                    {isRegister ? 'Create your account' : 'Sign in to your account'}
                                </p>
                            </div>

                            {/* TABS */}
                            <div className="d-flex mb-4" style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '4px' }}>
                                {[{ label: 'Login', icon: FaSignInAlt, val: false }, { label: 'Register', icon: FaUserPlus, val: true }].map(({ label, icon: Icon, val }) => (
                                    <button key={label} onClick={() => setIsRegister(val)} className="btn flex-fill py-2 fw-semibold"
                                        style={{ borderRadius: '10px', fontSize: '14px', transition: '0.3s', background: isRegister === val ? 'linear-gradient(135deg,#2563eb,#7c3aed)' : 'transparent', color: isRegister === val ? 'white' : 'rgba(255,255,255,0.5)', boxShadow: isRegister === val ? '0 4px 15px rgba(37,99,235,0.4)' : 'none' }}>
                                        <Icon className="me-2" />{label}
                                    </button>
                                ))}
                            </div>

                            {/* LOGIN */}
                            {!isRegister && (
                                <form onSubmit={handleLogin}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-white mb-2" style={{ fontSize: '13px' }}>Username</label>
                                        <div className="d-flex">
                                            <span style={iconBox()}><FaUserShield size={14} /></span>
                                            <input type="text" name="username" placeholder="Enter your username" value={loginData.username} onChange={handleLoginChange} required style={iStyle}
                                                onFocus={e => e.target.style.borderColor = '#60a5fa'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'} />
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold text-white mb-2" style={{ fontSize: '13px' }}>Password</label>
                                        <div className="d-flex">
                                            <span style={iconBox()}><FaLock size={14} /></span>
                                            <input type="password" name="password" placeholder="Enter your password" value={loginData.password} onChange={handleLoginChange} required style={iStyle}
                                                onFocus={e => e.target.style.borderColor = '#60a5fa'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'} />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn w-100 py-3 fw-bold" disabled={loading}
                                        style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', fontSize: '15px', borderRadius: '14px', boxShadow: '0 8px 25px rgba(37,99,235,0.4)' }}>
                                        {loading ? <><span className="spinner-border spinner-border-sm me-2" />Signing In...</> : '🔐 Sign In'}
                                    </button>
                                    <p className="text-center mt-3 mb-0" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                                        Don't have an account?{' '}
                                        <span onClick={() => setIsRegister(true)} style={{ color: '#60a5fa', cursor: 'pointer', fontWeight: 600 }}>Register here</span>
                                    </p>
                                </form>
                            )}

                            {/* REGISTER */}
                            {isRegister && (
                                <form onSubmit={handleRegister}>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-white mb-2" style={{ fontSize: '13px' }}>Username</label>
                                        <div className="d-flex">
                                            <span style={iconBox()}><FaUser size={14} /></span>
                                            <input type="text" name="username" placeholder="Choose a username" value={registerData.username} onChange={handleRegisterChange} required style={iStyle}
                                                onFocus={e => e.target.style.borderColor = '#a78bfa'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-white mb-2" style={{ fontSize: '13px' }}>Password</label>
                                        <div className="d-flex">
                                            <span style={iconBox('#a78bfa')}><FaLock size={14} /></span>
                                            <input type="password" name="password" placeholder="Create a password" value={registerData.password} onChange={handleRegisterChange} required style={iStyle}
                                                onFocus={e => e.target.style.borderColor = '#a78bfa'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'} />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold text-white mb-2" style={{ fontSize: '13px' }}>Confirm Password</label>
                                        <div className="d-flex">
                                            <span style={iconBox('#34d399')}><FaLock size={14} /></span>
                                            <input type="password" name="confirmPassword" placeholder="Re-enter your password" value={registerData.confirmPassword} onChange={handleRegisterChange} required
                                                style={{ ...iStyle, borderColor: registerData.confirmPassword ? (registerData.password === registerData.confirmPassword ? 'rgba(52,211,153,0.5)' : 'rgba(248,113,113,0.5)') : 'rgba(255,255,255,0.2)' }} />
                                        </div>
                                        {registerData.confirmPassword && registerData.password !== registerData.confirmPassword && (
                                            <small style={{ color: '#f87171', fontSize: '12px', marginTop: '4px', display: 'block' }}>⚠️ Passwords do not match</small>
                                        )}
                                    </div>

                                    {/* ROLE SELECT */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold text-white mb-2" style={{ fontSize: '13px' }}>
                                            <FaUserTag className="me-2" style={{ color: '#fbbf24' }} />Select Your Role
                                        </label>
                                        <div className="row g-2">
                                            {roles.map(r => (
                                                <div className="col-6" key={r.value}>
                                                    <div onClick={() => setRegisterData({ ...registerData, role: r.value })}
                                                        style={{ background: registerData.role === r.value ? 'rgba(37,99,235,0.25)' : 'rgba(255,255,255,0.05)', border: `1px solid ${registerData.role === r.value ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '12px', padding: '10px 12px', cursor: 'pointer', transition: '0.2s' }}>
                                                        <div style={{ fontSize: '13px', fontWeight: 600, color: registerData.role === r.value ? '#60a5fa' : 'rgba(255,255,255,0.7)' }}>{r.label}</div>
                                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{r.desc}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button type="submit" className="btn w-100 py-3 fw-bold" disabled={loading}
                                        style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', fontSize: '15px', borderRadius: '14px', boxShadow: '0 8px 25px rgba(124,58,237,0.4)' }}>
                                        {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating...</> : '🚀 Create Account'}
                                    </button>
                                    <p className="text-center mt-3 mb-0" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                                        Already have an account?{' '}
                                        <span onClick={() => setIsRegister(false)} style={{ color: '#a78bfa', cursor: 'pointer', fontWeight: 600 }}>Login here</span>
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`input::placeholder { color: rgba(255,255,255,0.4) !important; }`}</style>
        </div>
    );
}

export default Login;
