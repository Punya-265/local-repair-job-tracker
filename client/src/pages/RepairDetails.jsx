import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge, PaymentStatusBadge } from '../components/Badge';
import Timeline from '../components/Timeline';
import StatusUpdaterModal from '../components/StatusUpdaterModal';
import PhotoUploadModal from '../components/PhotoUploadModal';
import InvoiceModal from '../components/InvoiceModal';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import toast from 'react-hot-toast';
import {
  Wrench,
  User,
  Phone,
  Mail,
  Laptop,
  Calendar,
  DollarSign,
  Clock,
  Printer,
  Upload,
  ExternalLink,
  Edit3,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';

const WORKFLOW_STEPS = [
  'Received',
  'Diagnosing',
  'Waiting for Approval',
  'Approved',
  'Repairing',
  'Ready for Pickup',
  'Completed',
];

const RepairDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [repair, setRepair] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Diagnosis editor state
  const [editingDiagnosis, setEditingDiagnosis] = useState(false);
  const [diagnosisText, setDiagnosisText] = useState('');
  const [notesText, setNotesText] = useState('');

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  useEffect(() => {
    fetchRepairDetails();
  }, [id]);

  const fetchRepairDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/repairs/${id}`);
      if (res.data.success) {
        setRepair(res.data.repair);
        setHistory(res.data.history);
        setDiagnosisText(res.data.repair.diagnosis || '');
        setNotesText(res.data.repair.notes || '');
      }
    } catch (err) {
      toast.error('Failed to load repair job details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDiagnosis = async () => {
    try {
      const res = await api.post(`/repairs/${id}/diagnosis`, {
        diagnosis: diagnosisText,
        notes: notesText,
      });

      if (res.data.success) {
        toast.success('Diagnosis & technician notes saved.');
        setRepair(res.data.repair);
        setEditingDiagnosis(false);
      }
    } catch (err) {
      toast.error('Failed to save diagnosis');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/repairs/${id}/payment`, {
        amountPaid: Number(paymentAmount),
        paymentMethod,
      });
      if (res.data.success) {
        toast.success('Payment recorded successfully!');
        setRepair(res.data.repair);
        setPaymentModalOpen(false);
        setPaymentAmount(0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
        <p className="text-xs text-slate-400">Loading repair job ticket details...</p>
      </div>
    );
  }

  if (!repair) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-200">Repair Ticket Not Found</h2>
        <button onClick={() => navigate('/repairs')} className="text-xs text-blue-400 hover:underline mt-2">
          Return to Repairs Directory
        </button>
      </div>
    );
  }

  const currentStepIndex = WORKFLOW_STEPS.indexOf(repair.status);
  const totalCost = repair.finalCost > 0 ? repair.finalCost : repair.estimatedCost;
  const balanceDue = Math.max(0, totalCost - (repair.amountPaid || 0));

  return (
    <div className="space-y-6">
      {/* Top Navigation & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/repairs')}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Repairs List</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight font-mono">
              #{repair.repairId}
            </h1>
            <StatusBadge status={repair.status} />
            <PriorityBadge priority={repair.priority} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/track/${repair.repairId}`}
            target="_blank"
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-teal-400 border border-slate-800 text-xs font-semibold px-3 py-2 rounded-xl transition"
          >
            <span>Customer Track URL</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setInvoiceModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold px-3 py-2 rounded-xl transition"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Print Invoice</span>
          </button>
          <button
            onClick={() => setStatusModalOpen(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-blue-600/25 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update Workflow Status</span>
          </button>
        </div>
      </div>

      {/* Visual Workflow Pipeline Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Repair Workflow Pipeline
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {WORKFLOW_STEPS.map((step, idx) => {
            const isCompletedStep = idx <= currentStepIndex;
            const isCurrentStep = idx === currentStepIndex;
            return (
              <div
                key={step}
                className={`p-3 rounded-xl border text-center transition ${
                  isCurrentStep
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/50'
                    : isCompletedStep
                    ? 'bg-slate-950 border-emerald-500/30 text-emerald-400'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {isCompletedStep ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-current text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-semibold truncate">{step}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer & Device details */}
        <div className="space-y-6">
          {/* Customer Info Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              Customer Information
            </h3>
            <div>
              <p className="text-sm font-bold text-slate-100">{repair.customer?.name}</p>
              <div className="mt-2 space-y-1.5 text-xs text-slate-400">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>{repair.customer?.phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{repair.customer?.email}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Device Info Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Laptop className="w-4 h-4 text-purple-400" />
              Device Specification
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">Device Type:</span>
                <span className="font-semibold text-slate-200">{repair.device?.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">Brand / Model:</span>
                <span className="font-semibold text-slate-200">
                  {repair.device?.brand} {repair.device?.model}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">Serial / IMEI:</span>
                <span className="font-mono text-slate-300">{repair.device?.serialNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">Device Color:</span>
                <span className="text-slate-300">{repair.device?.color || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Assigned Tech:</span>
                <span className="font-semibold text-blue-400">
                  {repair.assignedTechnician?.name || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          {/* Billing & Payment Overview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Payment Summary
              </h3>
              <PaymentStatusBadge status={repair.paymentStatus} />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Cost:</span>
                <span className="text-slate-200">{formatCurrency(repair.estimatedCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Final Cost:</span>
                <span className="font-bold text-slate-100">{formatCurrency(totalCost)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Amount Paid:</span>
                <span className="font-bold">{formatCurrency(repair.amountPaid || 0)}</span>
              </div>
              <div className="flex justify-between text-rose-400 font-bold border-t border-slate-800 pt-2">
                <span>Balance Due:</span>
                <span>{formatCurrency(balanceDue)}</span>
              </div>
            </div>

            <button
              onClick={() => setPaymentModalOpen(true)}
              className="w-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-semibold py-2 rounded-xl transition"
            >
              + Record Payment Receipt
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Diagnosis, Photos, & History Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Decision Notice if pending/approved/rejected */}
          {repair.customerDecision?.decision !== 'Pending' && (
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                repair.customerDecision?.decision === 'Approved'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">
                  Customer Decision: {repair.customerDecision?.decision}
                </p>
                <p className="text-xs mt-0.5">
                  Recorded at {formatDateTime(repair.customerDecision?.timestamp)}
                  {repair.customerDecision?.note ? ` - "${repair.customerDecision.note}"` : ''}
                </p>
              </div>
            </div>
          )}

          {/* Diagnosis & Technician Notes */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                Problem & Technician Diagnosis
              </h3>
              {!editingDiagnosis ? (
                <button
                  onClick={() => setEditingDiagnosis(true)}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  Edit Diagnosis
                </button>
              ) : (
                <button
                  onClick={handleSaveDiagnosis}
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg"
                >
                  Save Notes
                </button>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-500 font-semibold mb-1">Customer Reported Issue:</p>
                <p className="text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {repair.reportedProblem}
                </p>
              </div>

              <div>
                <p className="text-slate-500 font-semibold mb-1">Technician Workbench Diagnosis:</p>
                {editingDiagnosis ? (
                  <textarea
                    rows="3"
                    value={diagnosisText}
                    onChange={(e) => setDiagnosisText(e.target.value)}
                    placeholder="Enter technician diagnosis, faulty components found, or required parts..."
                    className="w-full bg-slate-950 border border-blue-500 rounded-xl p-3 text-xs text-slate-100 focus:outline-none"
                  />
                ) : (
                  <p className="text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 italic">
                    {repair.diagnosis || 'No diagnosis recorded yet.'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Device Condition Photos ({repair.photos?.length || 0})
              </h3>
              <button
                onClick={() => setPhotoModalOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700"
              >
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>Upload Photos</span>
              </button>
            </div>

            {repair.photos && repair.photos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {repair.photos.map((photo, i) => (
                  <a
                    key={i}
                    href={photo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative rounded-xl overflow-hidden border border-slate-800 aspect-video bg-slate-950"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Repair photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-end p-2">
                      <p className="text-[10px] text-white truncate">{photo.caption || 'View Image'}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No device condition photos uploaded yet.</p>
            )}
          </div>

          {/* Timeline Audit Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800">
              Complete Status History Timeline
            </h3>
            <Timeline history={history} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {statusModalOpen && (
        <StatusUpdaterModal
          repair={repair}
          onClose={() => setStatusModalOpen(false)}
          onSuccess={() => fetchRepairDetails()}
        />
      )}

      {photoModalOpen && (
        <PhotoUploadModal
          repairId={repair._id}
          onClose={() => setPhotoModalOpen(false)}
          onSuccess={() => fetchRepairDetails()}
        />
      )}

      {invoiceModalOpen && (
        <InvoiceModal repair={repair} onClose={() => setInvoiceModalOpen(false)} />
      )}

      {/* Record Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-slate-100 text-base mb-4">Record Payment Receipt</h3>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-slate-100 focus:outline-none"
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl"
                >
                  Save Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepairDetails;
