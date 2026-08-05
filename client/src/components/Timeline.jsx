import React from 'react';
import { formatDateTime } from '../utils/formatters';
import { CheckCircle2, Clock, User, AlertCircle, Wrench } from 'lucide-react';

const Timeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return <p className="text-slate-500 text-sm italic">No status updates recorded yet.</p>;
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {history.map((item, index) => {
        const isLatest = index === history.length - 1;
        return (
          <div key={item._id || index} className="relative group">
            {/* Timeline node icon */}
            <div
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                isLatest
                  ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-500/50'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-100">{item.newStatus}</span>
                  {item.previousStatus && (
                    <span className="text-xs text-slate-500">
                      (from <span className="line-through">{item.previousStatus}</span>)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{formatDateTime(item.timestamp)}</span>
                </div>
              </div>

              {item.note && <p className="text-xs text-slate-300 mt-2 bg-slate-900/90 p-2 rounded-lg border border-slate-800/50">{item.note}</p>}

              <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                <User className="w-3 h-3" />
                <span>Updated by: {item.changedBy?.name || item.changedByName || 'System'}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
