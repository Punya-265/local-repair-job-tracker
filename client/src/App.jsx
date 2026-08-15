import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CustomerDashboard from './pages/CustomerDashboard';
import Dashboard from './pages/Dashboard';
import RepairsList from './pages/RepairsList';
import CreateRepair from './pages/CreateRepair';
import RepairDetails from './pages/RepairDetails';
import TechnicianDashboard from './pages/TechnicianDashboard';
import TrackRepair from './pages/TrackRepair';
import Technicians from './pages/Technicians';
import Customers from './pages/Customers';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AIRepairAdvisor from './pages/AIRepairAdvisor';

const ProtectedLayout = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Verifying session security...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={user.role === 'customer' ? '/customer-dashboard' : user.role === 'technician' ? '/technician-dashboard' : '/'} replace />;
  return <div className="min-h-screen bg-slate-950 text-slate-100 flex"><Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} /><div className="flex-1 md:pl-64 flex flex-col min-w-0"><Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} /><main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main></div></div>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const home = user?.role === 'customer' ? '/customer-dashboard' : user?.role === 'technician' ? '/technician-dashboard' : '/';
  return <Routes>
    <Route path="/track/:repairId" element={<TrackRepair />} />
    <Route path="/login" element={user ? <Navigate to={home} replace /> : <Login />} />
    <Route path="/signup" element={user ? <Navigate to={home} replace /> : <Signup />} />
    <Route path="/customer-dashboard" element={<ProtectedLayout allowedRoles={['customer']}><CustomerDashboard /></ProtectedLayout>} />
    <Route path="/" element={<ProtectedLayout allowedRoles={['admin']}><Dashboard /></ProtectedLayout>} />
    <Route path="/repairs" element={<ProtectedLayout allowedRoles={['admin', 'technician']}><RepairsList /></ProtectedLayout>} />
    <Route path="/repairs/new" element={<ProtectedLayout allowedRoles={['admin', 'technician']}><CreateRepair /></ProtectedLayout>} />
    <Route path="/repairs/:id" element={<ProtectedLayout allowedRoles={['admin', 'technician']}><RepairDetails /></ProtectedLayout>} />
    <Route path="/technician-dashboard" element={<ProtectedLayout allowedRoles={['technician', 'admin']}><TechnicianDashboard /></ProtectedLayout>} />
    <Route path="/ai-repair-advisor" element={<ProtectedLayout allowedRoles={['admin', 'technician']}><AIRepairAdvisor /></ProtectedLayout>} />
    <Route path="/technicians" element={<ProtectedLayout allowedRoles={['admin']}><Technicians /></ProtectedLayout>} />
    <Route path="/customers" element={<ProtectedLayout allowedRoles={['admin']}><Customers /></ProtectedLayout>} />
    <Route path="/payments" element={<ProtectedLayout allowedRoles={['admin']}><Payments /></ProtectedLayout>} />
    <Route path="/reports" element={<ProtectedLayout allowedRoles={['admin']}><Reports /></ProtectedLayout>} />
    <Route path="/settings" element={<ProtectedLayout allowedRoles={['admin', 'technician']}><Settings /></ProtectedLayout>} />
    <Route path="*" element={<Navigate to={home} replace />} />
  </Routes>;
};

const App = () => <AuthProvider><Toaster position="top-right" toastOptions={{ style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', fontSize: '13px', borderRadius: '12px' } }} /><AppRoutes /></AuthProvider>;
export default App;
