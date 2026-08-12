import React from 'react';

export default function StatCard({ title, value, icon: Icon, borderColorClass = 'border-slate-700', onClick }) {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`glass-card p-6 rounded-lg shadow-xl border-l-4 ${borderColorClass} transition duration-300 ${
        isClickable
          ? 'cursor-pointer hover:bg-slate-800/50 hover:scale-[1.02] active:scale-[0.98]'
          : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">{title}</p>
          <p className="mt-2 text-3xl font-extrabold font-display tracking-tight text-slate-100">{value}</p>
        </div>
        {Icon && (
          <div className="p-3 rounded-lg bg-slate-900/80 text-slate-400 border border-slate-800">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      {isClickable && (
        <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Click to view detailed breakdown</span>
          <span className="text-amber-500">→</span>
        </div>
      )}
    </div>
  );
}
