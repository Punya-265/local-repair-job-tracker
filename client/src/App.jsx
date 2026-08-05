import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
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

// Protected Route Wrapper
const ProtectedLayout = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <p className="text-sm">Verifying session security...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'technician' ? '/technician-dashboard' : '/'} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Customer Tracking Page - No Auth Required! */}
      <Route path="/track/:repairId" element={<TrackRepair />} />

      {/* Public Auth Page */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={user.role === 'technician' ? '/technician-dashboard' : '/'} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedLayout allowedRoles={['admin']}>
            <Dashboard />
          </ProtectedLayout>
        }
      />

      {/* Repairs List */}
      <Route
        path="/repairs"
        element={
          <ProtectedLayout allowedRoles={['admin', 'technician']}>
            <RepairsList />
          </ProtectedLayout>
        }
      />

      {/* Create Repair */}
      <Route
        path="/repairs/new"
        element={
          <ProtectedLayout allowedRoles={['admin', 'technician']}>
            <CreateRepair />
          </ProtectedLayout>
        }
      />

      {/* Repair Details */}
      <Route
        path="/repairs/:id"
        element={
          <ProtectedLayout allowedRoles={['admin', 'technician']}>
            <RepairDetails />
          </ProtectedLayout>
        }
      />

      {/* Technician Workspace */}
      <Route
        path="/technician-dashboard"
        element={
          <ProtectedLayout allowedRoles={['technician', 'admin']}>
            <TechnicianDashboard />
          </ProtectedLayout>
        }
      />

      {/* Technicians List */}
      <Route
        path="/technicians"
        element={
          <ProtectedLayout allowedRoles={['admin']}>
            <Technicians />
          </ProtectedLayout>
        }
      />

      {/* Customers List */}
      <Route
        path="/customers"
        element={
          <ProtectedLayout allowedRoles={['admin']}>
            <Customers />
          </ProtectedLayout>
        }
      />

      {/* Payments */}
      <Route
        path="/payments"
        element={
          <ProtectedLayout allowedRoles={['admin']}>
            <Payments />
          </ProtectedLayout>
        }
      />

      {/* Reports */}
      <Route
        path="/reports"
        element={
          <ProtectedLayout allowedRoles={['admin']}>
            <Reports />
          </ProtectedLayout>
        }
      />

      {/* Settings */}
      <Route
        path="/settings"
        element={
          <ProtectedLayout allowedRoles={['admin', 'technician']}>
            <Settings />
          </ProtectedLayout>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
            fontSize: '13px',
            borderRadius: '12px',
          },
        }}
      />
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
