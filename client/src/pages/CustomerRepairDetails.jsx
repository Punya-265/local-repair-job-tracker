import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Printer, RefreshCw, Wrench } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CustomerRepairDetails = () => {
  const { repairId } = useParams();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/repairs/track/${repairId}`);
      setRepair(data.repair);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not load repair');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [repairId]);

  if (loading) return <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center">Loading repair...</div>;
  if (!repair) return <div className="min-h-screen bg-slate-950 text-slate-100 p-8 text-center">Repair not found.</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <Link to="/customer-dashboard" className="text-sm text-blue-400 flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back to My Repairs</Link>
          <div className="flex gap-2">
            <button onClick={load} className="px-3 py-2 rounded-xl bg-slate-800 text-sm"><RefreshCw className="w-4 h-4 inline mr-2" />Refresh</button>
            <button onClick={() => window.print()} className="px-3 py-2 rounded-xl bg-blue-600 text-sm"><Printer className="w-4 h-4 inline mr-2" />Print / Save PDF</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between gap-4 mb-6">
              <div><div className="flex items-center gap-2"><Wrench className="text-blue-400" /><h1 className="text-2xl font-bold">{repair.device.brand} {repair.device.model}</h1></div><p className="text-xs text-slate-500 mt-2">Ticket {repair.repairId}</p></div>
              <span className="h-fit px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-semibold">{repair.status}</span>
            </div>

            <div className="mb-7 p-4 rounded-xl bg-slate-950 border border-slate-800">
              <p className="text-xs uppercase tracking-wider text-slate-500">Reported problem</p>
              <p className="mt-2 text-slate-200">{repair.reportedProblem}</p>
              {repair.diagnosis && <><p className="text-xs uppercase tracking-wider text-slate-500 mt-5">Diagnosis</p><p className="mt-2 text-slate-200">{repair.diagnosis}</p></>}
            </div>

            <h2 className="font-semibold mb-4">Repair progress</h2>
            <div className="space-y-4">
              {(repair.history || []).map((item, index) => (
                <div key={`${item.timestamp}-${index}`} className="flex gap-3">
                  {index === repair.history.length - 1 ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" /> : <Circle className="w-5 h-5 text-blue-400 mt-0.5" />}
                  <div className="flex-1 border-b border-slate-800 pb-4"><div className="flex flex-wrap justify-between gap-2"><p className="font-medium">{item.newStatus}</p><p className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</p></div><p className="text-sm text-slate-400 mt-1">{item.note}</p></div>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="font-semibold mb-4">Repair summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Device</span><span>{repair.device.type}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Priority</span><span>{repair.priority}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Estimate</span><span>₹{repair.estimatedCost || 0}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Final cost</span><span>₹{repair.finalCost || repair.estimatedCost || 0}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Paid</span><span>₹{repair.amountPaid || 0}</span></div>
                <div className="border-t border-slate-800 pt-3 flex justify-between font-semibold"><span>Balance</span><span>₹{Math.max(0, (repair.finalCost || repair.estimatedCost || 0) - (repair.amountPaid || 0))}</span></div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h2 className="font-semibold mb-2">Need help?</h2>
              <p className="text-sm text-slate-400">Keep your ticket number {repair.repairId} when contacting the repair shop.</p>
              {repair.estimatedCompletionDate && <p className="text-sm text-slate-300 mt-3">Expected completion: {new Date(repair.estimatedCompletionDate).toLocaleDateString()}</p>}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CustomerRepairDetails;
