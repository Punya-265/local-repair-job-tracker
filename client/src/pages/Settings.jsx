import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Settings as SettingsIcon, User, Lock, Store, Save, ShieldCheck } from 'lucide-react';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [specialization, setSpecialization] = useState(user?.specialization || '');
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/auth/profile', {
        name,
        phone,
        specialization,
      });

      if (res.data.success) {
        toast.success('Profile updated successfully!');
        updateUser(res.data.user);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Account & Shop Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Manage user account profile and shop notification parameters</p>
      </div>

      {/* User Profile Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-3 border-b border-slate-800">
          <User className="w-4 h-4 text-blue-400" />
          Personal Account Details
        </h3>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address (Read-Only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-950/50 border border-slate-800/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Role Authority
              </label>
              <input
                type="text"
                disabled
                value={user?.role?.toUpperCase() || ''}
                className="w-full bg-slate-950/50 border border-slate-800/60 rounded-xl px-3.5 py-2.5 text-xs text-blue-400 font-bold cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Specialization / Domain Focus
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* Shop Information Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-3 border-b border-slate-800">
          <Store className="w-4 h-4 text-purple-400" />
          Shop Contact & System Status
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-800/80">
            <span className="text-slate-400">Shop Name:</span>
            <span className="font-semibold text-slate-200">FixTrack Repair Services</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/80">
            <span className="text-slate-400">Database Connection:</span>
            <span className="font-semibold text-emerald-400">Active (MongoDB / Mongoose)</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-800/80">
            <span className="text-slate-400">Email Dispatcher:</span>
            <span className="font-semibold text-blue-400">Nodemailer Service (Active)</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-400">Image Storage:</span>
            <span className="font-semibold text-purple-400">Cloudinary & Local Fallback</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
