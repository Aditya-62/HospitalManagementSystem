import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { getUser } from '../utils/auth';
import {
    FaUserMd, FaCalendarCheck, FaMoneyBillWave, FaStethoscope,
    FaClock, FaPhoneAlt, FaStar, FaCalendarPlus, FaCheckCircle, FaTimesCircle, FaPills
} from 'react-icons/fa';

const API = 'https://localhost:7202/api';

const DOCTOR_PHOTOS = [
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face',
];

const TIMINGS = ['9:00 AM - 1:00 PM', '10:00 AM - 2:00 PM', '2:00 PM - 6:00 PM', '4:00 PM - 8:00 PM', '8:00 AM - 12:00 PM', '11:00 AM - 3:00 PM'];

function PatientPortal() {
    const navigate = useNavigate();
    const user = getUser();
    const patientName = user?.username || '';

    const [tab, setTab] = useState('doctors');
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [bills, setBills] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookForm, setBookForm] = useState({ patientName, doctorName: '', appointmentDate: '', status: 'Pending', assignedNurse: '' });
    const [bookingDoctor, setBookingDoctor] = useState(null);

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        Promise.all([
            axios.get(`${API}/Doctor`),
            axios.get(`${API}/Appointment`),
            axios.get(`${API}/Bill`),
            axios.get(`${API}/Prescription/bypatientname/${patientName}`),
        ]).then(([d, a, b, rx]) => {
            setDoctors(d.data);
            setAppointments(a.data.filter(x => x.patientName?.toLowerCase() === patientName.toLowerCase()));
            setBills(b.data.filter(x => x.patientName?.toLowerCase() === patientName.toLowerCase()));
            setPrescriptions(rx.data);
            setLoading(false);
        }).catch(() => { toast.error('Data load failed'); setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleBook = (e) => {
        e.preventDefault();
        if (!bookForm.doctorName) { toast.warning('Please select a doctor'); return; }
        axios.post(`${API}/Appointment`, bookForm)
            .then(() => {
                toast.success('Appointment booked ✅');
                setTab('appointments');
                axios.get(`${API}/Appointment`).then(r =>
                    setAppointments(r.data.filter(x => x.patientName?.toLowerCase() === patientName.toLowerCase()))
                );
                setBookForm({ patientName, doctorName: '', appointmentDate: '', status: 'Pending', assignedNurse: '' });
                setBookingDoctor(null);
            })
            .catch(() => toast.error('Booking failed ❌'));
    };

    const quickBook = (doctor) => {
        setBookingDoctor(doctor);
        setBookForm(f => ({ ...f, doctorName: doctor.name }));
        setTab('book');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1 min-vh-100 bg-portal d-flex align-items-center justify-content-center">
                <div className="text-center text-white">
                    <div className="loader-spinner mx-auto mb-3" />
                    <p className="fw-semibold">Loading Patient Portal...</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1 min-vh-100 bg-portal" style={{ padding: '90px 30px 40px' }}>
                <div className="container-fluid fade-in">

                    {/* HEADER */}
                    <div className="glass-card p-4 mb-4 text-white">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(37,99,235,0.4)' }}>
                                    <FaStethoscope size={26} color="white" />
                                </div>
                                <div>
                                    <h2 className="fw-bold mb-0" style={{ fontSize: '2rem' }}>Patient Portal</h2>
                                    <p className="mb-0" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                                        Welcome, <span style={{ color: '#60a5fa', fontWeight: 600 }}>{patientName}</span> 👋
                                    </p>
                                </div>
                            </div>
                            {/* STATS */}
                            <div className="d-flex gap-3 flex-wrap">
                                {[
                                    { label: 'Appointments', value: appointments.length, color: '#fbbf24' },
                                    { label: 'Bills', value: bills.length, color: '#f87171' },
                                    { label: 'Paid', value: bills.filter(b => b.paymentStatus === 'Paid').length, color: '#34d399' },
                                    { label: 'Prescriptions', value: prescriptions.length, color: '#c4b5fd' },
                                ].map(s => (
                                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '10px 18px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ color: s.color, fontSize: '22px', fontWeight: 700, lineHeight: 1 }}>{s.value}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '2px' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* TABS */}
                    <div className="d-flex gap-2 mb-4 flex-wrap">
                        {[
                            { key: 'doctors', label: '🩺 Doctors', color: '#34d399' },
                            { key: 'book', label: '📅 Book Appointment', color: '#60a5fa' },
                            { key: 'appointments', label: '📋 My Appointments', color: '#fbbf24' },
                            { key: 'bills', label: '💰 My Bills', color: '#f87171' },
                            { key: 'prescriptions', label: '💊 My Prescriptions', color: '#c4b5fd' },
                        ].map(t => (
                            <button key={t.key} onClick={() => setTab(t.key)}
                                style={{
                                    padding: '10px 22px', borderRadius: '14px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s',
                                    background: tab === t.key ? `linear-gradient(135deg, ${t.color}33, ${t.color}22)` : 'rgba(255,255,255,0.06)',
                                    color: tab === t.key ? t.color : 'rgba(255,255,255,0.6)',
                                    borderBottom: tab === t.key ? `2px solid ${t.color}` : '2px solid transparent',
                                    boxShadow: tab === t.key ? `0 4px 15px ${t.color}22` : 'none',
                                }}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* ── TAB: DOCTORS ── */}
                    {tab === 'doctors' && (
                        <div className="row g-4">
                            {doctors.length === 0 ? (
                                <div className="col-12 text-center py-5" style={{ color: 'rgba(255,255,255,0.4)' }}>No doctors found</div>
                            ) : doctors.map((doc, i) => (
                                <div className="col-xl-3 col-lg-4 col-md-6" key={doc.id}>
                                    <div className="glass-card p-0 text-white overflow-hidden" style={{ borderRadius: '20px' }}>
                                        {/* TOP GRADIENT */}
                                        <div style={{ height: '80px', background: `linear-gradient(135deg, #1e3a5f, #2d1b69)`, position: 'relative' }}>
                                            <div style={{ position: 'absolute', bottom: '-36px', left: '50%', transform: 'translateX(-50%)' }}>
                                                <img src={DOCTOR_PHOTOS[i % DOCTOR_PHOTOS.length]} alt={doc.name}
                                                    style={{ width: '72px', height: '72px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.2)', objectFit: 'cover', background: '#1e293b' }}
                                                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=2563eb&color=fff&size=72`; }}
                                                />
                                            </div>
                                        </div>

                                        <div className="p-4 pt-5 text-center">
                                            <h6 className="fw-bold mb-1" style={{ fontSize: '15px' }}>Dr. {doc.name}</h6>
                                            <span className="badge mb-3" style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)', fontSize: '11px' }}>
                                                {doc.specialization}
                                            </span>

                                            <div className="d-flex flex-column gap-2 mb-3">
                                                <div className="d-flex align-items-center gap-2 justify-content-center" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                                                    <FaClock size={11} color="#fbbf24" />
                                                    {TIMINGS[i % TIMINGS.length]}
                                                </div>
                                                <div className="d-flex align-items-center gap-2 justify-content-center" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                                                    <FaPhoneAlt size={11} color="#34d399" />
                                                    {doc.phone}
                                                </div>
                                                <div className="d-flex align-items-center gap-2 justify-content-center" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>
                                                    <FaUserMd size={11} color="#a78bfa" />
                                                    {doc.experience} yrs experience
                                                </div>
                                            </div>

                                            {/* STARS */}
                                            <div className="d-flex justify-content-center gap-1 mb-3">
                                                {[1,2,3,4,5].map(s => <FaStar key={s} size={12} color="#fbbf24" />)}
                                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginLeft: '4px' }}>5.0</span>
                                            </div>

                                            <button onClick={() => quickBook(doc)}
                                                style={{ width: '100%', padding: '9px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.3s' }}
                                                onMouseOver={e => e.target.style.opacity = '0.85'}
                                                onMouseOut={e => e.target.style.opacity = '1'}>
                                                <FaCalendarPlus size={12} className="me-2" />Book Appointment
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── TAB: BOOK APPOINTMENT ── */}
                    {tab === 'book' && (
                        <div className="row justify-content-center">
                            <div className="col-lg-7">
                                <div className="glass-card p-5 text-white">
                                    <div className="d-flex align-items-center gap-3 mb-4">
                                        <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <FaCalendarPlus size={20} color="white" />
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-0" style={{ color: '#60a5fa' }}>Book Appointment</h5>
                                            {bookingDoctor && <p className="mb-0" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Dr. {bookingDoctor.name} - {bookingDoctor.specialization}</p>}
                                        </div>
                                    </div>

                                    <form onSubmit={handleBook}>
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '6px', display: 'block' }}>Your Name</label>
                                                <input type="text" className="form-control custom-input" value={patientName} readOnly
                                                    style={{ background: 'rgba(255,255,255,0.04) !important', cursor: 'not-allowed' }} />
                                            </div>
                                            <div className="col-12">
                                                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '6px', display: 'block' }}>Select Doctor</label>
                                                <select className="form-control custom-input" value={bookForm.doctorName}
                                                    onChange={e => { setBookForm(f => ({ ...f, doctorName: e.target.value })); setBookingDoctor(doctors.find(d => d.name === e.target.value) || null); }} required>
                                                    <option value="">-- Select a Doctor --</option>
                                                    {doctors.map(d => (
                                                        <option key={d.id} value={d.name}>Dr. {d.name} ({d.specialization})</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* SELECTED DOCTOR INFO */}
                                            {bookingDoctor && (
                                                <div className="col-12">
                                                    <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '14px', padding: '14px 18px' }}>
                                                        <div className="d-flex align-items-center gap-3">
                                                            <img src={DOCTOR_PHOTOS[doctors.findIndex(d => d.id === bookingDoctor.id) % DOCTOR_PHOTOS.length]}
                                                                alt={bookingDoctor.name}
                                                                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                                                                onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bookingDoctor.name)}&background=2563eb&color=fff&size=48`; }}
                                                            />
                                                            <div>
                                                                <div className="fw-semibold" style={{ fontSize: '14px' }}>Dr. {bookingDoctor.name}</div>
                                                                <div style={{ color: '#60a5fa', fontSize: '12px' }}>{bookingDoctor.specialization}</div>
                                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
                                                                    <FaClock size={10} className="me-1" />
                                                                    {TIMINGS[doctors.findIndex(d => d.id === bookingDoctor.id) % TIMINGS.length]}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="col-12">
                                                <label style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '6px', display: 'block' }}>Appointment Date</label>
                                                <input type="date" className="form-control custom-input"
                                                    min={new Date().toISOString().split('T')[0]}
                                                    value={bookForm.appointmentDate}
                                                    onChange={e => setBookForm(f => ({ ...f, appointmentDate: e.target.value }))} required />
                                            </div>
                                        </div>

                                        <button type="submit" className="btn btn-gradient-blue w-100 mt-4 py-3" style={{ fontSize: '15px' }}>
                                            <FaCalendarCheck size={16} className="me-2" />Confirm Appointment
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── TAB: MY APPOINTMENTS ── */}
                    {tab === 'appointments' && (
                        <div className="glass-card p-4 text-white">
                            <h5 className="fw-bold mb-4" style={{ color: '#fbbf24' }}>
                                My Appointments
                                <span className="badge ms-2" style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', fontSize: '12px' }}>{appointments.length}</span>
                            </h5>
                            {appointments.length === 0 ? (
                                <div className="text-center py-5">
                                    <FaCalendarCheck size={48} color="rgba(255,255,255,0.1)" className="mb-3" />
                                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>No appointments found</p>
                                    <button onClick={() => setTab('book')} className="btn btn-gradient-blue mt-2">Book Appointment</button>
                                </div>
                            ) : (
                                <div className="row g-3">
                                    {appointments.map(a => (
                                        <div className="col-lg-6" key={a.id}>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div>
                                                        <div className="fw-bold" style={{ fontSize: '15px' }}>Dr. {a.doctorName}</div>
                                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>#{a.id}</div>
                                                    </div>
                                                    <span className="badge" style={{
                                                        background: a.status === 'Completed' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                                                        color: a.status === 'Completed' ? '#34d399' : '#fbbf24',
                                                        border: `1px solid ${a.status === 'Completed' ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
                                                    }}>
                                                        {a.status === 'Completed' ? <FaCheckCircle size={10} className="me-1" /> : <FaClock size={10} className="me-1" />}
                                                        {a.status}
                                                    </span>
                                                </div>
                                                <div className="d-flex gap-3" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                                                    <span><FaCalendarCheck size={11} className="me-1" color="#60a5fa" />{a.appointmentDate?.split('T')[0]}</span>
                                                    {a.assignedNurse && <span>💉 {a.assignedNurse}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TAB: MY PRESCRIPTIONS ── */}
                    {tab === 'prescriptions' && (
                        <div className="glass-card p-4 text-white">
                            <h5 className="fw-bold mb-4" style={{ color: '#c4b5fd' }}>
                                <FaPills size={16} className="me-2" />My Prescriptions
                                <span className="badge ms-2" style={{ background: 'rgba(124,58,237,0.2)', color: '#c4b5fd', fontSize: '12px' }}>{prescriptions.length}</span>
                            </h5>
                            {prescriptions.length === 0 ? (
                                <div className="text-center py-5">
                                    <FaPills size={48} color="rgba(255,255,255,0.1)" className="mb-3" />
                                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>No prescriptions found</p>
                                </div>
                            ) : (
                                <div className="row g-3">
                                    {prescriptions.map(p => {
                                        let meds = [];
                                        try { meds = JSON.parse(p.medicines); } catch { meds = [{ name: p.medicines, dosage: p.dosage, duration: '' }]; }
                                        return (
                                            <div className="col-12" key={p.id}>
                                                <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '16px', padding: '18px' }}>
                                                    <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                                                        <div>
                                                            <div className="fw-bold" style={{ color: '#c4b5fd' }}>Dr. {p.doctorName}</div>
                                                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>📅 {new Date(p.prescribedDate).toLocaleDateString()}</div>
                                                            {p.diagnosis && <div style={{ fontSize: '12px', color: '#fbbf24', marginTop: '4px' }}>🔍 {p.diagnosis}</div>}
                                                            {p.instructions && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>📋 {p.instructions}</div>}
                                                        </div>
                                                    </div>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {meds.map((m, i) => (
                                                            <div key={i} style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: '10px', padding: '8px 14px' }}>
                                                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#c4b5fd' }}>💊 {m.name}</div>
                                                                {m.dosage && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{m.dosage}</div>}
                                                                {m.duration && <div style={{ fontSize: '11px', color: '#34d399' }}>⏱ {m.duration}</div>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── TAB: MY BILLS ── */}
                    {tab === 'bills' && (
                        <div className="glass-card p-4 text-white">
                            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                                <h5 className="fw-bold mb-0" style={{ color: '#f87171' }}>
                                    My Bills
                                    <span className="badge ms-2" style={{ background: 'rgba(220,38,38,0.2)', color: '#f87171', fontSize: '12px' }}>{bills.length}</span>
                                </h5>
                                {bills.length > 0 && (
                                    <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '12px', padding: '8px 16px', fontSize: '14px' }}>
                                        Total: <span style={{ color: '#34d399', fontWeight: 700 }}>₹ {bills.reduce((s, b) => s + Number(b.amount), 0).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                            {bills.length === 0 ? (
                                <div className="text-center py-5">
                                    <FaMoneyBillWave size={48} color="rgba(255,255,255,0.1)" className="mb-3" />
                                    <p style={{ color: 'rgba(255,255,255,0.4)' }}>No bills found</p>
                                </div>
                            ) : (
                                <div className="row g-3">
                                    {bills.map(b => (
                                        <div className="col-lg-6" key={b.id}>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '18px', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Bill #{b.id}</div>
                                                        <div className="fw-bold mt-1" style={{ color: '#34d399', fontSize: '20px' }}>₹ {Number(b.amount).toLocaleString()}</div>
                                                    </div>
                                                    <span className="badge" style={{
                                                        background: b.paymentStatus === 'Paid' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                                                        color: b.paymentStatus === 'Paid' ? '#34d399' : '#f87171',
                                                        border: `1px solid ${b.paymentStatus === 'Paid' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
                                                        fontSize: '13px', padding: '8px 14px'
                                                    }}>
                                                        {b.paymentStatus === 'Paid'
                                                            ? <><FaCheckCircle size={11} className="me-1" />Paid</>
                                                            : <><FaTimesCircle size={11} className="me-1" />Unpaid</>}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

export default PatientPortal;
