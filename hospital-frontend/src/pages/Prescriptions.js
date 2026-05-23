import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { getUser } from '../utils/auth';
import {
    FaPills, FaPlus, FaSearch, FaEdit, FaTrash, FaUserInjured,
    FaFileMedical, FaFilePdf, FaNotesMedical
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API = 'https://localhost:7202/api/Prescription';
const PATIENT_API = 'https://localhost:7202/api/Patient';

function Prescriptions() {
    const navigate = useNavigate();
    const user = getUser();
    const isDoctor = user?.role === 'Doctor';
    const isAdmin = user?.role === 'Admin';
    const isPatient = user?.role === 'Patient';

    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState('');
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '' }]);
    const [formData, setFormData] = useState({
        patientId: '', patientName: '', doctorName: user?.username || '',
        diagnosis: '', instructions: ''
    });

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        fetchAll();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchAll = async () => {
        try {
            const [pRes, patRes] = await Promise.all([
                isPatient
                    ? axios.get(`${API}/bypatientname/${user.username}`)
                    : axios.get(API),
                axios.get(PATIENT_API)
            ]);
            setPrescriptions(pRes.data);
            setPatients(patRes.data);
            setLoading(false);
        } catch { toast.error('Failed to load prescriptions'); setLoading(false); }
    };

    const addMedicineRow = () => setMedicines([...medicines, { name: '', dosage: '', duration: '' }]);
    const removeMedicineRow = (i) => setMedicines(medicines.filter((_, idx) => idx !== i));
    const updateMedicine = (i, field, val) => {
        const updated = [...medicines];
        updated[i][field] = val;
        setMedicines(updated);
    };

    const handlePatientSelect = (e) => {
        const pid = e.target.value;
        const pat = patients.find(p => p.id === parseInt(pid));
        setFormData(f => ({ ...f, patientId: pid, patientName: pat?.name || '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.patientId) { toast.warning('Please select a patient'); return; }
        if (medicines.some(m => !m.name)) { toast.warning('Please fill all medicine names'); return; }
        const payload = {
            ...formData,
            patientId: parseInt(formData.patientId),
            doctorName: user?.username,
            medicines: JSON.stringify(medicines),
        };
        try {
            if (editId) {
                await axios.put(`${API}/${editId}`, payload);
                toast.success('Prescription updated ✅');
            } else {
                await axios.post(API, payload);
                toast.success('Prescription added ✅');
            }
            fetchAll();
            resetForm();
        } catch { toast.error('Operation failed ❌'); }
    };

    const resetForm = () => {
        setEditId(null);
        setFormData({ patientId: '', patientName: '', doctorName: user?.username || '', diagnosis: '', instructions: '' });
        setMedicines([{ name: '', dosage: '', duration: '' }]);
    };

    const editPrescription = (p) => {
        setEditId(p.id);
        setFormData({ patientId: p.patientId, patientName: p.patientName, doctorName: p.doctorName, diagnosis: p.diagnosis || '', instructions: p.instructions || '' });
        try { setMedicines(JSON.parse(p.medicines) || [{ name: '', dosage: '', duration: '' }]); }
        catch { setMedicines([{ name: p.medicines || '', dosage: p.dosage || '', duration: '' }]); }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deletePrescription = async (id) => {
        if (!window.confirm('Delete this prescription?')) return;
        try { await axios.delete(`${API}/${id}`); toast.success('Deleted ✅'); fetchAll(); }
        catch { toast.error('Delete failed ❌'); }
    };

    const exportPDF = (p) => {
        const doc = new jsPDF();
        doc.setFontSize(20); doc.setTextColor(37, 99, 235);
        doc.text('MediCare HMS - Prescription', 14, 20);
        doc.setFontSize(11); doc.setTextColor(80);
        doc.text(`Patient: ${p.patientName}  |  Doctor: Dr. ${p.doctorName}`, 14, 32);
        doc.text(`Date: ${new Date(p.prescribedDate).toLocaleDateString()}  |  Diagnosis: ${p.diagnosis || '-'}`, 14, 40);
        doc.text(`Instructions: ${p.instructions || '-'}`, 14, 48);
        let meds = [];
        try { meds = JSON.parse(p.medicines); } catch { meds = [{ name: p.medicines, dosage: p.dosage, duration: '-' }]; }
        autoTable(doc, {
            startY: 56,
            head: [['Medicine', 'Dosage', 'Duration']],
            body: meds.map(m => [m.name, m.dosage, m.duration]),
            headStyles: { fillColor: [37, 99, 235], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 247, 255] },
        });
        doc.save(`prescription-${p.patientName}-${p.id}.pdf`);
        toast.success('PDF downloaded ✅');
    };

    const filtered = prescriptions.filter(p =>
        p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
        p.doctorName?.toLowerCase().includes(search.toLowerCase())
    );

    const parseMeds = (raw) => {
        try { return JSON.parse(raw); } catch { return [{ name: raw, dosage: '', duration: '' }]; }
    };

    if (loading) return (
        <div className="loader-wrapper">
            <div className="text-center">
                <div className="loader-spinner mx-auto mb-3" />
                <p className="text-white fw-semibold">Loading Prescriptions...</p>
            </div>
        </div>
    );

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1 min-vh-100 bg-doctors" style={{ padding: '90px 30px 40px' }}>
                <div className="container-fluid fade-in">

                    {/* HEADER */}
                    <div className="glass-card p-4 mb-4 text-white">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(124,58,237,0.4)' }}>
                                    <FaPills size={26} color="white" />
                                </div>
                                <div>
                                    <h2 className="fw-bold mb-0" style={{ fontSize: '2rem' }}>Prescriptions</h2>
                                    <p className="mb-0" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                                        {isPatient ? 'Your digital prescriptions' : 'Manage patient prescriptions & medicines'}
                                    </p>
                                </div>
                            </div>
                            <button className="btn btn-sm" onClick={() => navigate('/dashboard')}
                                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px' }}>
                                ← Dashboard
                            </button>
                        </div>
                    </div>

                    {/* FORM - Doctor & Admin only */}
                    {(isDoctor || isAdmin) && (
                        <div className="glass-card p-4 mb-4 text-white">
                            <div className="d-flex align-items-center gap-2 mb-4">
                                <FaPlus size={16} color="#a78bfa" />
                                <h5 className="fw-bold mb-0" style={{ color: '#a78bfa' }}>
                                    {editId ? 'Update Prescription' : 'Write New Prescription'}
                                </h5>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3 mb-3">
                                    {/* Patient Select */}
                                    <div className="col-md-6">
                                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                            <FaUserInjured size={11} className="me-1" />Select Patient
                                        </label>
                                        <select className="form-control custom-input" value={formData.patientId} onChange={handlePatientSelect} required>
                                            <option value="">-- Select Patient --</option>
                                            {patients.map(p => (
                                                <option key={p.id} value={p.id}>#{p.id} — {p.name} ({p.disease})</option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Diagnosis */}
                                    <div className="col-md-6">
                                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                            <FaNotesMedical size={11} className="me-1" />Diagnosis
                                        </label>
                                        <input type="text" className="form-control custom-input" placeholder="e.g. Viral Fever, Hypertension"
                                            value={formData.diagnosis} onChange={e => setFormData(f => ({ ...f, diagnosis: e.target.value }))} />
                                    </div>
                                    {/* Instructions */}
                                    <div className="col-12">
                                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                            Special Instructions
                                        </label>
                                        <input type="text" className="form-control custom-input" placeholder="e.g. Take after meals, Avoid cold water"
                                            value={formData.instructions} onChange={e => setFormData(f => ({ ...f, instructions: e.target.value }))} />
                                    </div>
                                </div>

                                {/* MEDICINES TABLE */}
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                                            <FaPills size={11} className="me-1" />Medicines
                                        </label>
                                        <button type="button" onClick={addMedicineRow}
                                            style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '8px', padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}>
                                            + Add Medicine
                                        </button>
                                    </div>
                                    {medicines.map((med, i) => (
                                        <div key={i} className="row g-2 mb-2 align-items-center">
                                            <div className="col-md-4">
                                                <input type="text" className="form-control custom-input" placeholder="Medicine name"
                                                    value={med.name} onChange={e => updateMedicine(i, 'name', e.target.value)} required />
                                            </div>
                                            <div className="col-md-4">
                                                <input type="text" className="form-control custom-input" placeholder="Dosage (e.g. 500mg twice daily)"
                                                    value={med.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value)} />
                                            </div>
                                            <div className="col-md-3">
                                                <input type="text" className="form-control custom-input" placeholder="Duration (e.g. 5 days)"
                                                    value={med.duration} onChange={e => updateMedicine(i, 'duration', e.target.value)} />
                                            </div>
                                            <div className="col-md-1">
                                                {medicines.length > 1 && (
                                                    <button type="button" onClick={() => removeMedicineRow(i)}
                                                        style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '8px 10px', cursor: 'pointer' }}>
                                                        <FaTrash size={11} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="d-flex gap-2 mt-3">
                                    <button className="btn px-4" style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', color: 'white', borderRadius: '12px' }}>
                                        {editId ? '✏️ Update Prescription' : '💊 Save Prescription'}
                                    </button>
                                    {editId && (
                                        <button type="button" className="btn px-4" onClick={resetForm}
                                            style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

                    {/* PRESCRIPTIONS LIST */}
                    <div className="glass-card p-4 text-white">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                            <h5 className="fw-bold mb-0" style={{ color: '#a78bfa' }}>
                                <FaFileMedical size={16} className="me-2" />
                                Prescription Records
                                <span className="badge ms-2" style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', fontSize: '12px' }}>{filtered.length}</span>
                            </h5>
                            <div className="input-group" style={{ width: '280px' }}>
                                <span className="input-group-text" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#a78bfa', borderRight: 'none' }}>
                                    <FaSearch size={13} />
                                </span>
                                <input type="text" placeholder="Search patient or doctor..." className="form-control custom-input"
                                    style={{ borderLeft: 'none' }} value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="text-center py-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                <FaPills size={40} className="mb-3" style={{ opacity: 0.2 }} />
                                <p>No prescriptions found</p>
                            </div>
                        ) : (
                            <div className="row g-3">
                                {filtered.map(p => {
                                    const meds = parseMeds(p.medicines);
                                    return (
                                        <div className="col-12" key={p.id}>
                                            <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '16px', padding: '20px' }}>
                                                <div className="row align-items-start g-3">
                                                    {/* LEFT INFO */}
                                                    <div className="col-md-4">
                                                        <div className="d-flex align-items-center gap-2 mb-2">
                                                            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg,#7c3aed,#2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <FaUserInjured size={16} color="white" />
                                                            </div>
                                                            <div>
                                                                <div className="fw-bold" style={{ fontSize: '14px' }}>{p.patientName}</div>
                                                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Patient ID #{p.patientId}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#a78bfa' }}>Dr. {p.doctorName}</div>
                                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                                                            📅 {new Date(p.prescribedDate).toLocaleDateString()}
                                                        </div>
                                                        {p.diagnosis && (
                                                            <div className="mt-2" style={{ fontSize: '12px', color: '#fbbf24' }}>
                                                                🔍 {p.diagnosis}
                                                            </div>
                                                        )}
                                                        {p.instructions && (
                                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                                                                📋 {p.instructions}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* MEDICINES */}
                                                    <div className="col-md-6">
                                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                                                            <FaPills size={10} className="me-1" />Prescribed Medicines
                                                        </div>
                                                        <div className="d-flex flex-wrap gap-2">
                                                            {meds.map((m, i) => (
                                                                <div key={i} style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: '10px', padding: '6px 12px' }}>
                                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#c4b5fd' }}>💊 {m.name}</div>
                                                                    {m.dosage && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{m.dosage}</div>}
                                                                    {m.duration && <div style={{ fontSize: '11px', color: '#34d399' }}>⏱ {m.duration}</div>}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* ACTIONS */}
                                                    <div className="col-md-2 d-flex flex-column gap-2 align-items-end">
                                                        <button onClick={() => exportPDF(p)}
                                                            style={{ background: 'rgba(220,38,38,0.15)', color: '#f87171', border: '1px solid rgba(220,38,38,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>
                                                            <FaFilePdf size={11} className="me-1" />PDF
                                                        </button>
                                                        {(isDoctor || isAdmin) && (
                                                            <>
                                                                <button onClick={() => editPrescription(p)}
                                                                    style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>
                                                                    <FaEdit size={11} className="me-1" />Edit
                                                                </button>
                                                                <button onClick={() => deletePrescription(p.id)}
                                                                    style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', width: '100%' }}>
                                                                    <FaTrash size={11} className="me-1" />Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Prescriptions;
