import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from '../components/Sidebar';
import CountUp from 'react-countup';
import { FaUserInjured, FaUserMd, FaCalendarCheck, FaMoneyBillWave, FaChartPie, FaHospital, FaHeartbeat, FaBell } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function Analytics() {
    const [patientCount, setPatientCount] = useState(0);
    const [doctorCount, setDoctorCount] = useState(0);
    const [appointmentCount, setAppointmentCount] = useState(0);
    const [billCount, setBillCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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
                setAppointmentCount(aR.data.length);
                setBillCount(bR.data.length);
                setLoading(false);
            } catch {
                toast.error("Failed To Load Analytics");
            }
        };
        fetchData();
    }, []);

    const chartColors = ['#2563eb','#059669','#d97706','#dc2626'];
    const labels = ['Patients','Doctors','Appointments','Bills'];
    const data = [patientCount, doctorCount, appointmentCount, billCount];

    const barData = {
        labels,
        datasets: [{
            label: 'Hospital Records',
            data,
            backgroundColor: chartColors.map(c => c + 'cc'),
            borderColor: chartColors,
            borderWidth: 2,
            borderRadius: 12,
            borderSkipped: false,
        }]
    };

    const pieData = {
        labels,
        datasets: [{ data, backgroundColor: chartColors.map(c => c + 'dd'), borderColor: '#1e293b', borderWidth: 3 }]
    };

    const chartOptions = {
        responsive: true,
        plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Poppins' } } } },
        scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
    };

    const pieOptions = {
        responsive: true,
        plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Poppins' } } } }
    };

    if (loading) return (
        <div className="loader-wrapper">
            <div className="text-center">
                <div className="loader-spinner mx-auto mb-3" style={{ borderTopColor:'#a78bfa' }} />
                <p className="text-white fw-semibold">Loading Analytics...</p>
            </div>
        </div>
    );

    const summaryCards = [
        { label:'Total Patients', value:patientCount, icon:FaUserInjured, color:'#60a5fa', bg:'linear-gradient(135deg,#1d4ed8,#2563eb)', shadow:'rgba(37,99,235,0.4)' },
        { label:'Total Doctors', value:doctorCount, icon:FaUserMd, color:'#34d399', bg:'linear-gradient(135deg,#065f46,#059669)', shadow:'rgba(5,150,105,0.4)' },
        { label:'Appointments', value:appointmentCount, icon:FaCalendarCheck, color:'#fbbf24', bg:'linear-gradient(135deg,#92400e,#d97706)', shadow:'rgba(217,119,6,0.4)' },
        { label:'Total Bills', value:billCount, icon:FaMoneyBillWave, color:'#f87171', bg:'linear-gradient(135deg,#991b1b,#dc2626)', shadow:'rgba(220,38,38,0.4)' },
    ];

    return (
        <div className="d-flex">
            <Sidebar />
            <div className="flex-grow-1 min-vh-100 bg-analytics" style={{ padding:'90px 30px 40px' }}>
                <div className="container-fluid fade-in">

                    {/* HERO */}
                    <div className="glass-card p-5 mb-4 text-white">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
                            <div>
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div style={{ width:'56px', height:'56px', borderRadius:'16px', background:'linear-gradient(135deg,#7c3aed,#2563eb)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 20px rgba(124,58,237,0.4)' }}>
                                        <FaHospital size={26} color="white" />
                                    </div>
                                    <div>
                                        <h2 className="fw-bold mb-0" style={{ fontSize:'2rem' }}>Analytics Dashboard</h2>
                                        <p className="mb-0" style={{ color:'rgba(255,255,255,0.6)', fontSize:'14px' }}>Smart Hospital Data Visualization</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <FaHeartbeat color="#f87171" className="heartbeat" />
                                    <span style={{ color:'rgba(255,255,255,0.7)', fontSize:'14px' }}>Real-Time Monitoring Active</span>
                                    <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#10b981', boxShadow:'0 0 8px #10b981', marginLeft:'4px' }} />
                                </div>
                            </div>
                            <div className="glass-card p-4 text-center" style={{ minWidth:'200px' }}>
                                <FaBell size={22} color="#fbbf24" className="mb-2" />
                                <h3 className="fw-bold mb-0" style={{ fontFamily:'monospace', color:'#60a5fa' }}>{time.toLocaleTimeString()}</h3>
                                <small style={{ color:'rgba(255,255,255,0.5)' }}>{time.toDateString()}</small>
                            </div>
                        </div>
                    </div>

                    {/* SUMMARY CARDS */}
                    <div className="row g-4 mb-4">
                        {summaryCards.map(({ label, value, icon: Icon, bg, shadow }) => (
                            <div className="col-md-6 col-lg-3" key={label}>
                                <div className="stat-card-3d card border-0 p-4 text-white" style={{ background:bg, boxShadow:`0 10px 30px ${shadow}` }}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <p className="mb-1" style={{ opacity:0.8, fontSize:'13px' }}>{label}</p>
                                            <h1 className="fw-bold mb-0"><CountUp end={value} duration={2} /></h1>
                                        </div>
                                        <div style={{ width:'55px', height:'55px', borderRadius:'16px', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                            <Icon size={26} color="white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CHARTS */}
                    <div className="row g-4 mb-4">
                        <div className="col-lg-8">
                            <div className="glass-card p-4 h-100">
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <FaChartPie size={20} color="#60a5fa" />
                                    <h5 className="fw-bold mb-0 text-white">Hospital Overview</h5>
                                </div>
                                <Bar data={barData} options={chartOptions} />
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="glass-card p-4 h-100">
                                <div className="d-flex align-items-center gap-2 mb-4">
                                    <FaChartPie size={20} color="#34d399" />
                                    <h5 className="fw-bold mb-0 text-white">Distribution</h5>
                                </div>
                                <Pie data={pieData} options={pieOptions} />
                            </div>
                        </div>
                    </div>

                    {/* INSIGHTS */}
                    <div className="glass-card p-4 text-white">
                        <h5 className="fw-bold mb-4" style={{ color:'#a78bfa' }}>💡 Key Insights</h5>
                        <div className="row g-3">
                            {[
                                { label:'Doctor-Patient Ratio', value:`1 : ${doctorCount > 0 ? Math.round(patientCount/doctorCount) : 0}`, color:'#60a5fa' },
                                { label:'Appointment Rate', value:`${patientCount > 0 ? Math.round((appointmentCount/patientCount)*100) : 0}%`, color:'#fbbf24' },
                                { label:'Billing Coverage', value:`${patientCount > 0 ? Math.round((billCount/patientCount)*100) : 0}%`, color:'#f87171' },
                                { label:'System Status', value:'Operational', color:'#34d399' },
                            ].map(({ label, value, color }) => (
                                <div className="col-md-3" key={label}>
                                    <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:'16px', padding:'20px', border:`1px solid ${color}22`, textAlign:'center' }}>
                                        <h3 className="fw-bold mb-1" style={{ color }}>{value}</h3>
                                        <small style={{ color:'rgba(255,255,255,0.5)', fontSize:'12px' }}>{label}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Analytics;
