import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'blue', trend, subtext }) => {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition shadow-lg shadow-black/20">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-extrabold text-slate-100 tracking-tight">{value}</h3>
        {trend && <span className="text-xs font-medium text-emerald-400">{trend}</span>}
      </div>
      {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
    </div>
  );
};

export default StatCard;
