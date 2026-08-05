import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PaymentStatusBadge } from '../components/Badge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CreditCard, DollarSign, ArrowUpRight, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Payments = () => {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/repairs?limit=100');
      if (res.data.success) {
        setRepairs(res.data.repairs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalCollected = repairs.reduce((acc, r) => acc + (r.amountPaid || 0), 0);
  const totalPending = repairs.reduce((acc, r) => {
    const cost = r.finalCost > 0 ? r.finalCost : r.estimatedCost;
    return acc + Math.max(0, cost - (r.amountPaid || 0));
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Payments & Revenue Log</h1>
          <p className="text-xs text-slate-400 mt-1">Track settled payments, outstanding balances & receipts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Revenue Collected</p>
          <h2 className="text-2xl font-extrabold text-emerald-400 mt-2">{formatCurrency(totalCollected)}</h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding Balance Due</p>
          <h2 className="text-2xl font-extrabold text-rose-400 mt-2">{formatCurrency(totalPending)}</h2>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <p className="text-xs text-slate-400">Loading payment receipts...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Ticket ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Device</th>
                  <th className="py-3.5 px-4">Final Cost</th>
                  <th className="py-3.5 px-4">Amount Paid</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {repairs.map((r) => {
                  const cost = r.finalCost > 0 ? r.finalCost : r.estimatedCost;
                  return (
                    <tr key={r._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-400">{r.repairId}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">{r.customer?.name}</td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {r.device?.brand} {r.device?.model}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{formatCurrency(cost)}</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-400">{formatCurrency(r.amountPaid)}</td>
                      <td className="py-3.5 px-4 text-slate-400">{r.paymentMethod || 'Cash'}</td>
                      <td className="py-3.5 px-4">
                        <PaymentStatusBadge status={r.paymentStatus} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/repairs/${r._id}`}
                          className="text-xs text-blue-400 hover:underline font-semibold"
                        >
                          Invoice & Receipts
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
