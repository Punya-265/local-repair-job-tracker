import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Wrench, Shield, KeyRound, Loader2, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result?.success) {
      if (result.user.role === 'technician') {
        navigate('/technician-dashboard');
      } else {
        navigate('/');
      }
    }
  };

  const quickFillAdmin = () => {
    setEmail('admin@repairshop.com');
    setPassword('admin123');
  };

  const quickFillTech = () => {
    setEmail('tech.alex@repairshop.com');
    setPassword('tech123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glow Objects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">FixTrack SaaS Portal</h1>
          <p className="text-xs text-slate-400 mt-1">Sign in to manage local repair jobs digitally</p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Demo Login Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={quickFillAdmin}
              className="text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2.5 rounded-xl transition group"
            >
              <span className="block text-xs font-bold text-blue-400 group-hover:text-blue-300">Shop Admin</span>
              <span className="block text-[11px] text-slate-500">admin@repairshop.com</span>
            </button>
            <button
              type="button"
              onClick={quickFillTech}
              className="text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 p-2.5 rounded-xl transition group"
            >
              <span className="block text-xs font-bold text-purple-400 group-hover:text-purple-300">Technician</span>
              <span className="block text-[11px] text-slate-500">tech.alex@...</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                placeholder="name@repairshop.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition duration-200 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Customer Tracking Shortcut */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">Are you a customer tracking your repair ticket?</p>
          <Link
            to="/track/REP-2026-00101"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 mt-1"
          >
            <span>Open Public Customer Tracking Portal</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
