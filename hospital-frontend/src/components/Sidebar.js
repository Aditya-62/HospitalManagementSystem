import { FaUserInjured, FaUserMd, FaCalendarCheck, FaMoneyBill, FaTachometerAlt, FaSignOutAlt, FaChartPie, FaBars, FaTimes, FaMoon, FaSun, FaHeartbeat, FaUserCircle, FaHospitalUser, FaPills } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUser } from '../utils/auth';

const menuItems = [
    { path: '/dashboard',      icon: FaTachometerAlt, label: 'Dashboard',       color: '#60a5fa', roles: ['Admin','Doctor','Nurse','Patient'] },
    { path: '/patients',       icon: FaUserInjured,   label: 'Patients',        color: '#34d399', roles: ['Admin','Doctor','Nurse','Patient'] },
    { path: '/doctors',        icon: FaUserMd,        label: 'Doctors',         color: '#a78bfa', roles: ['Admin','Doctor','Nurse'] },
    { path: '/appointments',   icon: FaCalendarCheck, label: 'Appointments',    color: '#fbbf24', roles: ['Admin','Doctor','Nurse','Patient'] },
    { path: '/prescriptions',  icon: FaPills,         label: 'Prescriptions',   color: '#c4b5fd', roles: ['Admin','Doctor','Patient'] },
    { path: '/bills',          icon: FaMoneyBill,     label: 'Billing',         color: '#f87171', roles: ['Admin','Patient'] },
    { path: '/analytics',      icon: FaChartPie,      label: 'Analytics',       color: '#38bdf8', roles: ['Admin'] },
    { path: '/patient-portal', icon: FaHospitalUser,  label: 'Patient Portal',  color: '#f472b6', roles: ['Patient'] },
];

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [lightMode, setLightMode] = useState(() => localStorage.getItem('theme') === 'light');
    const currentUser = getUser();
    const username = currentUser?.username || 'Admin';
    const role = currentUser?.role || 'Admin';

    useEffect(() => {
        if (lightMode) {
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        }
    }, [lightMode]);

    const handleNav = (path) => { navigate(path); setOpen(false); };
    const handleLogout = () => { localStorage.removeItem('token'); navigate('/'); };

    return (
        <>
            {/* TOP NAVBAR */}
            <div className="top-navbar">
                <button className="btn btn-sm me-3" onClick={() => setOpen(true)}
                    style={{ background:'linear-gradient(135deg,#2563eb,#7c3aed)', color:'white', borderRadius:'12px', padding:'8px 14px' }}>
                    <FaBars size={16} />
                </button>
                <div className="d-flex align-items-center gap-3">
                    <div className="d-flex justify-content-center align-items-center"
                        style={{ width:'38px', height:'38px', borderRadius:'50%', background:'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
                        <FaHeartbeat size={18} color="white" className="heartbeat" />
                    </div>
                    <div>
                        <div className="fw-bold" style={{ color:'white', fontSize:'15px', lineHeight:1.2 }}>Hospital Management</div>
                        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'11px' }}>Admin Dashboard</div>
                    </div>
                </div>
                <div className="ms-auto d-flex align-items-center gap-3">
                    <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#10b981', boxShadow:'0 0 8px #10b981' }} />
                    <div className="d-flex align-items-center gap-2" style={{ background:'rgba(255,255,255,0.06)', borderRadius:'20px', padding:'5px 12px 5px 5px', border:'1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'linear-gradient(135deg,#2563eb,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <FaUserCircle size={14} color="white" />
                        </div>
                        <div>
                            <div style={{ color:'rgba(255,255,255,0.9)', fontSize:'12px', fontWeight:600, lineHeight:1.2 }}>{username}</div>
                            <div style={{ color: role === 'Admin' ? '#a78bfa' : role === 'Doctor' ? '#34d399' : role === 'Nurse' ? '#f472b6' : '#60a5fa', fontSize:'10px', fontWeight:600 }}>{role}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* OVERLAY */}
            {open && (
                <div onClick={() => setOpen(false)}
                    style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)', zIndex:1051 }} />
            )}

            {/* SIDEBAR DRAWER */}
            <div className="sidebar-custom"
                style={{ left: open ? '0' : '-280px', transition:'left 0.35s cubic-bezier(0.4,0,0.2,1)' }}>

                {/* HEADER */}
                <div className="d-flex justify-content-between align-items-center p-4 mb-2"
                    style={{ borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                    <div className="d-flex align-items-center gap-3">
                        <div className="d-flex justify-content-center align-items-center"
                            style={{ width:'46px', height:'46px', borderRadius:'14px', background:'linear-gradient(135deg,#2563eb,#7c3aed)', boxShadow:'0 4px 15px rgba(37,99,235,0.4)' }}>
                            <FaHeartbeat size={22} color="white" className="heartbeat" />
                        </div>
                        <div>
                            <div className="fw-bold text-white" style={{ fontSize:'16px' }}>HMS Panel</div>
                            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:'11px' }}>Hospital System</div>
                        </div>
                    </div>
                    <button className="btn btn-sm" onClick={() => setOpen(false)}
                        style={{ background:'rgba(255,255,255,0.08)', color:'white', borderRadius:'10px', padding:'6px 10px' }}>
                        <FaTimes size={14} />
                    </button>
                </div>

                {/* MENU */}
                <div className="px-3 py-2">
                    <div style={{ color:'rgba(255,255,255,0.3)', fontSize:'10px', fontWeight:700, letterSpacing:'1.5px', padding:'8px 12px 4px', textTransform:'uppercase' }}>
                        Navigation
                    </div>
                    {menuItems.filter(item => item.roles.includes(role)).map(({ path, icon: Icon, label, color }) => {
                        const isActive = location.pathname === path;
                        return (
                            <button key={path} className={`sidebar-btn ${isActive ? 'sidebar-active' : ''}`}
                                onClick={() => handleNav(path)}>
                                <div className="d-flex justify-content-center align-items-center"
                                    style={{ width:'34px', height:'34px', borderRadius:'10px', background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)', flexShrink:0 }}>
                                    <Icon size={16} color={isActive ? 'white' : color} />
                                </div>
                                <span>{label}</span>
                                {isActive && <div className="ms-auto" style={{ width:'6px', height:'6px', borderRadius:'50%', background:'white' }} />}
                            </button>
                        );
                    })}
                </div>

                {/* BOTTOM ACTIONS */}
                <div className="px-3 mt-4" style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'16px' }}>
                    <button className="sidebar-btn w-100 mb-2" onClick={() => setLightMode(!lightMode)}>
                        <div className="d-flex justify-content-center align-items-center"
                            style={{ width:'34px', height:'34px', borderRadius:'10px', background:'rgba(255,255,255,0.06)' }}>
                            {lightMode ? <FaMoon size={16} color="#a78bfa" /> : <FaSun size={16} color="#fbbf24" />}
                        </div>
                        <span>{lightMode ? 'Dark Mode' : 'Light Mode'}</span>
                    </button>
                    <button className="sidebar-btn w-100" onClick={handleLogout}>
                        <div className="d-flex justify-content-center align-items-center"
                            style={{ width:'34px', height:'34px', borderRadius:'10px', background:'rgba(239,68,68,0.2)' }}>
                            <FaSignOutAlt size={16} color="#f87171" />
                        </div>
                        <span style={{ color:'#f87171' }}>Logout</span>
                    </button>
                </div>

                {/* USER INFO */}
                <div className="mx-3 mb-3 mt-3 p-3" style={{ background:'rgba(255,255,255,0.04)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.06)' }}>
                    <div className="d-flex align-items-center gap-2">
                        <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#2563eb,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <FaUserCircle size={18} color="white" />
                        </div>
                        <div style={{ overflow:'hidden', flex:1 }}>
                            <div className="fw-semibold text-white" style={{ fontSize:'13px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{username}</div>
                            <div style={{ color: role === 'Admin' ? '#a78bfa' : role === 'Doctor' ? '#34d399' : role === 'Nurse' ? '#f472b6' : '#60a5fa', fontSize:'10px', fontWeight:600 }}>
                                {role === 'Admin' ? '🛡️ Admin' : role === 'Doctor' ? '🩺 Doctor' : role === 'Nurse' ? '💉 Nurse' : '🤒 Patient'}
                            </div>
                        </div>
                        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#10b981', boxShadow:'0 0 6px #10b981', flexShrink:0 }} />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Sidebar;
