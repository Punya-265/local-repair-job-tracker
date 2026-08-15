import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Wrench, Shield, KeyRound, Loader2, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [loading, setLoading] = useState(false);
  const { login } = useAuth(); const navigate = useNavigate();
  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); const result = await login(email, password); setLoading(false); if (result?.success) navigate(result.user.role === 'customer' ? '/customer-dashboard' : result.user.role === 'technician' ? '/technician-dashboard' : '/'); };
  const quickFillAdmin = () => { setEmail('admin@repairshop.com'); setPassword('admin123'); };
  const quickFillTech = () => { setEmail('tech.alex@repairshop.com'); setPassword('tech123'); };
  return <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4"><div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
    <div className="text-center mb-8"><div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center mb-4"><Wrench className="w-7 h-7 text-white" /></div><h1 className="text-2xl font-extrabold text-white">FixTrack SaaS Portal</h1><p className="text-xs text-slate-400 mt-1">Sign in to manage your repairs</p></div>
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 mb-6"><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-400" />Demo logins</p><div className="grid grid-cols-2 gap-2"><button type="button" onClick={quickFillAdmin} className="text-left bg-slate-900 border border-slate-800 p-2 rounded-xl"><span className="block text-xs font-bold text-blue-400">Shop Admin</span><span className="text-[11px] text-slate-500">admin@repairshop.com</span></button><button type="button" onClick={quickFillTech} className="text-left bg-slate-900 border border-slate-800 p-2 rounded-xl"><span className="block text-xs font-bold text-purple-400">Technician</span><span className="text-[11px] text-slate-500">tech.alex@...</span></button></div></div>
    <form onSubmit={handleSubmit} className="space-y-5"><label className="block text-xs font-semibold text-slate-300">Email<div className="relative"><Shield className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-2 bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white" /></div></label><label className="block text-xs font-semibold text-slate-300">Password<div className="relative"><KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" /><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-2 bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white" /></div></label><button disabled={loading} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 rounded-xl disabled:opacity-50">{loading ? <Loader2 className="animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}</button></form>
    <div className="mt-6 pt-5 border-t border-slate-800 text-center"><p className="text-sm text-slate-400">New customer?</p><Link to="/signup" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-400 mt-1">Create a customer account <ArrowRight className="w-3 h-3" /></Link></div>
    <div className="mt-4 text-center"><Link to="/track/REP-2026-00101" className="text-xs text-slate-500 hover:text-blue-400">Track a repair without signing in</Link></div>
  </div></div>;
};
export default Login;
