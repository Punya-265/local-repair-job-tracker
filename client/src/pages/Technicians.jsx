import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Users, Plus, Shield, Phone, Mail, Wrench, Loader2, X } from 'lucide-react';

const Technicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [newTech, setNewTech] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specialization: 'General Hardware Repair',
  });

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      if (res.data.success) {
        setTechnicians(res.data.users);
      }
    } catch (err) {
      toast.error('Failed to load technicians');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTechnician = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users', newTech);
      if (res.data.success) {
        toast.success('New Technician account created successfully!');
        setCreateModalOpen(false);
        setNewTech({ name: '', email: '', phone: '', password: '', specialization: 'General Hardware Repair' });
        fetchTechnicians();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create technician');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Technicians & Staff Directory</h1>
          <p className="text-xs text-slate-400 mt-1">Manage shop repair staff and active assigned workloads</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Technician</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <p className="text-xs text-slate-400">Loading technician staff directory...</p>
          </div>
        ) : (
          technicians.map((tech) => (
            <div
              key={tech._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {tech.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{tech.name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      {tech.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{tech.phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{tech.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-amber-500" />
                  <span>{tech.specialization || 'General Repair'}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Active Jobs</p>
                  <p className="font-bold text-blue-400">{tech.activeJobsCount || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Completed Jobs</p>
                  <p className="font-bold text-emerald-400">{tech.completedJobsCount || 0}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Technician Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-slate-100 text-base">Add New Staff / Technician</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTechnician} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  value={newTech.name}
                  onChange={(e) => setNewTech({ ...newTech, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. tech@repairshop.com"
                  value={newTech.email}
                  onChange={(e) => setNewTech({ ...newTech, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98765 00002"
                  value={newTech.phone}
                  onChange={(e) => setNewTech({ ...newTech, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newTech.password}
                  onChange={(e) => setNewTech({ ...newTech, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Specialization Focus</label>
                <input
                  type="text"
                  placeholder="e.g. Motherboard BGA, Smartphone Micro-soldering"
                  value={newTech.specialization}
                  onChange={(e) => setNewTech({ ...newTech, specialization: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Technicians;
