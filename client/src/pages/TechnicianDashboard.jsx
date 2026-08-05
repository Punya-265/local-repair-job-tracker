import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import StatusUpdaterModal from '../components/StatusUpdaterModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Cpu,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepair, setSelectedRepair] = useState(null);

  useEffect(() => {
    fetchMyRepairs();
  }, []);

  const fetchMyRepairs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/repairs?assignedToMe=true&limit=50');
      if (res.data.success) {
        setRepairs(res.data.repairs);
      }
    } catch (err) {
      toast.error('Failed to load assigned repairs');
    } finally {
      setLoading(false);
    }
  };

  const newAssignedCount = repairs.filter((r) => r.status === 'Received').length;
  const inProgressCount = repairs.filter((r) => r.status === 'Diagnosing' || r.status === 'Repairing').length;
  const waitingCount = repairs.filter((r) => r.status === 'Waiting for Approval').length;
  const completedCount = repairs.filter((r) => r.status === 'Ready for Pickup' || r.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900/30 via-slate-900 to-blue-900/30 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Technician Workbench</h1>
          </div>
          <p className="text-xs text-slate-400">
            Assigned workbench queue for <span className="text-slate-200 font-semibold">{user?.name}</span> ({user?.specialization || 'Hardware Engineer'})
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="New Assigned" value={newAssignedCount} icon={Wrench} color="blue" />
        <StatCard title="In Progress" value={inProgressCount} icon={Cpu} color="indigo" />
        <StatCard title="Waiting Approval/Parts" value={waitingCount} icon={Clock} color="amber" />
        <StatCard title="Completed Jobs" value={completedCount} icon={CheckCircle2} color="emerald" />
      </div>

      {/* Assigned Jobs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-200">My Assigned Repair Tickets ({repairs.length})</h3>
          <button
            onClick={fetchMyRepairs}
            className="text-xs text-blue-400 hover:underline font-semibold"
          >
            Refresh Queue
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <p className="text-xs text-slate-400">Loading your workbench queue...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Device Details</th>
                  <th className="py-3 px-4">Reported Problem</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {repairs.length > 0 ? (
                  repairs.map((repair) => (
                    <tr key={repair._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">{repair.repairId}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-200">
                          {repair.device?.brand} {repair.device?.model}
                        </p>
                        <p className="text-[11px] text-slate-500">{repair.device?.type}</p>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-300">
                        {repair.reportedProblem}
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={repair.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={repair.status} />
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedRepair(repair)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
                        >
                          Update Status
                        </button>
                        <Link
                          to={`/repairs/${repair._id}`}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 inline-block"
                        >
                          Work Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      No repair jobs currently assigned to your workbench.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRepair && (
        <StatusUpdaterModal
          repair={selectedRepair}
          onClose={() => setSelectedRepair(null)}
          onSuccess={() => fetchMyRepairs()}
        />
      )}
    </div>
  );
};

export default TechnicianDashboard;
