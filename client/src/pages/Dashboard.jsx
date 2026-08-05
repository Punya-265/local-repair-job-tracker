import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatCard from '../components/StatCard';
import { StatusBadge } from '../components/Badge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  FileCheck,
  Package,
  Plus,
  ArrowRight,
  Loader2,
  Activity,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

const COLORS = ['#3b82f6', '#a855f7', '#f59e0b', '#14b8a6', '#6366f1', '#10b981', '#22c55e', '#f43f5e'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
        <p className="text-sm text-slate-400">Loading shop dashboard metrics...</p>
      </div>
    );
  }

  const { stats, charts, recentRepairs } = data;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-900/30 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Shop Admin Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time digital repair operations, revenue stats & customer approval tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/repairs/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Repair Ticket</span>
          </Link>
        </div>
      </div>

      {/* 9 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title="Active Repairs"
          value={stats.totalActiveRepairs}
          icon={Activity}
          color="blue"
          subtext="Repairs currently in shop"
        />
        <StatCard
          title="Received Today"
          value={stats.repairsReceivedToday}
          icon={Package}
          color="purple"
          subtext="New tickets opened today"
        />
        <StatCard
          title="Being Diagnosed"
          value={stats.diagnosingCount}
          icon={Wrench}
          color="amber"
          subtext="Workbench investigation"
        />
        <StatCard
          title="Waiting for Approval"
          value={stats.waitingForApprovalCount}
          icon={Clock}
          color="amber"
          subtext="Estimate authorization sent"
        />
        <StatCard
          title="In Repair Progress"
          value={stats.inProgressCount}
          icon={TrendingUp}
          color="indigo"
          subtext="Technicians actively repairing"
        />
        <StatCard
          title="Ready for Pickup"
          value={stats.readyForPickupCount}
          icon={FileCheck}
          color="emerald"
          subtext="Quality test passed"
        />
        <StatCard
          title="Completed Repairs"
          value={stats.completedCount}
          icon={CheckCircle2}
          color="teal"
          subtext="Delivered & closed tickets"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={DollarSign}
          color="emerald"
          subtext="Settled payments collected"
        />
        {stats.overdueCount > 0 && (
          <StatCard
            title="Overdue Repairs"
            value={stats.overdueCount}
            icon={AlertTriangle}
            color="rose"
            subtext="Exceeded estimated date"
          />
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repairs over time - Area Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Repair Volume Trend (Last 7 Days)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.repairsOverTime}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown - Donut Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            Repairs Distribution by Status
          </h3>
          <div className="h-64 flex items-center justify-center">
            {charts.repairsByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.repairsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {charts.repairsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">No repair jobs data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Repairs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Recent Repair Tickets</h3>
            <p className="text-xs text-slate-500">Latest active repair jobs created</p>
          </div>
          <Link
            to="/repairs"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>View All Repairs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4">Est. Cost</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentRepairs && recentRepairs.length > 0 ? (
                recentRepairs.map((repair) => (
                  <tr key={repair._id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">{repair.repairId}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-200">{repair.customer.name}</p>
                      <p className="text-[11px] text-slate-500">{repair.customer.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-300">{repair.device.brand} {repair.device.model}</p>
                      <p className="text-[11px] text-slate-500">{repair.device.type}</p>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={repair.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {repair.assignedTechnician?.name || 'Unassigned'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      {formatCurrency(repair.finalCost || repair.estimatedCost)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/repairs/${repair._id}`}
                        className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 inline-block"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No repair tickets found. Click "Create Repair Ticket" to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
