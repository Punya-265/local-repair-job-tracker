import React, { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X, RefreshCw, AlertCircle } from 'lucide-react';

const STATUSES = [
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

const StatusUpdaterModal = ({ repair, onClose, onSuccess }) => {
  const [status, setStatus] = useState(repair.status);
  const [note, setNote] = useState('');
  const [finalCost, setFinalCost] = useState(repair.finalCost || repair.estimatedCost || 0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await api.patch(`/repairs/${repair._id}/status`, {
        status,
        note,
        finalCost: Number(finalCost),
      });

      if (res.data.success) {
        toast.success(`Status updated to ${status}`);
        onSuccess && onSuccess(res.data.repair);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update repair status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-slate-100 text-base">Update Repair Status</h3>
            <p className="text-xs text-slate-400">Job Ticket #{repair.repairId}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select New Workflow Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Cost Estimate / Final Cost (₹)
            </label>
            <input
              type="number"
              min="0"
              value={finalCost}
              onChange={(e) => setFinalCost(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
            />
            {status === 'Waiting for Approval' && (
              <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Changing to 'Waiting for Approval' will prompt customer for cost authorization.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Update Note / Internal Remark
            </label>
            <textarea
              rows="3"
              placeholder="Add optional notes about parts, diagnostics, or customer communication..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500 placeholder-slate-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-blue-600/25 transition disabled:opacity-50"
            >
              {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Save & Update</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusUpdaterModal;
