import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench, UserPlus, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (result?.success) { toast.success('Account created successfully!'); navigate('/customer-dashboard'); }
  };

  return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
      <div className="text-center mb-7">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4"><Wrench className="w-7 h-7 text-white" /></div>
        <h1 className="text-2xl font-bold text-white">Create Customer Account</h1>
        <p className="text-sm text-slate-400 mt-1">Request repairs and track your devices online</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        {[
          ['name', 'Full name', 'Rahul Sharma'],
          ['email', 'Email address', 'rahul@example.com'],
          ['phone', 'Phone number', '+91 9876543210'],
          ['password', 'Password', 'At least 6 characters'],
        ].map(([key, label, placeholder]) => <label key={key} className="block text-sm text-slate-300">{label}
          <input required type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'} value={form[key]} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-4 py-3 text-white outline-none focus:border-blue-500" />
        </label>)}
        <button disabled={loading} className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-60">{loading ? <Loader2 className="animate-spin" /> : <UserPlus className="w-4 h-4" />} Create Account</button>
      </form>
      <p className="text-center text-sm text-slate-400 mt-6">Already have an account? <Link className="text-blue-400" to="/login">Sign in</Link></p>
    </div>
  </div>;
};
export default Signup;
