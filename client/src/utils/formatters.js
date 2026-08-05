export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

export const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'Received':
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'Diagnosing':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'Waiting for Approval':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'Approved':
      return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
    case 'Repairing':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    case 'Ready for Pickup':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Completed':
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    case 'Rejected':
    case 'Cancelled':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};

export const getPriorityBadgeColor = (priority) => {
  switch (priority) {
    case 'Urgent':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    case 'High':
      return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    case 'Medium':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'Low':
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
};

export const getPaymentBadgeColor = (paymentStatus) => {
  switch (paymentStatus) {
    case 'Paid':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'Partially Paid':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'Unpaid':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};
