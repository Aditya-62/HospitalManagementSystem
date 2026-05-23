import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import CountUp from 'react-countup';
import { FaUserMd, FaStethoscope, FaPhoneAlt, FaBriefcaseMedical, FaSearch, FaEdit, FaTrash, FaPlus, FaStar } from 'react-icons/fa';

function Doctors() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [search, setSearch] = useState('');
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ name:'', specialization:'', phone:'', experience:'' });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) navigate('/'); else fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchDoctors = () => {
        axios.get('https://localhost:7202/api/Doctor')
            .then(r => { setDoctors(r.data); setLoading(false); })
            .catch(() => toast.error("Failed To Load Doctors"));
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const editDoctor = (d) => {
        setEditId(d.id);
        setFormData({ name:d.name, specialization:d.specialization, phone:d.phone, experience:d.experience });
        window.scrollTo({ top:0, behavior:'smooth' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.phone.length !== 10) { toast.warning("Phone must be 10 digits"); return; }
        const req = editId
            ? axios.put(`https://localhost:7202/api/Doctor/${editId}`, formData)
            : axios.post('https://localhost:7202/api/Doctor', formData);
        req.then(() => {
            toast.success(editId ? 'Doctor Updated ✅' : 'Doctor Added ✅');
            fetchDoctors(); setEditId(null);
            setFormData({ name:'', specialization:'', phone:'', experience:'' });
        }).catch(() => toast.error("Operation Failed"));
    };

    const deleteDoctor = (id) => {
        if (!window.confirm("Delete this doctor?")) return;
        axios.delete(`https://localhost:7202/api/Doctor/${id}`)
            .then(() => { toast.success("Deleted ✅"); fetchDoctors(); })
            .catch(() => toast.error("Delete Failed"));
    };

    const filtered = doctors.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

    if (loading) return (
        <div className="loader-wrapper">
            <div className="text-center">
                <div className="loader-spinner mx-auto mb-3" style={{ borderTopColor:'#10b981' }} />
                <p className="text-white fw-semibold">Loading Doctors...</p>
            </div>
        </div>
    );

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1 min-vh-100 bg-doctors" style={{ padding:'90px 30px 40px' }}>
                <div className="container-fluid fade-in">

                    {/* HEADER */}
                    <div className="glass-card p-4 mb-4 text-white">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <div style={{ width:'56px', height:'56px', borderRadius:'16px', background:'linear-gradient(135deg,#059669,#10b981)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 20px rgba(5,150,105,0.4)' }}>
                                    <FaUserMd size={26} color="white" />
                                </div>
                                <div>
                                    <h2 className="fw-bold mb-0" style={{ fontSize:'2rem' }}>Doctor Management</h2>
                                    <p className="mb-0" style={{ color:'rgba(255,255,255,0.6)', fontSize:'14px' }}>Smart healthcare doctor monitoring</p>
                                </div>
                            </div>
                            <button className="btn btn-sm" onClick={() => navigate('/dashboard')}
                                style={{ background:'rgba(255,255,255,0.1)', color:'white', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.2)', padding:'8px 18px' }}>
                                ← Dashboard
                            </button>
                        </div>
                    </div>

                    {/* STATS */}
                    <div className="row g-3 mb-4">
                        {[
                            { label:'Total Doctors', value:doctors.length, color:'#34d399', bg:'rgba(5,150,105,0.2)', icon:FaUserMd },
                            { label:'Specializations', value:12, color:'#60a5fa', bg:'rgba(37,99,235,0.2)', icon:FaStethoscope },
                            { label:'Avg Rating', value:4.9, color:'#fbbf24', bg:'rgba(245,158,11,0.2)', icon:FaStar, decimals:1 },
                        ].map(({ label, value, color, bg, icon: Icon, decimals }) => (
                            <div className="col-md-4" key={label}>
                                <div className="glass-card p-4 text-white stat-card-3d">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className="mb-1" style={{ color:'rgba(255,255,255,0.6)', fontSize:'13px' }}>{label}</p>
                                            <h2 className="fw-bold mb-0" style={{ color }}>
                                                <CountUp end={value} duration={2} decimals={decimals || 0} />
                                            </h2>
                                        </div>
                                        <div style={{ width:'50px', height:'50px', borderRadius:'14px', background:bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                            <Icon size={22} color={color} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FORM */}
                    <div className="glass-card p-4 mb-4 text-white">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <FaPlus size={16} color="#34d399" />
                            <h5 className="fw-bold mb-0" style={{ color:'#34d399' }}>
                                {editId ? 'Update Doctor' : 'Add New Doctor'}
                            </h5>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <span className="input-group-text" style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)', color:'#34d399', borderRight:'none' }}>
                                            <FaUserMd size={14} />
                                        </span>
                                        <input type="text" name="name" placeholder="Doctor Name"
                                            className="form-control custom-input" style={{ borderLeft:'none' }}
                                            value={formData.name} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <span className="input-group-text" style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)', color:'#60a5fa', borderRight:'none' }}>
                                            <FaStethoscope size={14} />
                                        </span>
                                        <input type="text" name="specialization" placeholder="Specialization"
                                            className="form-control custom-input" style={{ borderLeft:'none' }}
                                            value={formData.specialization} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <span className="input-group-text" style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)', color:'#a78bfa', borderRight:'none' }}>
                                            <FaPhoneAlt size={14} />
                                        </span>
                                        <input type="text" name="phone" placeholder="Phone Number"
                                            className="form-control custom-input" style={{ borderLeft:'none' }}
                                            value={formData.phone}
                                            onChange={(e) => { if (/^\d{0,10}$/.test(e.target.value)) setFormData({ ...formData, phone: e.target.value }); }}
                                            maxLength="10" required />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="input-group">
                                        <span className="input-group-text" style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)', color:'#fbbf24', borderRight:'none' }}>
                                            <FaBriefcaseMedical size={14} />
                                        </span>
                                        <input type="number" name="experience" placeholder="Years of Experience"
                                            className="form-control custom-input" style={{ borderLeft:'none' }}
                                            value={formData.experience} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex gap-2 mt-4">
                                <button className="btn btn-gradient-green px-4">
                                    {editId ? '✏️ Update Doctor' : '➕ Add Doctor'}
                                </button>
                                {editId && (
                                    <button type="button" className="btn px-4"
                                        style={{ background:'rgba(255,255,255,0.1)', color:'white', border:'1px solid rgba(255,255,255,0.2)' }}
                                        onClick={() => { setEditId(null); setFormData({ name:'', specialization:'', phone:'', experience:'' }); }}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* TABLE */}
                    <div className="glass-card p-4 text-white">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                            <h5 className="fw-bold mb-0" style={{ color:'#34d399' }}>
                                Doctor List <span className="badge ms-2" style={{ background:'rgba(5,150,105,0.2)', color:'#34d399', fontSize:'12px' }}>{filtered.length}</span>
                            </h5>
                            <div className="input-group" style={{ width:'280px' }}>
                                <span className="input-group-text" style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)', color:'#34d399', borderRight:'none' }}>
                                    <FaSearch size={13} />
                                </span>
                                <input type="text" placeholder="Search doctor..." className="form-control custom-input"
                                    style={{ borderLeft:'none' }} value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table pro-table align-middle text-center mb-0">
                                <thead style={{ background:'linear-gradient(135deg,rgba(5,150,105,0.3),rgba(16,185,129,0.3))' }}>
                                    <tr>
                                        {['ID','Name','Specialization','Phone','Experience','Actions'].map(h => (
                                            <th key={h} style={{ color:'rgba(255,255,255,0.8)', fontWeight:600 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr><td colSpan="6" className="py-5" style={{ color:'rgba(255,255,255,0.4)' }}>No doctors found</td></tr>
                                    ) : filtered.map(d => (
                                        <tr key={d.id} style={{ color:'rgba(255,255,255,0.85)' }}>
                                            <td><span style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px' }}>#{d.id}</span></td>
                                            <td className="fw-semibold">{d.name}</td>
                                            <td><span className="badge" style={{ background:'rgba(96,165,250,0.15)', color:'#60a5fa', border:'1px solid rgba(96,165,250,0.3)' }}>{d.specialization}</span></td>
                                            <td>{d.phone}</td>
                                            <td><span style={{ color:'#fbbf24' }}>{d.experience} yrs</span></td>
                                            <td>
                                                <button className="btn btn-sm me-2" onClick={() => editDoctor(d)}
                                                    style={{ background:'rgba(251,191,36,0.15)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.3)', borderRadius:'10px', padding:'5px 12px' }}>
                                                    <FaEdit size={12} className="me-1" />Edit
                                                </button>
                                                <button className="btn btn-sm" onClick={() => deleteDoctor(d.id)}
                                                    style={{ background:'rgba(239,68,68,0.15)', color:'#f87171', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', padding:'5px 12px' }}>
                                                    <FaTrash size={12} className="me-1" />Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Doctors;
