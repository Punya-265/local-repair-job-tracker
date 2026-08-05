import React from 'react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Printer, X, Wrench, CheckCircle } from 'lucide-react';

const InvoiceModal = ({ repair, onClose }) => {
  if (!repair) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalCost = repair.finalCost > 0 ? repair.finalCost : repair.estimatedCost;
  const balanceDue = Math.max(0, totalCost - (repair.amountPaid || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header toolbar (Hidden during print) */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between no-print">
          <h3 className="font-bold text-slate-100 flex items-center gap-2">
            <Printer className="w-4 h-4 text-blue-400" />
            Repair Job Invoice
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md shadow-blue-500/20 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div className="p-6 overflow-y-auto" id="printable-invoice">
          {/* Shop Header */}
          <div className="flex justify-between items-start border-b border-slate-700 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wrench className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">FixTrack Repair Services</h1>
              </div>
              <p className="text-xs text-slate-500">123 Market Street, Main Town, Tech City</p>
              <p className="text-xs text-slate-500">Phone: +91 98765 43210 | Email: service@repairshop.com</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded">
                REPAIR INVOICE
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{repair.repairId}</h2>
              <p className="text-xs text-slate-500">Date: {formatDate(new Date())}</p>
            </div>
          </div>

          {/* Customer & Device Information */}
          <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Customer Details</h4>
              <p className="font-semibold text-slate-900 dark:text-white">{repair.customer?.name}</p>
              <p className="text-slate-600 dark:text-slate-400">Phone: {repair.customer?.phone}</p>
              <p className="text-slate-600 dark:text-slate-400">Email: {repair.customer?.email}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Device Specification</h4>
              <p className="font-semibold text-slate-900 dark:text-white">
                {repair.device?.brand} {repair.device?.model} ({repair.device?.type})
              </p>
              <p className="text-slate-600 dark:text-slate-400">Serial/IMEI: {repair.device?.serialNumber || 'N/A'}</p>
              <p className="text-slate-600 dark:text-slate-400">Color: {repair.device?.color || 'Standard'}</p>
            </div>
          </div>

          {/* Reported Problem & Diagnosis */}
          <div className="mb-6 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              SERVICE DESCRIPTION & DIAGNOSIS
            </div>
            <div className="p-4 text-xs space-y-2 text-slate-800 dark:text-slate-200">
              <p><strong>Reported Problem:</strong> {repair.reportedProblem}</p>
              {repair.diagnosis && <p><strong>Technician Diagnosis:</strong> {repair.diagnosis}</p>}
            </div>
          </div>

          {/* Charges Breakdown */}
          <table className="w-full text-xs text-left mb-6 border-collapse">
            <thead>
              <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-500 uppercase font-semibold">
                <th className="py-2">Item / Service</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              <tr>
                <td className="py-3">
                  <p className="font-semibold">Hardware Diagnostics & Repair Labor</p>
                  <p className="text-[11px] text-slate-500">Service charge for {repair.device?.brand} {repair.device?.model}</p>
                </td>
                <td className="py-3 text-right font-medium">{formatCurrency(totalCost)}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals Summary */}
          <div className="flex justify-end border-t border-slate-300 dark:border-slate-700 pt-4">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span>{formatCurrency(totalCost)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Taxes & Fees:</span>
                <span>₹0</span>
              </div>
              <div className="flex justify-between text-slate-900 dark:text-white font-bold text-sm border-t border-slate-300 dark:border-slate-700 pt-2">
                <span>Total Amount:</span>
                <span>{formatCurrency(totalCost)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Amount Paid ({repair.paymentMethod || 'Cash'}):</span>
                <span>{formatCurrency(repair.amountPaid || 0)}</span>
              </div>
              <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold border-t border-dashed border-slate-300 dark:border-slate-700 pt-2">
                <span>Balance Due:</span>
                <span>{formatCurrency(balanceDue)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 text-center">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Thank you for choosing FixTrack Repair Services!</p>
            <p>All hardware repairs come with a 30-day service warranty. Please present this invoice receipt for device collection.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
