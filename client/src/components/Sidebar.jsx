import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Wrench,
  PlusCircle,
  Users,
  UserCheck,
  CreditCard,
  BarChart3,
  Settings,
  Cpu,
  X,
  BrainCircuit,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const adminNav = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Repair Jobs', path: '/repairs', icon: Wrench },
    { name: 'New Repair Job', path: '/repairs/new', icon: PlusCircle },
    { name: 'AI Repair Advisor', path: '/ai-repair-advisor', icon: BrainCircuit },
    { name: 'Technicians', path: '/technicians', icon: Users },
    { name: 'Customers', path: '/customers', icon: UserCheck },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const techNav = [
    { name: 'My Workspace', path: '/technician-dashboard', icon: Cpu },
    { name: 'All Repairs', path: '/repairs', icon: Wrench },
    { name: 'AI Repair Advisor', path: '/ai-repair-advisor', icon: BrainCircuit },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const navItems = isAdmin ? adminNav : techNav;

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-100 tracking-tight leading-none">FixTrack</h1>
              <p className="text-[11px] text-slate-400 font-medium">Repair Shop Portal</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{isAdmin ? 'Management' : 'Technician Hub'}</p></div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.path} to={item.path} end={item.path === '/'} onClick={() => onClose && onClose()} className={({ isActive }) => `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}>
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><p className="text-xs font-semibold text-slate-300">Live Shop System</p></div>
            <p className="text-[11px] text-slate-500 mt-1">v1.0.0 &bull; Local Repair Job Tracker</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
