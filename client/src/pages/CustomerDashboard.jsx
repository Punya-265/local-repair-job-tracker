import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LogOut, Plus, Wrench, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ device: { type: 'Laptop', brand: '', model: '', serialNumber: '', color: '' }, reportedProblem: '', notes: '' });
  const load = async () => { try { const { data } = await api.get('/customer/repairs'); setRepairs(data.repairs || []); } catch (e) { toast.error(e.response?.data?.message || 'Could not load repairs'); } };
  useEffect(() => { load(); }, []);
  const submit = async (e) => { e.preventDefault(); try { await api.post('/customer/repairs', form); toast.success('Repair request submitted'); setShowForm(false); setForm({ device: { type: 'Laptop', brand: '', model: '', serialNumber: '', color: '' }, reportedProblem: '', notes: '' }); load(); } catch (e) { toast.error(e.response?.data?.message || 'Could not submit request'); } };
  const setDevice = (key, value) => setForm((f) => ({ ...f, device: { ...f.device, [key]: value } }));

  return <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
    <div className="max-w-6xl mx-auto">
      <header className="flex flex-wrap justify-between items-center gap-3 mb-8">
        <div><div className="flex items-center gap-2"><Wrench className="text-blue-400" /><h1 className="text-2xl font-bold">My Repairs</h1></div><p className="text-slate-400 text-sm mt-1">Welcome, {user?.name}</p></div>
        <div className="flex gap-2"><button onClick={load} className="px-4 py-2 rounded-xl bg-slate-800"><RefreshCw className="w-4 h-4 inline mr-2" />Refresh</button><button onClick={logout} className="px-4 py-2 rounded-xl bg-slate-800"><LogOut className="w-4 h-4 inline mr-2" />Logout</button><button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl bg-blue-600"><Plus className="w-4 h-4 inline mr-2" />New Repair</button></div>
      </header>
      {showForm && <form onSubmit={submit} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 grid sm:grid-cols-2 gap-4">
        <select value={form.device.type} onChange={(e) => setDevice('type', e.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl p-3"><option>Laptop</option><option>Mobile</option><option>Tablet</option><option>Desktop</option><option>Appliance</option><option>Audio</option><option>Other</option></select>
        <input required placeholder="Brand" value={form.device.brand} onChange={(e) => setDevice('brand', e.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl p-3" />
        <input required placeholder="Model" value={form.device.model} onChange={(e) => setDevice('model', e.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl p-3" />
        <input placeholder="Serial number (optional)" value={form.device.serialNumber} onChange={(e) => setDevice('serialNumber', e.target.value)} className="bg-slate-950 border border-slate-700 rounded-xl p-3" />
        <textarea required placeholder="What is wrong with the device?" value={form.reportedProblem} onChange={(e) => setForm({ ...form, reportedProblem: e.target.value })} className="sm:col-span-2 bg-slate-950 border border-slate-700 rounded-xl p-3" rows="4" />
        <textarea placeholder="Additional notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="sm:col-span-2 bg-slate-950 border border-slate-700 rounded-xl p-3" rows="2" />
        <button className="sm:col-span-2 bg-blue-600 rounded-xl p-3 font-semibold">Submit Repair Request</button>
      </form>}
      {repairs.length === 0 ? <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-400">No repair requests yet. Click <b>New Repair</b> to submit your first one.</div> : <div className="grid md:grid-cols-2 gap-4">{repairs.map((r) => <div key={r._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5"><div className="flex justify-between gap-3"><div><h3 className="font-semibold">{r.device.brand} {r.device.model}</h3><p className="text-xs text-slate-500 mt-1">{r.repairId}</p></div><span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 h-fit">{r.status}</span></div><p className="text-sm text-slate-300 mt-4">{r.reportedProblem}</p><div className="mt-4 text-sm text-slate-400">Estimated cost: ₹{r.estimatedCost || 0}</div><a className="inline-block mt-3 text-sm text-blue-400" href={`/track/${r.repairId}`}>View tracking details →</a></div>)}</div>}
    </div>
  </div>;
};
export default CustomerDashboard;
