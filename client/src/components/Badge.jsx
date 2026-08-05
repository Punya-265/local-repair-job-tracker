import React from 'react';
import {
  getStatusBadgeColor,
  getPriorityBadgeColor,
  getPaymentBadgeColor,
} from '../utils/formatters';

export const StatusBadge = ({ status }) => {
  const colorClasses = getStatusBadgeColor(status);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const colorClasses = getPriorityBadgeColor(priority);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${colorClasses}`}
    >
      {priority}
    </span>
  );
};

export const PaymentStatusBadge = ({ status }) => {
  const colorClasses = getPaymentBadgeColor(status);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${colorClasses}`}
    >
      {status}
    </span>
  );
};
