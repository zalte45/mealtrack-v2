'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, CreditCard, Check } from 'lucide-react';

export default function SubscriptionModal({ isOpen, onClose, onSuccess, preselectedCustomerId = null }) {
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(preselectedCustomerId || '');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFetching(true);
      Promise.all([
        fetch('/api/customers?filter=ACTIVE').then((r) => r.json()),
        fetch('/api/plans').then((r) => r.json()),
      ])
        .then(([custData, planData]) => {
          const custs = custData.customers || [];
          const plns = planData.plans || [];
          setCustomers(custs);
          setPlans(plns);
          if (custs.length) {
            setSelectedCustomerId((prev) => prev || custs[0].id);
          }
          if (plns.length) {
            setSelectedPlanId((prev) => prev || plns[0].id);
          }
        })
        .finally(() => setFetching(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          planId: selectedPlanId,
          paymentStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-[#3525CD]">
              <CreditCard className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">New Subscription / Renewal</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {fetching ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#3525CD]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            {/* Select Customer */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Select Customer *
              </label>
              <select
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#3525CD] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3525CD]/20"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    #{c.memberId} — {c.name} ({c.mobile})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Plan */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Select Meal Plan *
              </label>
              <select
                required
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#3525CD] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3525CD]/20"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.quota} Meals ({p.validityDays} Days) • ₹{p.price}
                  </option>
                ))}
              </select>
            </div>

            {/* Plan Preview Terms */}
            {selectedPlan && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between font-bold text-[#3525CD]">
                  <span>Snapshotted Terms:</span>
                  <span>₹{selectedPlan.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Meal Quota:</span>
                  <span className="font-semibold">{selectedPlan.quota} Meals</span>
                </div>
                <div className="flex justify-between">
                  <span>Validity Duration:</span>
                  <span className="font-semibold">{selectedPlan.validityDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Daily Allowance:</span>
                  <span className="font-semibold">{selectedPlan.mealsPerDay} meal/day</span>
                </div>
              </div>
            )}

            {/* Payment Status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Payment Status
              </label>
              <div className="flex gap-2">
                {['PAID', 'PENDING', 'PARTIAL'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setPaymentStatus(status)}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold border transition ${
                      paymentStatus === status
                        ? 'border-[#3525CD] bg-indigo-50 text-[#3525CD]'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-[#3525CD] px-5 py-2 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-[#2A1DB5] disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                <span>Activate Subscription</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
