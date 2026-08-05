import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { UserCheck, Phone, Mail, Search, Wrench, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/repairs?limit=100');
      if (res.data.success) {
        // Group by customer email or phone
        const map = new Map();
        res.data.repairs.forEach((repair) => {
          const key = repair.customer.email || repair.customer.phone;
          if (!map.has(key)) {
            map.set(key, {
              name: repair.customer.name,
              email: repair.customer.email,
              phone: repair.customer.phone,
              repairsCount: 1,
              latestRepairId: repair.repairId,
              latestRepairDate: repair.createdAt,
            });
          } else {
            const item = map.get(key);
            item.repairsCount += 1;
          }
        });
        setCustomers(Array.from(map.values()));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Customer Database</h1>
          <p className="text-xs text-slate-400 mt-1">Directory of repair shop clients and repair history</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Filter customers by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <p className="text-xs text-slate-400">Loading customer database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Total Repairs</th>
                  <th className="py-3.5 px-4 text-right">Latest Ticket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.length > 0 ? (
                  filtered.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{c.name}</td>
                      <td className="py-3.5 px-4 text-slate-400">{c.phone}</td>
                      <td className="py-3.5 px-4 text-slate-400">{c.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-blue-500/10 text-blue-400 font-bold px-2.5 py-1 rounded-full border border-blue-500/20">
                          {c.repairsCount} Repair(s)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/track/${c.latestRepairId}`}
                          target="_blank"
                          className="font-mono font-bold text-teal-400 hover:underline"
                        >
                          {c.latestRepairId}
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500">
                      No customer records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;
