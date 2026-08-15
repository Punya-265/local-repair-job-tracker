import React, { useState } from 'react';
import { BrainCircuit, Loader2, Sparkles, Wrench, ShieldAlert } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AIRepairAdvisor = () => {
  const [form, setForm] = useState({ deviceType: 'Laptop', brand: '', model: '', symptoms: '' });
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const getAdvice = async (event) => {
    event.preventDefault();
    if (!form.symptoms.trim()) {
      toast.error('Describe the device symptoms first.');
      return;
    }

    setLoading(true);
    setAdvice('');
    try {
      const { data } = await api.post('/ai/repair-advice', form);
      setAdvice(data.advice);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not generate AI advice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <BrainCircuit className="w-6 h-6 text-violet-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Repair Advisor</h2>
            <p className="text-sm text-slate-400">Get a second opinion on likely causes and repair checks.</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={getAdvice} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <Wrench className="w-4 h-4 text-violet-300" />
            Describe the repair
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <label className="text-xs text-slate-400">
              Device
              <select value={form.deviceType} onChange={(e) => update('deviceType', e.target.value)} className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white outline-none">
                <option>Laptop</option>
                <option>Mobile</option>
                <option>Tablet</option>
                <option>Desktop</option>
                <option>Other</option>
              </select>
            </label>
            <label className="text-xs text-slate-400">
              Brand
              <input value={form.brand} onChange={(e) => update('brand', e.target.value)} placeholder="Dell" className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none" />
            </label>
            <label className="text-xs text-slate-400">
              Model
              <input value={form.model} onChange={(e) => update('model', e.target.value)} placeholder="XPS 15" className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none" />
            </label>
          </div>

          <label className="text-xs text-slate-400 block">
            Symptoms / customer complaint
            <textarea value={form.symptoms} onChange={(e) => update('symptoms', e.target.value)} rows={7} placeholder="Example: Laptop powers on but shuts down after 5 minutes. Fan is very loud and the keyboard area gets hot..." className="mt-1 w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-3 text-sm text-white placeholder:text-slate-600 outline-none resize-none" />
          </label>

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 px-4 py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Analyzing repair...' : 'Analyze with AI'}
          </button>
        </form>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 min-h-[420px]">
          <div className="flex items-center gap-2 text-slate-200 font-semibold mb-4">
            <Sparkles className="w-4 h-4 text-violet-300" />
            AI recommendation
          </div>

          {!advice && !loading && (
            <div className="h-[350px] flex flex-col items-center justify-center text-center text-slate-500 px-8">
              <BrainCircuit className="w-12 h-12 mb-3 text-slate-700" />
              <p className="text-sm">Enter a repair problem and the AI will suggest likely causes, checks and a possible repair.</p>
            </div>
          )}

          {loading && (
            <div className="h-[350px] flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-violet-400 mb-3" />
              <p className="text-sm">Analyzing the symptoms...</p>
            </div>
          )}

          {advice && (
            <div className="space-y-4">
              <div className="whitespace-pre-wrap text-sm leading-6 text-slate-300 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                {advice}
              </div>
              <div className="flex gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                AI advice is a diagnostic aid, not a substitute for technician testing or safety procedures.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIRepairAdvisor;
