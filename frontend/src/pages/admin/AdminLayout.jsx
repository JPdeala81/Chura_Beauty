import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import ManageServices from './ManageServices';
import ManageAppointments from './ManageAppointments';
import Revenue from './Revenue';
import Settings from './Settings';
import Login from '../Login';
import Sidebar from '../../components/layout/Sidebar';

export default function AdminLayout() {
  const { token } = useContext(AuthContext);

  // Si pas connecté, rediriger vers la page de login admin
  if (!token) {
    return <Login />;
  }

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/services" element={<ManageServices />} />
          <Route path="/appointments" element={<ManageAppointments />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/admin/dashboard" />} />
        </Routes>
      </div>
    </div>
  );
}
