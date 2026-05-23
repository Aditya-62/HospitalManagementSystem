import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { FaUserInjured, FaEdit, FaTrash, FaSearch, FaPlus, FaUserNurse, FaFileExcel } from 'react-icons/fa';
import CountUp from 'react-countup';
import { getUser } from '../utils/auth';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const API = 'https://localhost:7202/api/Patient';

function Patients() {
    const navigate = useNavigate();
    const user = getUser(); // { username, role }
    const isAdmin = user?.role === 'Admin';
    const isPatient = user?.role === 'Patient';
    const isDoctor = user?.role === 'Doctor';
    const isNurse = user?.role === 'Nurse';

    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState('');
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState(null); // nurse assign modal
    const [selectedNurse, setSelectedNurse] = useState('');

    const [formData, setFormData] = useState({ name: '', age: '', gender: '', disease: '', phone: '', assignedUsername: '' });

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchPatients = async () => {
        try {
            let res;
            if (isAdmin || isDoctor || isNurse) {
                res = await axios.get(API);
            } else {
                res = await axios.get(`${API}/byuser/${user.username}`);
            }
            setPatients(res.data);
            setLoading(false);
        } catch { toast.error("Failed To Load Patients"); }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const editPatient = (p) => {
        setEditId(p.id);
        setFormData({ name: p.name, age: p.age, gender: p.gender, disease: p.disease, phone: p.phone, assignedUsername: p.assignedUsername || '' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.phone.length !== 10) { toast.warning("Phone number must be 10 digits"); return; }
        try {
            const payload = {
                ...formData,
                // Patient register karte waqt apna username link hoga
                assignedUsername: isPatient ? user.username : formData.assignedUsername
            };
            if (editId) await axios.put(`${API}/${editId}`, payload);
            else await axios.post(API, payload);
            toast.success(editId ? 'Patient Updated ✅' : 'Patient Added ✅');
            fetchPatients();
            setEditId(null);
            setFormData({ name: '', age: '', gender: '', disease: '', phone: '', assignedUsername: '' });
        } catch { toast.error("Operation Failed ❌"); }
    };

    const deletePatient = async (id) => {
        if (!window.confirm("Delete this patient?")) return;
        try {
            await axios.delete(`${API}/${id}`);
            toast.success("Deleted ✅");
            fetchPatients();
        } catch { toast.error("Delete Failed ❌"); }
    };

    // Nurse assign karo patient ko
    const handleAssignNurse = async (patientId) => {
        if (!selectedNurse) { toast.warning("Nurse select karo"); return; }
        try {
            await axios.put(`${API}/${patientId}/assignnurse`, JSON.stringify(selectedNurse), {
                headers: { 'Content-Type': 'application/json' }
            });
            toast.success(`Nurse "${selectedNurse}" assigned ✅`);
            setAssigningId(null);
            setSelectedNurse('');
            fetchPatients();
        } catch { toast.error("Assign Failed ❌"); }
    };

    const filtered = patients.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase())
    );

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filtered.map(p => ({
            ID: p.id, Name: p.name, Age: p.age, Gender: p.gender,
            Disease: p.disease, Phone: p.phone,
            'Assigned Nurse': p.assignedNurse || '-',
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Patients');
        const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([buf], { type: 'application/octet-stream' }), 'patients-report.xlsx');
        toast.success('Excel exported ✅');
    };

    if (loading) return (
        <div className="loader-wrapper">
            <div className="text-center">
                <div className="loader-spinner mx-auto mb-3" />
                <p className="text-white fw-semibold">Loading Patients...</p>
            </div>
        </div>
    );

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1 min-vh-100 bg-patients" style={{ padding: '90px 30px 40px' }}>
                <div className="container-fluid fade-in">

                    {/* HEADER */}
                    <div className="glass-card p-4 mb-4 text-white">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg,#2563eb,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(37,99,235,0.4)' }}>
                                    <FaUserInjured size={26} color="white" />
                                </div>
                                <div>
                    <h2 className="fw-bold mb-0" style={{ fontSize: '2rem' }}>
                                        {isPatient ? 'My Medical Record' : 'Patient Management'}
                                    </h2>
                                    <p className="mb-0" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                                        {isPatient ? `${user.username}'s records` : isDoctor ? `Dr. ${user.username}'s patients` : isNurse ? `Nurse ${user.username}'s assigned patients` : 'Manage all patients'}
                                    </p>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <div className="glass-card p-3 text-center" style={{ minWidth: '90px' }}>
                                    <h3 className="fw-bold mb-0" style={{ color: '#60a5fa' }}><CountUp end={patients.length} duration={2} /></h3>
                                    <small style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>Total</small>
                                </div>
                                <button className="btn btn-sm" onClick={() => navigate('/dashboard')}
                                    style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px' }}>
                                    ← Dashboard
                                </button>
                            </div>
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
                            {isAdmin ? '🛡️ Admin View - All Data' : isDoctor ? `🩺 Doctor View - ${user.username}` : isNurse ? `💉 Nurse View - ${user.username}` : `🤒 Patient View - ${user.username}`}
                        </span>
                    </div>

                    {/* ADD/EDIT FORM - Only Patient and Admin can add */}
                    {(isAdmin || isPatient) && (
                        <div className="glass-card p-4 mb-4 text-white">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <FaPlus size={16} color="#60a5fa" />
                                <h5 className="fw-bold mb-0" style={{ color: '#60a5fa' }}>
                                    {editId ? 'Update Patient' : isPatient ? 'Add Your Record' : 'Add New Patient'}
                                </h5>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <input type="text" name="name" placeholder="Patient Name" className="form-control custom-input"
                                            value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <input type="number" name="age" placeholder="Age" className="form-control custom-input"
                                            value={formData.age} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <select name="gender" className="form-control custom-input" value={formData.gender} onChange={handleChange} required>
                                            <option value="">Select Gender</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <input type="text" name="disease" placeholder="Disease" className="form-control custom-input"
                                            value={formData.disease} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6">
                                        <input type="text" name="phone" placeholder="Phone (10 digits)" className="form-control custom-input"
                                            value={formData.phone}
                                            onChange={(e) => { if (/^\d{0,10}$/.test(e.target.value)) setFormData({ ...formData, phone: e.target.value }); }}
                                            maxLength="10" required />
                                    </div>
                                    {/* Admin ke liye username link field */}
                                    {isAdmin && (
                                        <div className="col-md-6">
                                            <input type="text" name="assignedUsername" placeholder="Patient Username (optional)" className="form-control custom-input"
                                                value={formData.assignedUsername} onChange={handleChange} />
                                        </div>
                                    )}
                                </div>
                                <div className="d-flex gap-2 mt-4">
                                    <button className="btn btn-gradient-blue px-4">
                                        {editId ? '✏️ Update' : '➕ Add'}
                                    </button>
                                    {editId && (
                                        <button type="button" className="btn px-4"
                                            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                                            onClick={() => { setEditId(null); setFormData({ name: '', age: '', gender: '', disease: '', phone: '', assignedUsername: '' }); }}>
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
                            <div className="d-flex align-items-center gap-3">
                                <h5 className="fw-bold mb-0" style={{ color: '#60a5fa' }}>
                                    Patient List <span className="badge ms-2" style={{ background: 'rgba(37,99,235,0.2)', color: '#60a5fa', fontSize: '12px' }}>{filtered.length}</span>
                                </h5>
                                {(isAdmin || isDoctor) && (
                                    <button className="btn btn-sm" onClick={exportExcel}
                                        style={{ background:'rgba(5,150,105,0.15)', color:'#34d399', border:'1px solid rgba(52,211,153,0.3)', borderRadius:'10px', padding:'6px 14px', fontSize:'13px' }}>
                                        <FaFileExcel size={13} className="me-1" />Export Excel
                                    </button>
                                )}
                            </div>
                            <div className="input-group" style={{ width: '280px' }}>
                                <span className="input-group-text" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#60a5fa', borderRight: 'none' }}>
                                    <FaSearch size={13} />
                                </span>
                                <input type="text" placeholder="Search..." className="form-control custom-input"
                                    style={{ borderLeft: 'none' }} value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="table pro-table align-middle text-center mb-0">
                                <thead style={{ background: 'linear-gradient(135deg,rgba(37,99,235,0.3),rgba(6,182,212,0.3))' }}>
                                    <tr>
                                        {['ID', 'Name', 'Age', 'Gender', 'Disease', 'Phone',
                                            ...(isAdmin ? ['Username'] : []),
                                            'Assigned Nurse',
                                            ...(isAdmin || isDoctor ? ['Actions'] : [])
                                        ].map(h => (
                                            <th key={h} style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr><td colSpan="10" className="py-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                            {isPatient ? 'No records found. Add your record.' : 'No patients found'}
                                        </td></tr>
                                    ) : filtered.map(p => (
                                        <tr key={p.id} style={{ color: 'rgba(255,255,255,0.85)' }}>
                                            <td><span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>#{p.id}</span></td>
                                            <td className="fw-semibold">{p.name}</td>
                                            <td>{p.age}</td>
                                            <td>
                                                <span className="badge" style={{
                                                    background: p.gender === 'Male' ? 'rgba(37,99,235,0.2)' : p.gender === 'Female' ? 'rgba(236,72,153,0.2)' : 'rgba(107,114,128,0.2)',
                                                    color: p.gender === 'Male' ? '#60a5fa' : p.gender === 'Female' ? '#f472b6' : '#9ca3af',
                                                    border: `1px solid ${p.gender === 'Male' ? 'rgba(96,165,250,0.3)' : p.gender === 'Female' ? 'rgba(244,114,182,0.3)' : 'rgba(156,163,175,0.3)'}`
                                                }}>{p.gender}</span>
                                            </td>
                                            <td>{p.disease}</td>
                                            <td>{p.phone}</td>
                                            {isAdmin && <td><span style={{ color: '#a78bfa', fontSize: '12px' }}>{p.assignedUsername || '-'}</span></td>}
                                            <td>
                                                {p.assignedNurse ? (
                                                    <span className="badge" style={{ background: 'rgba(236,72,153,0.2)', color: '#f472b6', border: '1px solid rgba(244,114,182,0.3)' }}>
                                                        💉 {p.assignedNurse}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Not assigned</span>
                                                )}
                                            </td>
                                            {(isAdmin || isDoctor) && (
                                                <td>
                                                    {/* Nurse Assign Button */}
                                                    <button className="btn btn-sm me-1" onClick={() => { setAssigningId(p.id); setSelectedNurse(p.assignedNurse || ''); }}
                                                        style={{ background: 'rgba(236,72,153,0.15)', color: '#f472b6', border: '1px solid rgba(244,114,182,0.3)', borderRadius: '10px', padding: '5px 10px' }}>
                                                        <FaUserNurse size={11} className="me-1" />Nurse
                                                    </button>
                                                    {isAdmin && (
                                                        <>
                                                            <button className="btn btn-sm me-1" onClick={() => editPatient(p)}
                                                                style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '10px', padding: '5px 10px' }}>
                                                                <FaEdit size={11} />
                                                            </button>
                                                            <button className="btn btn-sm" onClick={() => deletePatient(p.id)}
                                                                style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '5px 10px' }}>
                                                                <FaTrash size={11} />
                                                            </button>
                                                        </>
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
                        <h5 className="fw-bold mb-4" style={{ color: '#f472b6' }}>💉 Assign Nurse</h5>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '20px' }}>
                            Enter nurse name for Patient #{assigningId}
                        </p>
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

export default Patients;
