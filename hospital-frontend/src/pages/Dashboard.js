import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import CountUp from 'react-countup';
import { ReactTyped } from 'react-typed';
import {
    FaUserInjured, FaUserMd, FaCalendarCheck, FaMoneyBillWave,
    FaHeartbeat, FaBell, FaRobot, FaCloudSun, FaArrowRight,
    FaCheckCircle, FaClock, FaTimes, FaUser, FaStethoscope, FaBriefcaseMedical,
    FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaShieldAlt, FaHospital, FaAmbulance
} from 'react-icons/fa';
import { getUser } from '../utils/auth';

function Dashboard() {
    const navigate = useNavigate();
    const [patientCount, setPatientCount] = useState(0);
    const [doctorCount, setDoctorCount] = useState(0);
    const [appointmentCount, setAppointmentCount] = useState(0);
    const [billCount, setBillCount] = useState(0);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [time, setTime] = useState(new Date());

    // NOTIFICATIONS
    const [appointments, setAppointments] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const [readIds, setReadIds] = useState(() => {
        const saved = localStorage.getItem('readNotifIds');
        return saved ? JSON.parse(saved) : [];
    });
    const notifRef = useRef(null);

    const currentUser = getUser();
    const username = currentUser?.username || 'Admin';
    const role = currentUser?.role || 'Admin';

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Close notif panel on outside click
    useEffect(() => {
        const handler = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotif(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const isPatient = role === 'Patient';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pR, dR, aR, bR] = await Promise.all([
                    axios.get('https://localhost:7202/api/Patient'),
                    axios.get('https://localhost:7202/api/Doctor'),
                    axios.get('https://localhost:7202/api/Appointment'),
                    axios.get('https://localhost:7202/api/Bill'),
                ]);
                setPatientCount(pR.data.length);
                setDoctorCount(dR.data.length);
                const exampleDoctors = [
                    { id: 'ex1', name: 'Dr. Arjun Sharma', specialization: 'Cardiologist', experience: 12 },
                    { id: 'ex2', name: 'Dr. Priya Mehta', specialization: 'Neurologist', experience: 9 },
                    { id: 'ex3', name: 'Dr. Rahul Verma', specialization: 'Orthopedic Surgeon', experience: 15 },
                    { id: 'ex4', name: 'Dr. Sneha Kapoor', specialization: 'Pediatrician', experience: 7 },
                    { id: 'ex5', name: 'Dr. Amit Joshi', specialization: 'Dermatologist', experience: 10 },
                    { id: 'ex6', name: 'Dr. Neha Singh', specialization: 'Gynecologist', experience: 11 },
                ];
                setDoctors(dR.data.length > 0 ? dR.data : exampleDoctors);
                // Filter appointments and bills for patient's own records
                if (isPatient) {
                    setAppointmentCount(aR.data.filter(a => a.patientName?.toLowerCase() === username.toLowerCase()).length);
                    setBillCount(bR.data.filter(b => b.patientName?.toLowerCase() === username.toLowerCase()).length);
                    setAppointments(aR.data.filter(a => a.patientName?.toLowerCase() === username.toLowerCase()).slice(-10).reverse());
                } else {
                    setAppointmentCount(aR.data.length);
                    setBillCount(bR.data.length);
                    setAppointments(aR.data.slice(-10).reverse());
                }
                setLoading(false);
                toast.success('Dashboard Loaded ✅');
            } catch {
                toast.error('Failed To Load Dashboard');
            }
        };
        fetchData();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const unreadCount = appointments.filter(a => !readIds.includes(a.id)).length;

    const markAllRead = () => {
        const allIds = appointments.map(a => a.id);
        setReadIds(allIds);
        localStorage.setItem('readNotifIds', JSON.stringify(allIds));
    };

    const markOneRead = (id) => {
        const updated = [...readIds, id];
        setReadIds(updated);
        localStorage.setItem('readNotifIds', JSON.stringify(updated));
    };

    if (loading) return (
        <div className="loader-wrapper">
            <div className="text-center">
                <div className="loader-spinner mx-auto mb-3" />
                <p className="text-white fw-semibold">Loading Dashboard...</p>
            </div>
        </div>
    );

    const allStats = [
        { label: 'Total Patients', value: patientCount, icon: FaUserInjured, bg: 'linear-gradient(135deg,#1d4ed8,#2563eb)', path: '/patients', shadow: 'rgba(37,99,235,0.4)', roles: ['Admin','Doctor','Nurse'] },
        { label: 'Total Doctors', value: doctorCount, icon: FaUserMd, bg: 'linear-gradient(135deg,#065f46,#059669)', path: '/doctors', shadow: 'rgba(5,150,105,0.4)', roles: ['Admin','Doctor','Nurse'] },
        { label: isPatient ? 'My Appointments' : 'Appointments', value: appointmentCount, icon: FaCalendarCheck, bg: 'linear-gradient(135deg,#92400e,#d97706)', path: '/appointments', shadow: 'rgba(217,119,6,0.4)', roles: ['Admin','Doctor','Nurse','Patient'] },
        { label: isPatient ? 'My Bills' : 'Total Bills', value: billCount, icon: FaMoneyBillWave, bg: 'linear-gradient(135deg,#991b1b,#dc2626)', path: '/bills', shadow: 'rgba(220,38,38,0.4)', roles: ['Admin','Patient'] },
    ];
    const stats = allStats.filter(s => s.roles.includes(role));

    const allProgress = [
        { label: 'Patients', value: patientCount, max: Math.max(patientCount, 1), color: '#60a5fa', roles: ['Admin','Doctor','Nurse'] },
        { label: 'Doctors', value: doctorCount, max: Math.max(patientCount, 1), color: '#34d399', roles: ['Admin','Doctor','Nurse'] },
        { label: 'Appointments', value: appointmentCount, max: Math.max(patientCount, appointmentCount, 1), color: '#fbbf24', roles: ['Admin','Doctor','Nurse','Patient'] },
        { label: 'Bills', value: billCount, max: Math.max(patientCount, billCount, 1), color: '#f87171', roles: ['Admin','Patient'] },
    ];
    const progressItems = allProgress.filter(p => p.roles.includes(role));

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1 min-vh-100 bg-dashboard" style={{ padding: '90px 30px 40px' }}>
                <div className="container-fluid fade-in">

                    {/* HERO */}
                    <div className="glass-card p-5 mb-4 text-white">
                        <div className="row align-items-center">
                            <div className="col-lg-8">
                                <div className="d-flex align-items-center gap-4 mb-4">
                                    <div className="pulse-anim" style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(37,99,235,0.4)', flexShrink: 0 }}>
                                        <FaHeartbeat size={32} color="white" className="heartbeat" />
                                    </div>
                                    <div>
                                        <h1 className="fw-bold mb-1" style={{ fontSize: '2.4rem' }}>
                                            <ReactTyped strings={['Hospital Dashboard', 'Smart Healthcare System', 'HMS Admin Panel']} typeSpeed={60} backSpeed={40} loop />
                                        </h1>
                                        <p className="mb-0" style={{ color: 'rgba(255,255,255,0.6)' }}>Advanced Hospital Monitoring System</p>
                                    </div>
                                </div>

                                {/* LOGGED IN USER */}
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FaUser size={16} color="white" />
                                    </div>
                                    <div>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Logged in as</div>
                                        <div className="fw-bold" style={{ color: '#60a5fa', fontSize: '16px' }}>{username}</div>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="fw-bold mb-0" style={{ color: '#60a5fa', fontFamily: 'monospace', fontSize: '2rem' }}>{time.toLocaleTimeString()}</h2>
                                    <small style={{ color: 'rgba(255,255,255,0.5)' }}>{time.toDateString()}</small>
                                </div>
                            </div>

                            <div className="col-lg-4 text-end mt-4 mt-lg-0">

                                {/* NOTIFICATION BELL */}
                                <div className="position-relative d-inline-block mb-3" ref={notifRef}>
                                    <button
                                        onClick={() => setShowNotif(!showNotif)}
                                        className="btn btn-sm"
                                        style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '12px', padding: '8px 18px', position: 'relative' }}>
                                        <FaBell className="me-2" />
                                        {unreadCount > 0 ? `${unreadCount} New` : 'Notifications'}
                                        {unreadCount > 0 && (
                                            <span style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #0f172a' }}>
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* NOTIFICATION DROPDOWN */}
                                    {showNotif && (
                                        <div style={{
                                            position: 'absolute', top: '48px', right: 0,
                                            width: '360px', zIndex: 9999,
                                            background: 'rgba(15,23,42,0.97)',
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                            borderRadius: '20px',
                                            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                                            animation: 'fadeInUp 0.25s ease'
                                        }}>
                                            {/* HEADER */}
                                            <div className="d-flex justify-content-between align-items-center p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                <div className="d-flex align-items-center gap-2">
                                                    <FaBell size={14} color="#fbbf24" />
                                                    <span className="fw-bold text-white" style={{ fontSize: '14px' }}>Notifications</span>
                                                    {unreadCount > 0 && (
                                                        <span style={{ background: '#ef4444', color: 'white', borderRadius: '20px', padding: '1px 8px', fontSize: '11px', fontWeight: 700 }}>{unreadCount}</span>
                                                    )}
                                                </div>
                                                <div className="d-flex gap-2">
                                                    {unreadCount > 0 && (
                                                        <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '11px', cursor: 'pointer', padding: 0 }}>
                                                            Mark all read
                                                        </button>
                                                    )}
                                                    <button onClick={() => setShowNotif(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}>
                                                        <FaTimes size={13} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* LIST */}
                                            <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                                                {appointments.length === 0 ? (
                                                    <div className="text-center py-5" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                                                        No appointments found
                                                    </div>
                                                ) : appointments.map(a => {
                                                    const isRead = readIds.includes(a.id);
                                                    const isCompleted = a.status === 'Completed';
                                                    return (
                                                        <div key={a.id}
                                                            onClick={() => { markOneRead(a.id); navigate('/appointments'); setShowNotif(false); }}
                                                            style={{
                                                                padding: '12px 16px',
                                                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                                cursor: 'pointer',
                                                                background: isRead ? 'transparent' : 'rgba(37,99,235,0.08)',
                                                                transition: '0.2s'
                                                            }}
                                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                            onMouseLeave={e => e.currentTarget.style.background = isRead ? 'transparent' : 'rgba(37,99,235,0.08)'}
                                                        >
                                                            <div className="d-flex align-items-start gap-3">
                                                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: isCompleted ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                                                    {isCompleted
                                                                        ? <FaCheckCircle size={16} color="#34d399" />
                                                                        : <FaClock size={16} color="#fbbf24" />
                                                                    }
                                                                </div>
                                                                <div className="flex-grow-1">
                                                                    <div className="d-flex justify-content-between align-items-start">
                                                                        <span className="fw-semibold text-white" style={{ fontSize: '13px' }}>{a.patientName}</span>
                                                                        {!isRead && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2563eb', flexShrink: 0, marginTop: '4px' }} />}
                                                                    </div>
                                                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '2px' }}>
                                                                        Dr. {a.doctorName}
                                                                    </div>
                                                                    <div className="d-flex justify-content-between align-items-center mt-1">
                                                                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>
                                                                            📅 {a.appointmentDate?.split('T')[0]}
                                                                        </span>
                                                                        <span style={{
                                                                            fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
                                                                            background: isCompleted ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                                                            color: isCompleted ? '#34d399' : '#fbbf24'
                                                                        }}>{a.status}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* FOOTER */}
                                            <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                                                <button className="btn btn-sm w-100" onClick={() => { navigate('/appointments'); setShowNotif(false); }}
                                                    style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '10px', fontSize: '13px' }}>
                                                    View All Appointments →
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="glass-card p-4 text-center">
                                    <FaCloudSun size={40} color="#fbbf24" className="mb-2" />
                                    <h4 className="fw-bold mb-0" style={{ color: '#fbbf24' }}>29°C</h4>
                                    <small style={{ color: 'rgba(255,255,255,0.6)' }}>Sunny Weather</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* STAT CARDS */}
                    <div className="row g-4 mb-4">
                        {stats.map(({ label, value, icon: Icon, bg, path, shadow }) => (
                            <div className="col-md-6 col-xl-3" key={label}>
                                <div className="stat-card-3d card border-0 p-4 text-white" style={{ background: bg, boxShadow: `0 10px 30px ${shadow}`, cursor: 'pointer' }}
                                    onClick={() => navigate(path)}>
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon size={24} color="white" />
                                        </div>
                                        <FaArrowRight size={14} style={{ opacity: 0.5, marginTop: '4px' }} />
                                    </div>
                                    <h1 className="fw-bold mb-1"><CountUp end={value} duration={2} /></h1>
                                    <p className="mb-0" style={{ opacity: 0.8, fontSize: '14px' }}>{label}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ACTIVITY + AI */}
                    <div className="row g-4 mb-4">
                        <div className="col-lg-7">
                            <div className="glass-card p-4 h-100 text-white">
                                <h5 className="fw-bold mb-4" style={{ color: '#60a5fa' }}>📊 Hospital Activity</h5>
                                {progressItems.map(({ label, value, max, color }) => (
                                    <div className="mb-4" key={label}>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{label}</span>
                                            <span style={{ fontSize: '14px', color, fontWeight: 700 }}>{value}</span>
                                        </div>
                                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${Math.min((value / max) * 100, 100)}%`, background: `linear-gradient(90deg, ${color}, ${color}88)`, borderRadius: '20px', transition: 'width 1s ease', boxShadow: `0 0 10px ${color}66` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-lg-5">
                            <div className="glass-card p-4 h-100 text-white">
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <div style={{ width: '55px', height: '55px', borderRadius: '16px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(37,99,235,0.4)' }}>
                                        <FaRobot size={26} color="white" />
                                    </div>
                                    <div>
                                        <h5 className="fw-bold mb-0">AI Assistant</h5>
                                        <small style={{ color: 'rgba(255,255,255,0.5)' }}>Smart Support System</small>
                                    </div>
                                </div>
                                {[
                                    { emoji: '👋', text: `Welcome, ${username}!`, bg: 'rgba(255,255,255,0.06)' },
                                    isPatient
                                        ? { emoji: '📅', text: `My Appointments: ${appointmentCount}`, bg: 'rgba(245,158,11,0.15)' }
                                        : { emoji: '🩺', text: `Available Doctors: ${doctorCount}`, bg: 'rgba(37,99,235,0.15)' },
                                    isPatient
                                        ? { emoji: '💰', text: `My Bills: ${billCount}`, bg: 'rgba(220,38,38,0.15)' }
                                        : { emoji: '💊', text: `Total Appointments: ${appointmentCount}`, bg: 'rgba(5,150,105,0.15)' },
                                ].map(({ emoji, text, bg }) => (
                                    <div key={text} className="rounded-3 p-3 mb-3" style={{ background: bg, fontSize: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                        {emoji} {text}
                                    </div>
                                ))}
                                <input type="text" placeholder="Ask something..." className="form-control custom-input mb-3" />
                                <button className="btn btn-gradient-blue w-100 py-2">Send Message</button>
                            </div>
                        </div>
                    </div>

                    {/* DOCTORS PANEL */}
                    <div className="glass-card p-4 mb-4 text-white">
                        <h5 className="fw-bold mb-4" style={{ color: '#34d399' }}>🩺 Our Doctors</h5>
                        {doctors.length === 0 ? (
                            <div className="text-center py-4" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
                                <FaUserMd size={30} className="mb-2" style={{ opacity: 0.3 }} />
                                <p className="mb-0">No doctors added yet</p>
                            </div>
                        ) : (
                            <div className="row g-3">
                                {doctors.map(d => (
                                    <div className="col-md-6 col-lg-4" key={d.id}>
                                        <div className="rounded-3 p-3" style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(52,211,153,0.2)' }}>
                                            <div className="d-flex align-items-center gap-3">
                                                <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg,#059669,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <FaUserMd size={20} color="white" />
                                                </div>
                                                <div>
                                                    <div className="fw-bold" style={{ fontSize: '14px' }}>{d.name}</div>
                                                    <div style={{ fontSize: '12px', color: '#60a5fa' }}>
                                                        <FaStethoscope size={10} className="me-1" />{d.specialization}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
                                                        <FaBriefcaseMedical size={10} className="me-1" />{d.experience} yrs experience
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="hms-footer p-4 p-md-5 mt-2 text-white">

                        {/* Top Stats Row */}
                        <div className="row g-3 mb-4">
                            {[
                                { icon: '🏥', label: 'Departments', value: '12+' },
                                { icon: '🩺', label: 'Specialists', value: '50+' },
                                { icon: '🛏️', label: 'Beds Available', value: '200+' },
                                { icon: '⚕️', label: 'Years of Care', value: '25+' },
                            ].map(({ icon, label, value }) => (
                                <div className="col-6 col-md-3" key={label}>
                                    <div className="footer-stat-box">
                                        <div style={{ fontSize: '22px', marginBottom: '4px' }}>{icon}</div>
                                        <div className="fw-bold" style={{ fontSize: '18px', color: '#34d399' }}>{value}</div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="footer-divider" />

                        <div className="row g-4">

                            {/* Brand */}
                            <div className="col-12 col-lg-4">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div className="footer-brand-icon">
                                        <FaHospital size={22} color="white" />
                                    </div>
                                    <div>
                                        <div className="fw-bold" style={{ fontSize: '17px', letterSpacing: '0.5px' }}>MediCare HMS</div>
                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Hospital Management System</div>
                                    </div>
                                </div>
                                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.8', marginBottom: '16px' }}>
                                    Delivering smart, efficient and compassionate healthcare management solutions for modern hospitals and clinics.
                                </p>
                                <div className="d-flex flex-wrap gap-2">
                                    {[
                                        { icon: FaShieldAlt, label: 'HIPAA Compliant', color: '#34d399', border: 'rgba(52,211,153,0.3)' },
                                        { icon: FaAmbulance, label: '24/7 Emergency', color: '#f87171', border: 'rgba(248,113,113,0.3)' },
                                        { icon: FaHeartbeat, label: 'ISO Certified', color: '#60a5fa', border: 'rgba(96,165,250,0.3)' },
                                    ].map(({ icon: Icon, label, color, border }) => (
                                        <span key={label} className="footer-badge" style={{ color, borderColor: border, background: `${color}10` }}>
                                            <Icon size={9} />{label}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="col-6 col-md-4 col-lg-2">
                                <div className="fw-semibold mb-3" style={{ fontSize: '12px', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Quick Links</div>
                                {[
                                    { label: 'Dashboard', path: '/' },
                                    { label: 'Patients', path: '/patients' },
                                    { label: 'Doctors', path: '/doctors' },
                                    { label: 'Appointments', path: '/appointments' },
                                    { label: 'Billing', path: '/bills' },
                                    { label: 'Analytics', path: '/analytics' },
                                ].map(({ label, path }) => (
                                    <div key={label} className="footer-link mb-2" onClick={() => navigate(path)}>
                                        <span style={{ color: '#34d399', fontSize: '10px' }}>✚</span> {label}
                                    </div>
                                ))}
                            </div>

                            {/* Services */}
                            <div className="col-6 col-md-4 col-lg-2">
                                <div className="fw-semibold mb-3" style={{ fontSize: '12px', color: '#34d399', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Departments</div>
                                {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Radiology', 'ICU & Emergency'].map(s => (
                                    <div key={s} className="mb-2" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ color: '#059669', fontSize: '10px' }}>●</span>{s}
                                    </div>
                                ))}
                            </div>

                            {/* Contact */}
                            <div className="col-12 col-md-4 col-lg-4">
                                <div className="fw-semibold mb-3" style={{ fontSize: '12px', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '1.2px' }}>Contact & Support</div>
                                {[
                                    { icon: FaPhoneAlt, text: '+91 98765 43210', sub: 'Emergency Helpline', color: '#34d399' },
                                    { icon: FaEnvelope, text: 'support@medicare-hms.com', sub: 'Email Support', color: '#60a5fa' },
                                    { icon: FaMapMarkerAlt, text: '12, Medical Hub, New Delhi', sub: 'Head Office', color: '#f87171' },
                                ].map(({ icon: Icon, text, sub, color }) => (
                                    <div key={text} className="d-flex align-items-start gap-3 mb-3">
                                        <div className="footer-contact-icon" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                                            <Icon size={13} color={color} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{text}</div>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{sub}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="footer-divider" />

                        {/* Bottom Bar */}
                        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
                            <div className="d-flex align-items-center gap-2">
                                <span style={{ color: '#34d399', fontSize: '16px' }}>✚</span>
                                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
                                    © {new Date().getFullYear()} MediCare HMS · All rights reserved · Saving Lives with Technology
                                </span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <div className="pulse-dot" />
                                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>All Systems Operational · v2.0.0</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Dashboard;
