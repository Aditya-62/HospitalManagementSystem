import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { FaMoneyBillWave, FaUserInjured, FaEdit, FaTrash, FaSearch, FaPlus, FaRupeeSign, FaFilePdf } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import CountUp from 'react-countup';
import { getUser } from '../utils/auth';

function Bills() {
    const navigate = useNavigate();
    const user = getUser();
    const isPatient = user?.role === 'Patient';
    const isAdmin = user?.role === 'Admin';

    const [bills, setBills] = useState([]);
    const [search, setSearch] = useState('');
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ patientName:'', amount:'', paymentStatus:'' });

    const fetchBills = async () => {
        try {
            const r = await axios.get('https://localhost:7202/api/Bill');
            let data = r.data;
            if (isPatient) {
                data = data.filter(b => b.patientName?.toLowerCase() === user.username?.toLowerCase());
            }
            setBills(data); setLoading(false);
        } catch { toast.error("Failed To Load Bills ❌"); }
    };

    useEffect(() => { fetchBills(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const editBill = (bill) => {
        setEditId(bill.id);
        setFormData({ patientName:bill.patientName, amount:bill.amount, paymentStatus:bill.paymentStatus });
        window.scrollTo({ top:0, behavior:'smooth' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.amount <= 0) { toast.warning("Amount must be > 0"); return; }
        const req = editId
            ? axios.put(`https://localhost:7202/api/Bill/${editId}`, formData)
            : axios.post('https://localhost:7202/api/Bill', formData);
        req.then(() => {
            toast.success(editId ? 'Bill Updated ✅' : 'Bill Added ✅');
            fetchBills(); setEditId(null);
            setFormData({ patientName:'', amount:'', paymentStatus:'' });
        }).catch(() => toast.error("Operation Failed ❌"));
    };

    const deleteBill = (id) => {
        if (!window.confirm("Delete this bill?")) return;
        axios.delete(`https://localhost:7202/api/Bill/${id}`)
            .then(() => { toast.success("Deleted ✅"); fetchBills(); })
            .catch(() => toast.error("Delete Failed ❌"));
    };

    const filtered = bills.filter(b => b.patientName.toLowerCase().includes(search.toLowerCase()));
    const totalAmount = bills.reduce((sum, b) => sum + Number(b.amount), 0);
    const paidCount = bills.filter(b => b.paymentStatus === 'Paid').length;
    const unpaidCount = bills.filter(b => b.paymentStatus === 'Unpaid').length;

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(37, 99, 235);
        doc.text('Hospital Billing Report', 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
        doc.text(`Total Revenue: Rs ${totalAmount.toLocaleString()} | Paid: ${paidCount} | Unpaid: ${unpaidCount}`, 14, 35);
        autoTable(doc, {
            startY: 42,
            head: [['#', 'Patient Name', 'Amount (Rs)', 'Payment Status']],
            body: filtered.map(b => [b.id, b.patientName, Number(b.amount).toLocaleString(), b.paymentStatus]),
            headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 247, 255] },
            styles: { fontSize: 11 },
        });
        doc.save('bills-report.pdf');
        toast.success('PDF exported ✅');
    };

    if (loading) return (
        <div className="loader-wrapper">
            <div className="text-center">
                <div className="loader-spinner mx-auto mb-3" />
                <p className="text-white fw-semibold">Loading Bills...</p>
            </div>
        </div>
    );

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1 min-vh-100 bg-bills" style={{ padding:'90px 30px 40px' }}>
                <div className="container-fluid fade-in">

                    {/* HEADER */}
                    <div className="glass-card p-4 mb-4 text-white">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div className="d-flex align-items-center gap-3">
                                <div style={{ width:'56px', height:'56px', borderRadius:'16px', background:'linear-gradient(135deg,#dc2626,#f97316)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 20px rgba(220,38,38,0.4)' }}>
                                    <FaMoneyBillWave size={26} color="white" />
                                </div>
                                <div>
                                    <h2 className="fw-bold mb-0" style={{ fontSize:'2rem' }}>Billing Management</h2>
                                    <p className="mb-0" style={{ color:'rgba(255,255,255,0.6)', fontSize:'14px' }}>Manage bills & payment records</p>
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
                            { label:'Total Revenue', value:totalAmount, prefix:'₹', color:'#f87171', bg:'rgba(220,38,38,0.2)', icon:FaRupeeSign },
                            { label:'Paid Bills', value:paidCount, prefix:'', color:'#34d399', bg:'rgba(16,185,129,0.2)', icon:FaMoneyBillWave },
                            { label:'Unpaid Bills', value:unpaidCount, prefix:'', color:'#fbbf24', bg:'rgba(245,158,11,0.2)', icon:FaMoneyBillWave },
                        ].map(({ label, value, prefix, color, bg, icon: Icon }) => (
                            <div className="col-md-4" key={label}>
                                <div className="glass-card p-4 text-white stat-card-3d">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className="mb-1" style={{ color:'rgba(255,255,255,0.6)', fontSize:'13px' }}>{label}</p>
                                            <h2 className="fw-bold mb-0" style={{ color }}>
                                                {prefix}<CountUp end={value} duration={2} separator="," />
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

                    {/* FORM - Admin only */}
                    {isAdmin && (
                    <div className="glass-card p-4 mb-4 text-white">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <FaPlus size={16} color="#f87171" />
                            <h5 className="fw-bold mb-0" style={{ color:'#f87171' }}>
                                {editId ? 'Update Bill' : 'Add New Bill'}
                            </h5>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="input-group">
                                        <span className="input-group-text" style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)', color:'#60a5fa', borderRight:'none' }}>
                                            <FaUserInjured size={14} />
                                        </span>
                                        <input type="text" name="patientName" placeholder="Patient Name"
                                            className="form-control custom-input" style={{ borderLeft:'none' }}
                                            value={formData.patientName} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="input-group">
                                        <span className="input-group-text" style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)', color:'#f87171', borderRight:'none' }}>
                                            ₹
                                        </span>
                                        <input type="number" name="amount" placeholder="Bill Amount"
                                            className="form-control custom-input" style={{ borderLeft:'none' }}
                                            value={formData.amount} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <select name="paymentStatus" className="form-control custom-input"
                                        value={formData.paymentStatus} onChange={handleChange} required>
                                        <option value="">Select Payment Status</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Unpaid">Unpaid</option>
                                    </select>
                                </div>
                            </div>
                            <div className="d-flex gap-2 mt-4">
                                <button className="btn btn-gradient-red px-4">
                                    {editId ? '✏️ Update Bill' : '➕ Add Bill'}
                                </button>
                                {editId && (
                                    <button type="button" className="btn px-4"
                                        style={{ background:'rgba(255,255,255,0.1)', color:'white', border:'1px solid rgba(255,255,255,0.2)' }}
                                        onClick={() => { setEditId(null); setFormData({ patientName:'', amount:'', paymentStatus:'' }); }}>
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
                                <h5 className="fw-bold mb-0" style={{ color:'#f87171' }}>
                                    Bill List <span className="badge ms-2" style={{ background:'rgba(220,38,38,0.2)', color:'#f87171', fontSize:'12px' }}>{filtered.length}</span>
                                </h5>
                                <button className="btn btn-sm" onClick={exportPDF}
                                    style={{ background:'rgba(220,38,38,0.15)', color:'#f87171', border:'1px solid rgba(220,38,38,0.3)', borderRadius:'10px', padding:'6px 14px', fontSize:'13px' }}>
                                    <FaFilePdf size={13} className="me-1" />Export PDF
                                </button>
                            </div>
                            <div className="input-group" style={{ width:'280px' }}>
                                <span className="input-group-text" style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)', color:'#60a5fa', borderRight:'none' }}>
                                    <FaSearch size={13} />
                                </span>
                                <input type="text" placeholder="Search patient..." className="form-control custom-input"
                                    style={{ borderLeft:'none' }} value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="table pro-table align-middle text-center mb-0">
                                <thead style={{ background:'linear-gradient(135deg,rgba(220,38,38,0.3),rgba(249,115,22,0.3))' }}>
                                    <tr>
                                        {['ID','Patient','Amount','Status',...(isAdmin ? ['Actions'] : [])].map(h => (
                                            <th key={h} style={{ color:'rgba(255,255,255,0.8)', fontWeight:600 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr><td colSpan="5" className="py-5" style={{ color:'rgba(255,255,255,0.4)' }}>No bills found</td></tr>
                                    ) : filtered.map(bill => (
                                        <tr key={bill.id} style={{ color:'rgba(255,255,255,0.85)' }}>
                                            <td><span style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px' }}>#{bill.id}</span></td>
                                            <td className="fw-semibold">{bill.patientName}</td>
                                            <td><span style={{ color:'#34d399', fontWeight:700 }}>₹ {Number(bill.amount).toLocaleString()}</span></td>
                                            <td>
                                                <span className="badge" style={{
                                                    background: bill.paymentStatus === 'Paid' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                                                    color: bill.paymentStatus === 'Paid' ? '#34d399' : '#f87171',
                                                    border: `1px solid ${bill.paymentStatus === 'Paid' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`
                                                }}>{bill.paymentStatus}</span>
                                            </td>
                                            {isAdmin && (
                                            <td>
                                                <button className="btn btn-sm me-2" onClick={() => editBill(bill)}
                                                    style={{ background:'rgba(251,191,36,0.15)', color:'#fbbf24', border:'1px solid rgba(251,191,36,0.3)', borderRadius:'10px', padding:'5px 12px' }}>
                                                    <FaEdit size={12} className="me-1" />Edit
                                                </button>
                                                <button className="btn btn-sm" onClick={() => deleteBill(bill.id)}
                                                    style={{ background:'rgba(239,68,68,0.15)', color:'#f87171', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', padding:'5px 12px' }}>
                                                    <FaTrash size={12} className="me-1" />Delete
                                                </button>
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
        </div>
    );
}

export default Bills;
