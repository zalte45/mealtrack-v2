'use client';

import { useState } from 'react';
import { X, Loader2, Sparkles, Save } from 'lucide-react';

export default function PlanModal({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quota, setQuota] = useState(30);
  const [validityDays, setValidityDays] = useState(30);
  const [price, setPrice] = useState(2000);
  const [mealsPerDay, setMealsPerDay] = useState(1);
  const [allowedMealTypes, setAllowedMealTypes] = useState(['BREAKFAST', 'LUNCH', 'DINNER']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleMealType = (type) => {
    if (allowedMealTypes.includes(type)) {
      if (allowedMealTypes.length === 1) return; // Keep at least one
      setAllowedMealTypes(allowedMealTypes.filter((t) => t !== type));
    } else {
      setAllowedMealTypes([...allowedMealTypes, type]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          quota: parseInt(quota, 10),
          validityDays: parseInt(validityDays, 10),
          price: parseFloat(price),
          mealsPerDay: parseInt(mealsPerDay, 10),
          allowedMealTypes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create meal plan');
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
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-[#3525CD]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Create Meal Plan</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Plan Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monthly Standard Lunch"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3525CD] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3525CD]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Meal Quota *
              </label>
              <input
                type="number"
                required
                min={1}
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3525CD] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3525CD]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Validity (Days) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3525CD] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3525CD]/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Price (₹) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3525CD] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3525CD]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Max Meals / Day *
              </label>
              <input
                type="number"
                required
                min={1}
                max={5}
                value={mealsPerDay}
                onChange={(e) => setMealsPerDay(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:border-[#3525CD] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3525CD]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Allowed Meal Types
            </label>
            <div className="flex gap-2">
              {['BREAKFAST', 'LUNCH', 'DINNER'].map((type) => {
                const selected = allowedMealTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleMealType(type)}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold border transition ${
                      selected
                        ? 'border-[#3525CD] bg-indigo-50 text-[#3525CD]'
                        : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>Save Plan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
