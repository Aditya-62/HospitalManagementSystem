import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Bills from './pages/Bills';
import Analytics from './pages/Analytics';
import PatientPortal from './pages/PatientPortal';
import Prescriptions from './pages/Prescriptions';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
                <Route path="/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />
                <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
                <Route path="/bills" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                <Route path="/patient-portal" element={<ProtectedRoute><PatientPortal /></ProtectedRoute>} />
                <Route path="/prescriptions" element={<ProtectedRoute><Prescriptions /></ProtectedRoute>} />
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </BrowserRouter>
    );
}

export default App;
