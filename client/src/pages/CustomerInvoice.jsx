import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const CustomerInvoice = () => {
  const { repairId } = useParams();
  const [repair, setRepair] = useState(null);
  useEffect(() => {
    api.get(`/repairs/track/${repairId}`).then(({ data }) => setRepair(data.repair)).catch((e) => toast.error(e.response?.data?.message || 'Could not load invoice'));
  }, [repairId]);

  if (!repair) return <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center">Loading invoice...</div>;
  const total = repair.finalCost || repair.estimatedCost || 0;
  const paid = repair.amountPaid || 0;
  const balance = Math.max(0, total - paid);

  return <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-5 print:hidden"><Link to={`/customer-repairs/${repair.repairId}`} className="text-sm text-blue-400 flex items-center gap-2"><ArrowLeft className="w-4 h-4" />Back</Link><button onClick={() => window.print()} className="bg-blue-600 px-4 py-2 rounded-xl text-sm"><Printer className="w-4 h-4 inline mr-2" />Print / Save PDF</button></div>
      <div className="bg-white text-slate-900 rounded-2xl p-8 print:rounded-none print:shadow-none">
        <div className="flex justify-between border-b pb-6 mb-6"><div><h1 className="text-2xl font-bold">FIXTRACK</h1><p className="text-sm text-slate-500">Repair Service Invoice</p></div><div className="text-right"><p className="font-semibold">{repair.repairId}</p><p className="text-sm text-slate-500">{new Date().toLocaleDateString()}</p></div></div>
        <div className="grid sm:grid-cols-2 gap-6 mb-8"><div><p className="text-xs uppercase text-slate-500">Customer</p><p className="font-semibold mt-1">{repair.customerName}</p></div><div><p className="text-xs uppercase text-slate-500">Device</p><p className="font-semibold mt-1">{repair.device.brand} {repair.device.model}</p><p className="text-sm text-slate-500">{repair.device.type}</p></div></div>
        <table className="w-full text-sm mb-8"><thead><tr className="border-b text-left"><th className="py-3">Service</th><th className="py-3 text-right">Amount</th></tr></thead><tbody><tr className="border-b"><td className="py-4">Repair service — {repair.reportedProblem}</td><td className="py-4 text-right">₹{total}</td></tr></tbody></table>
        <div className="ml-auto max-w-xs space-y-2 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>₹{total}</span></div><div className="flex justify-between"><span>Paid</span><span>₹{paid}</span></div><div className="flex justify-between border-t pt-3 text-lg font-bold"><span>Balance due</span><span>₹{balance}</span></div></div>
        <div className="mt-10 pt-5 border-t text-xs text-slate-500 flex justify-between"><span>Payment status: {repair.paymentStatus}</span><span>Thank you for choosing FixTrack.</span></div>
      </div>
    </div>
  </div>;
};
export default CustomerInvoice;
