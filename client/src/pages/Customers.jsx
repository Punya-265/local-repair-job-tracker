import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Loader2 } from 'lucide-react';
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

      // Fetch actual customer accounts so newly registered customers
      // appear even before they create their first repair.
      const [usersRes, repairsRes] = await Promise.all([
        api.get('/users?role=customer'),
        api.get('/repairs?limit=100'),
      ]);

      const users = usersRes.data?.users || [];
      const repairs = repairsRes.data?.repairs || [];

      const repairMap = new Map();
      repairs.forEach((repair) => {
        const email = repair.customer?.email?.toLowerCase();
        const phone = repair.customer?.phone;
        const key = email || phone;
        if (!key) return;

        const existing = repairMap.get(key);
        if (!existing || new Date(repair.createdAt) > new Date(existing.latestRepairDate)) {
          repairMap.set(key, {
            count: existing ? existing.count + 1 : 1,
            latestRepairId: repair.repairId,
            latestRepairDate: repair.createdAt,
          });
        } else {
          existing.count += 1;
        }
      });

      // Start with every registered customer, then attach their repair data.
      const customerList = users.map((user) => {
        const key = user.email?.toLowerCase() || user.phone;
        const repairInfo = repairMap.get(key);
        return {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          repairsCount: repairInfo?.count || 0,
          latestRepairId: repairInfo?.latestRepairId || null,
          latestRepairDate: repairInfo?.latestRepairDate || user.createdAt,
        };
      });

      setCustomers(customerList);
    } catch (err) {
      console.error('Failed to load customers:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter((c) => {
    const query = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(query) ||
      c.phone?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Customer Database</h1>
          <p className="text-xs text-slate-400 mt-1">
            All registered customers and their repair history
          </p>
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
                  filtered.map((c) => (
                    <tr key={c.id || c.email} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-200">{c.name}</td>
                      <td className="py-3.5 px-4 text-slate-400">{c.phone}</td>
                      <td className="py-3.5 px-4 text-slate-400">{c.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="bg-blue-500/10 text-blue-400 font-bold px-2.5 py-1 rounded-full border border-blue-500/20">
                          {c.repairsCount} Repair(s)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {c.latestRepairId ? (
                          <Link
                            to={`/track/${c.latestRepairId}`}
                            target="_blank"
                            className="font-mono font-bold text-teal-400 hover:underline"
                          >
                            {c.latestRepairId}
                          </Link>
                        ) : (
                          <span className="text-slate-600">No repairs yet</span>
                        )}
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
