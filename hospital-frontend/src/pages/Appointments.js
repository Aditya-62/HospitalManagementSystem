import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { FaCalendarCheck, FaUserInjured, FaUserMd, FaEdit, FaTrash, FaSearch, FaPlus, FaUserNurse } from 'react-icons/fa';
import { getUser } from '../utils/auth';

const API = 'https://localhost:7202/api/Appointment';

function Appointments() {
    const navigate = useNavigate();
    const user = getUser();
    const isAdmin = user?.role === 'Admin';
    const isDoctor = user?.role === 'Doctor';
    const isNurse = user?.role === 'Nurse';
    const isPatient = user?.role === 'Patient';

    const [appointments, setAppointments] = useState([]);
    const [search, setSearch] = useState('');
    const [editId, setEditId] = useState(null);
    const [assigningId, setAssigningId] = useState(null);
    const [selectedNurse, setSelectedNurse] = useState('');
    const [formData, setFormData] = useState({ patientName: '', doctorName: '', appointmentDate: '', status: '', assignedNurse: '' });

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAppointments = () => {
        let url = API;
        if (isDoctor) url = `${API}/bydoctor/${user.username}`;
        else if (isNurse) url = `${API}/bynurse/${user.username}`;
        axios.get(url)
            .then(r => {
                let data = r.data;
                if (isPatient) {
                    data = data.filter(a => a.patientName?.toLowerCase() === user.username?.toLowerCase());
                }
                setAppointments(data);
            })
            .catch(() => toast.error("Failed To Load Appointments"));
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const editAppointment = (a) => {
        setEditId(a.id);
        setFormData({ patientName: a.patientName, doctorName: a.doctorName, appointmentDate: a.appointmentDate.split('T')[0], status: a.status, assignedNurse: a.assignedNurse || '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            // Doctor apna naam auto-fill
            doctorName: isDoctor ? user.username : formData.doctorName,
        };
        const req = editId ? axios.put(`${API}/${editId}`, payload) : axios.post(API, payload);
        req.then(() => {
            toast.success(editId ? 'Updated ✅' : 'Added ✅');
            fetchAppointments();
            setEditId(null);
            setFormData({ patientName: '', doctorName: '', appointmentDate: '', status: '', assignedNurse: '' });
        }).catch(() => toast.error("Operation Failed"));
    };

    const deleteAppointment = (id) => {
        if (!window.confirm("Delete?")) return;
        axios.delete(`${API}/${id}`)
            .then(() => { toast.success("Deleted ✅"); fetchAppointments(); })
            .catch(() => toast.error("Delete Failed"));
    };

    const handleAssignNurse = async (apptId) => {
        if (!selectedNurse) { toast.warning("Please enter nurse name"); return; }
        try {
            await axios.put(`${API}/${apptId}/assignnurse`, JSON.stringify(selectedNurse), {
                headers: { 'Content-Type': 'application/json' }
            });
            toast.success(`Nurse "${selectedNurse}" assigned ✅`);
            setAssigningId(null);
            setSelectedNurse('');
            fetchAppointments();
        } catch { toast.error("Assign Failed ❌"); }
    };

    const filtered = appointments.filter(a =>
        a.patientName?.toLowerCase().includes(search.toLowerCase()) ||
        a.doctorName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1 min-vh-100 bg-appointments" style={{ padding: '90px 30px 40px' }}>
                <div className="container-fluid fade-in">

                    {/* HEADER */}
                    <div className="glass-card p-4 mb-4 text-white">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(245,158,11,0.4)' }}>
                                    <FaCalendarCheck size={26} color="white" />
                                </div>
                                <div>
                                    <h2 className="fw-bold mb-0" style={{ fontSize: '2rem' }}>Appointment Management</h2>
                                    <p className="mb-0" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                                        {isDoctor ? `Dr. ${user.username}'s appointments` : isNurse ? `Nurse ${user.username}'s assigned appointments` : isPatient ? `${user.username}'s appointments` : 'All appointments'}
                                    </p>
                                </div>
                            </div>
                            <button className="btn btn-sm" onClick={() => navigate('/dashboard')}
                                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px' }}>
                                ← Dashboard
                            </button>
                        </div>
                    </div>

                    {/* ROLE BADGE */}
                    <div className="mb-4">
                        <span style={{
                            background: isAdmin ? 'rgba(124,58,237,0.2)' : isDoctor ? 'rgba(5,150,105,0.2)' : isNurse ? 'rgba(236,72,153,0.2)' : 'rgba(37,99,235,0.2)',
                            color: isAdmin ? '#a78bfa' : isDoctor ? '#34d399' : isNurse ? '#f472b6' : '#60a5fa',
                            border: `1px solid ${isAdmin ? 'rgba(167,139,250,0.3)' : isDoctor ? 'rgba(52,211,153,0.3)' : isNurse ? 'rgba(244,114,182,0.3)' : 'rgba(96,165,250,0.3)'}`,
                            borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: 600
                        }}>
                            {isAdmin ? '🛡️ Admin - All Appointments' : isDoctor ? `🩺 Doctor - ${user.username}'s patients` : isNurse ? `💉 Nurse - ${user.username}'s assigned` : `🤒 Patient - ${user.username}`}
                        </span>
                    </div>

                    {/* FORM - Admin and Doctor can add */}
                    {(isAdmin || isDoctor) && (
                        <div className="glass-card p-4 mb-4 text-white">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <FaPlus size={16} color="#fbbf24" />
                                <h5 className="fw-bold mb-0" style={{ color: '#fbbf24' }}>
                                    {editId ? 'Update Appointment' : 'Add New Appointment'}
                                </h5>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <div className="input-group">
                                            <span className="input-group-text" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#60a5fa', borderRight: 'none' }}>
                                                <FaUserInjured size={14} />
                                            </span>
                                            <input type="text" name="patientName" placeholder="Patient Name" className="form-control custom-input" style={{ borderLeft: 'none' }}
                                                value={formData.patientName} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="input-group">
                                            <span className="input-group-text" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#34d399', borderRight: 'none' }}>
                                                <FaUserMd size={14} />
                                            </span>
                                            <input type="text" name="doctorName" placeholder={isDoctor ? `Dr. ${user.username} (auto)` : "Doctor Name"} className="form-control custom-input" style={{ borderLeft: 'none' }}
                                                value={isDoctor ? user.username : formData.doctorName}
                                                onChange={handleChange}
                                                readOnly={isDoctor} required />
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <input type="date" name="appointmentDate" className="form-control custom-input"
                                            value={formData.appointmentDate} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-4">
                                        <select name="status" className="form-control custom-input" value={formData.status} onChange={handleChange} required>
                                            <option value="">Select Status</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Completed">Completed</option>
                                        </select>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="input-group">
                                            <span className="input-group-text" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#f472b6', borderRight: 'none' }}>
                                                <FaUserNurse size={14} />
                                            </span>
                                            <input type="text" name="assignedNurse" placeholder="Nurse assign (optional)" className="form-control custom-input" style={{ borderLeft: 'none' }}
                                                value={formData.assignedNurse} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex gap-2 mt-4">
                                    <button className="btn btn-gradient-blue px-4">{editId ? '✏️ Update' : '➕ Add'}</button>
                                    {editId && (
                                        <button type="button" className="btn px-4"
                                            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                                            onClick={() => { setEditId(null); setFormData({ patientName: '', doctorName: '', appointmentDate: '', status: '', assignedNurse: '' }); }}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TABLE */}
                    <div className="glass-card p-4 text-white">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                            <h5 className="fw-bold mb-0" style={{ color: '#fbbf24' }}>
                                Appointments <span className="badge ms-2" style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', fontSize: '12px' }}>{filtered.length}</span>
                            </h5>
                            <div className="input-group" style={{ width: '280px' }}>
                                <span className="input-group-text" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#60a5fa', borderRight: 'none' }}>
                                    <FaSearch size={13} />
                                </span>
                                <input type="text" placeholder="Search..." className="form-control custom-input" style={{ borderLeft: 'none' }}
                                    value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table pro-table align-middle text-center mb-0">
                                <thead style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.3),rgba(217,119,6,0.3))' }}>
                                    <tr>
                                        {['ID', 'Patient', 'Doctor', 'Date', 'Status', 'Assigned Nurse', ...(isAdmin || isDoctor ? ['Actions'] : [])].map(h => (
                                            <th key={h} style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr><td colSpan="7" className="py-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                            {isDoctor ? 'No patients yet' : isNurse ? 'No appointments assigned' : 'No appointments found'}
                                        </td></tr>
                                    ) : filtered.map(a => (
                                        <tr key={a.id} style={{ color: 'rgba(255,255,255,0.85)' }}>
                                            <td><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>#{a.id}</span></td>
                                            <td className="fw-semibold">{a.patientName}</td>
                                            <td>{a.doctorName}</td>
                                            <td>{a.appointmentDate?.split('T')[0]}</td>
                                            <td>
                                                <span className="badge" style={{
                                                    background: a.status === 'Completed' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
                                                    color: a.status === 'Completed' ? '#34d399' : '#fbbf24',
                                                    border: `1px solid ${a.status === 'Completed' ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`
                                                }}>{a.status}</span>
                                            </td>
                                            <td>
                                                {a.assignedNurse ? (
                                                    <span className="badge" style={{ background: 'rgba(236,72,153,0.2)', color: '#f472b6', border: '1px solid rgba(244,114,182,0.3)' }}>
                                                        💉 {a.assignedNurse}
                                                    </span>
                                                ) : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>-</span>}
                                            </td>
                                            {(isAdmin || isDoctor) && (
                                                <td>
                                                    <button className="btn btn-sm me-1" onClick={() => { setAssigningId(a.id); setSelectedNurse(a.assignedNurse || ''); }}
                                                        style={{ background: 'rgba(236,72,153,0.15)', color: '#f472b6', border: '1px solid rgba(244,114,182,0.3)', borderRadius: '10px', padding: '5px 10px' }}>
                                                        <FaUserNurse size={11} className="me-1" />Nurse
                                                    </button>
                                                    <button className="btn btn-sm me-1" onClick={() => editAppointment(a)}
                                                        style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '10px', padding: '5px 10px' }}>
                                                        <FaEdit size={11} />
                                                    </button>
                                                    {isAdmin && (
                                                        <button className="btn btn-sm" onClick={() => deleteAppointment(a.id)}
                                                            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '5px 10px' }}>
                                                            <FaTrash size={11} />
                                                        </button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* NURSE ASSIGN MODAL */}
            {assigningId && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-card p-5 text-white" style={{ width: '420px', borderRadius: '24px' }}>
                        <h5 className="fw-bold mb-2" style={{ color: '#f472b6' }}>💉 Assign Nurse</h5>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '20px' }}>Appointment #{assigningId} - enter nurse name</p>
                        <input type="text" placeholder="Enter nurse name" className="form-control custom-input mb-4"
                            value={selectedNurse} onChange={e => setSelectedNurse(e.target.value)} />
                        <div className="d-flex gap-3">
                            <button className="btn flex-fill py-2 fw-bold"
                                style={{ background: 'linear-gradient(135deg,#ec4899,#be185d)', color: 'white', borderRadius: '12px' }}
                                onClick={() => handleAssignNurse(assigningId)}>
                                ✅ Assign Nurse
                            </button>
                            <button className="btn flex-fill py-2"
                                style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px' }}
                                onClick={() => { setAssigningId(null); setSelectedNurse(''); }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Appointments;
