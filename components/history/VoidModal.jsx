'use client';

import { useState } from 'react';
import { X, AlertTriangle, Loader2, RotateCcw } from 'lucide-react';

export default function VoidModal({ isOpen, onClose, onSuccess, mealRecord }) {
  const [voidReason, setVoidReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !mealRecord) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/history/void', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealRecordId: mealRecord.id,
          voidReason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to void meal record');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Void Meal Transaction</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-xl bg-slate-50 p-3.5 space-y-1 text-xs text-slate-700">
            <p className="font-bold text-slate-900">
              Target Record: #{mealRecord.customer?.memberId} — {mealRecord.customer?.name}
            </p>
            <p className="text-slate-500">
              Meal Type: {mealRecord.mealType} | Timestamp:{' '}
              {new Date(mealRecord.createdAt).toLocaleString()}
            </p>
            <p className="text-[11px] text-amber-700 font-medium pt-1">
              ⚠️ Voiding this record will restore +1 meal to the customer&apos;s active subscription balance and preserve an audit trail.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Reason for Voiding *
            </label>
            <textarea
              required
              rows={3}
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="e.g. Operator double tap, customer changed mind..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3525CD] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3525CD]/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !voidReason.trim()}
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2 text-sm font-bold text-white shadow-md shadow-amber-600/20 hover:bg-amber-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              <span>Confirm Void (-1 Record)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
