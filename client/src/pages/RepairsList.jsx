import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { StatusBadge, PriorityBadge, PaymentStatusBadge } from '../components/Badge';
import StatusUpdaterModal from '../components/StatusUpdaterModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Wrench,
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Edit,
  Loader2,
  RefreshCw,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  'All Statuses',
  'Received',
  'Diagnosing',
  'Waiting for Approval',
  'Approved',
  'Repairing',
  'Ready for Pickup',
  'Completed',
  'Rejected',
  'Cancelled',
];

const DEVICE_OPTIONS = ['All Devices', 'Laptop', 'Mobile', 'Tablet', 'Desktop', 'Appliance', 'Audio', 'Other'];
const PRIORITY_OPTIONS = ['All Priorities', 'Low', 'Medium', 'High', 'Urgent'];

const RepairsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [repairs, setRepairs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [technicianFilter, setTechnicianFilter] = useState('');

  // Quick Status Updater Modal State
  const [selectedRepairForStatus, setSelectedRepairForStatus] = useState(null);

  useEffect(() => {
    fetchTechnicians();
  }, []);

  useEffect(() => {
    fetchRepairs();
  }, [page, search, statusFilter, deviceFilter, priorityFilter, technicianFilter]);

  const fetchTechnicians = async () => {
    try {
      const res = await api.get('/users?role=technician');
      if (res.data.success) {
        setTechnicians(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load technicians:', err);
    }
  };

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 10);
      if (search) params.append('search', search);
      if (statusFilter && statusFilter !== 'All Statuses') params.append('status', statusFilter);
      if (deviceFilter && deviceFilter !== 'All Devices') params.append('deviceType', deviceFilter);
      if (priorityFilter && priorityFilter !== 'All Priorities') params.append('priority', priorityFilter);
      if (technicianFilter) params.append('technician', technicianFilter);

      const res = await api.get(`/repairs?${params.toString()}`);
      if (res.data.success) {
        setRepairs(res.data.repairs);
        setTotal(res.data.total);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      toast.error('Failed to load repairs list');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRepairs();
  };

  const handleExportCSV = () => {
    if (repairs.length === 0) return toast.error('No repairs to export');
    const headers = ['Repair ID', 'Customer Name', 'Phone', 'Device', 'Status', 'Priority', 'Cost (INR)', 'Paid (INR)'];
    const rows = repairs.map((r) => [
      r.repairId,
      `"${r.customer.name}"`,
      r.customer.phone,
      `"${r.device.brand} ${r.device.model}"`,
      r.status,
      r.priority,
      r.finalCost || r.estimatedCost,
      r.amountPaid,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Repairs_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Report Downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Repair Jobs Directory</h1>
          <p className="text-xs text-slate-400 mt-1">Total {total} repair tickets recorded</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold px-3.5 py-2.5 rounded-xl transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <Link
            to="/repairs/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Repair Job</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Repair ID, Customer Name, Phone, Device, or Serial/IMEI..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition"
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/60">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s === 'All Statuses' ? '' : s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Device Type</label>
            <select
              value={deviceFilter}
              onChange={(e) => {
                setDeviceFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {DEVICE_OPTIONS.map((d) => (
                <option key={d} value={d === 'All Devices' ? '' : d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p === 'All Priorities' ? '' : p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Assigned Technician</label>
            <select
              value={technicianFilter}
              onChange={(e) => {
                setTechnicianFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Technicians</option>
              {technicians.map((tech) => (
                <option key={tech._id} value={tech._id}>
                  {tech.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Repairs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <p className="text-xs text-slate-400">Loading repair records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Ticket ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Device Info</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Technician</th>
                  <th className="py-3.5 px-4">Est. Cost / Paid</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {repairs.length > 0 ? (
                  repairs.map((repair) => (
                    <tr key={repair._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/repairs/${repair._id}`}
                          className="font-mono font-bold text-blue-400 hover:underline"
                        >
                          {repair.repairId}
                        </Link>
                        <p className="text-[10px] text-slate-500">{formatDate(repair.createdAt)}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-200">{repair.customer?.name}</p>
                        <p className="text-[11px] text-slate-500">{repair.customer?.phone}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-200">
                          {repair.device?.brand} {repair.device?.model}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {repair.device?.type} {repair.device?.color ? `• ${repair.device.color}` : ''}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={repair.status} />
                      </td>
                      <td className="py-3.5 px-4">
                        <PriorityBadge priority={repair.priority} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {repair.assignedTechnician?.name || (
                          <span className="text-slate-600 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-200">
                          {formatCurrency(repair.finalCost || repair.estimatedCost)}
                        </p>
                        <PaymentStatusBadge status={repair.paymentStatus} />
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedRepairForStatus(repair)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700"
                          title="Quick Update Status"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/track/${repair.repairId}`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 border border-slate-700 inline-block"
                          title="View Customer Tracking Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          to={`/repairs/${repair._id}`}
                          className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1.5 rounded-lg transition inline-block"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-500">
                      No repair jobs match your search or filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Page <span className="font-bold text-slate-200">{page}</span> of{' '}
            <span className="font-bold text-slate-200">{totalPages}</span> ({total} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Status Modal */}
      {selectedRepairForStatus && (
        <StatusUpdaterModal
          repair={selectedRepairForStatus}
          onClose={() => setSelectedRepairForStatus(null)}
          onSuccess={() => fetchRepairs()}
        />
      )}
    </div>
  );
};

export default RepairsList;
