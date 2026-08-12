import React from 'react';
import { X, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';

export default function NetMoveModal({ isOpen, onClose, metrics }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="font-display text-lg font-bold text-slate-100 mb-6 pb-2 border-b border-slate-800">
          Net Movement Breakdown
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded bg-slate-950/50 border border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-800 text-amber-500">
                <Plus className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-slate-350">Purchases (+)</span>
            </div>
            <span className="text-sm font-mono font-bold text-slate-200">{metrics.purchases}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-slate-950/50 border border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500/10 text-emerald-500">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-slate-355 text-emerald-450">Transfers In (+)</span>
            </div>
            <span className="text-sm font-mono font-bold text-emerald-500">+{metrics.transfersIn}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-slate-950/50 border border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-red-500/10 text-red-500">
                <ArrowDownRight className="h-4 w-4" />
              </div>
              <span className="text-sm font-semibold text-slate-355 text-red-450">Transfers Out (-)</span>
            </div>
            <span className="text-sm font-mono font-bold text-red-500">-{metrics.transfersOut}</span>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-semibold">
            <span className="text-sm text-slate-300">Total Net Movement</span>
            <span className={`text-base font-mono font-bold ${
              metrics.netMovement > 0
                ? 'text-emerald-500'
                : metrics.netMovement < 0
                ? 'text-red-500'
                : 'text-slate-300'
            }`}>
              {metrics.netMovement > 0 ? `+${metrics.netMovement}` : metrics.netMovement}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition cursor-pointer"
        >
          Acknowledge & Close
        </button>
      </div>
    </div>
  );
}
