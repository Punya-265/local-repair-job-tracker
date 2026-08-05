import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Share2,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const STEPS = [
  'Received',
  'Diagnosing',
  'Waiting for Approval',
  'Approved',
  'Repairing',
  'Ready for Pickup',
  'Completed',
];

const TrackRepair = () => {
  const { repairId } = useParams();
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingDecision, setSubmittingDecision] = useState(false);

  useEffect(() => {
    fetchPublicTracking();
  }, [repairId]);

  const fetchPublicTracking = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`/api/repairs/track/${repairId}`);
      if (res.data.success) {
        setRepair(res.data.repair);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to locate repair ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decision) => {
    try {
      setSubmittingDecision(true);
      const res = await axios.post(`/api/repairs/track/${repairId}/decision`, {
        decision,
      });

      if (res.data.success) {
        toast.success(`You have ${decision.toLowerCase()} the repair estimate.`);
        fetchPublicTracking();
      }
    } catch (err) {
      toast.error('Failed to submit your decision. Please try again.');
    } finally {
      setSubmittingDecision(false);
    }
  };

  const shareTrackingUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: `Repair Status - ${repairId}`,
        text: `Track repair status for ticket ${repairId}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Tracking URL copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-300">Fetching live repair status...</p>
      </div>
    );
  }

  if (error || !repair) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-100 mb-2">Tracking ID Not Found</h2>
          <p className="text-xs text-slate-400 mb-6">{error || 'Please double check your ticket number.'}</p>
          <Link
            to="/login"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl"
          >
            Go to Portal Home
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = STEPS.indexOf(repair.status);
  const totalCost = repair.finalCost > 0 ? repair.finalCost : repair.estimatedCost;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-[Inter] py-8 px-4 sm:px-6">
      <Toaster position="top-center" />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer Repair Ticket</p>
                <h1 className="text-2xl font-extrabold text-slate-100 font-mono tracking-tight">{repair.repairId}</h1>
              </div>
            </div>
            <button
              onClick={shareTrackingUrl}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title="Share Tracking Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Device Model</p>
              <p className="text-sm font-bold text-slate-100">
                {repair.device?.brand} {repair.device?.model}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Estimated Completion</p>
              <p className="text-sm font-bold text-blue-400">{formatDate(repair.estimatedCompletionDate)}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Repair Cost</p>
              <p className="text-sm font-bold text-emerald-400">{formatCurrency(totalCost)}</p>
            </div>
          </div>
        </div>

        {/* CUSTOMER APPROVAL PROMPT BANNER */}
        {repair.status === 'Waiting for Approval' && (
          <div className="bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl animate-pulse">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="text-base font-bold text-amber-300">Additional Repair Authorization Required</h3>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Our technician diagnosed your device and updated the repair cost estimate to{' '}
                  <strong className="text-amber-100 font-bold text-sm">{formatCurrency(totalCost)}</strong>.
                  Please approve or reject this estimate to proceed with the repair.
                </p>
                {repair.diagnosis && (
                  <p className="text-xs text-slate-300 italic bg-amber-950/50 p-2.5 rounded-xl border border-amber-800/50">
                    Diagnosis Note: {repair.diagnosis}
                  </p>
                )}
                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleDecision('Approved')}
                    disabled={submittingDecision}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>Approve Repair (₹{totalCost})</span>
                  </button>
                  <button
                    onClick={() => handleDecision('Rejected')}
                    disabled={submittingDecision}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 text-xs font-bold px-4 py-2.5 rounded-xl transition disabled:opacity-50"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span>Reject Repair</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DECISION ALREADY MADE BANNER */}
        {repair.customerDecision?.decision && repair.customerDecision.decision !== 'Pending' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
            <p className="text-slate-300">
              Your decision (<strong className="text-white">{repair.customerDecision.decision}</strong>) was recorded at{' '}
              {formatDateTime(repair.customerDecision.timestamp)}.
            </p>
          </div>
        )}

        {/* Live Step Progress Timeline Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">Live Repair Workflow</h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {STEPS.map((step, idx) => {
              const isPassed = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step} className="relative flex items-center justify-between">
                  <div
                    className={`absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isCurrent
                        ? 'bg-blue-600 border-blue-400 text-white ring-4 ring-blue-500/20'
                        : isPassed
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'bg-slate-950 border-slate-800 text-slate-600'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${isCurrent ? 'text-blue-400 text-sm' : isPassed ? 'text-slate-200' : 'text-slate-500'}`}>
                      {step}
                    </p>
                  </div>
                  {isCurrent && <span className="text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">Current Stage</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Repair & Device Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800">
            Repair Details & Reported Problem
          </h3>

          <div>
            <p className="text-slate-500 font-semibold mb-1">Reported Problem:</p>
            <p className="text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800">{repair.reportedProblem}</p>
          </div>

          {repair.diagnosis && (
            <div>
              <p className="text-slate-500 font-semibold mb-1">Technician Workbench Diagnosis:</p>
              <p className="text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800">{repair.diagnosis}</p>
            </div>
          )}

          {repair.photos && repair.photos.length > 0 && (
            <div>
              <p className="text-slate-500 font-semibold mb-2">Device Inspection Photos:</p>
              <div className="grid grid-cols-2 gap-2">
                {repair.photos.map((p, i) => (
                  <img key={i} src={p.url} alt="Device photo" className="rounded-xl border border-slate-800 aspect-video object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History Timeline Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800">
            Detailed Progress Timeline Log
          </h3>
          <div className="space-y-3 text-xs">
            {repair.history && repair.history.length > 0 ? (
              repair.history.map((h, i) => (
                <div key={i} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-blue-400">{h.newStatus}</span>
                    <span className="text-[10px] text-slate-500">{formatDateTime(h.timestamp)}</span>
                  </div>
                  {h.note && <p className="text-slate-300">{h.note}</p>}
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic">No history logs recorded.</p>
            )}
          </div>
        </div>

        {/* Shop Contact Footer */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shop Contact & Service Center</h3>
          <p className="text-sm font-bold text-slate-100">{repair.shopContact?.name}</p>
          <div className="space-y-1 text-xs text-slate-400">
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              <span>{repair.shopContact?.address}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <a href={`tel:${repair.shopContact?.phone}`} className="hover:underline text-slate-200">
                {repair.shopContact?.phone}
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-purple-400" />
              <span>{repair.shopContact?.email}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackRepair;
