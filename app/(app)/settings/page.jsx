'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Store,
  Users,
  Shield,
  Volume2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const [provider, setProvider] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState(3);
  const [chimeEnabled, setChimeEnabled] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.provider) {
          setProvider(data.provider);
          setName(data.provider.name || '');
          setPhone(data.provider.phone || '');
          setAddress(data.provider.address || '');
          setLowBalanceThreshold(data.provider.lowBalanceThreshold ?? 3);
          setChimeEnabled(data.provider.chimeEnabled ?? true);
        }
      })
      .catch((err) => setError('Failed to load provider settings.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setToast('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          address,
          lowBalanceThreshold,
          chimeEnabled,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setToast('Provider settings saved successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Provider Settings & Staff Management
        </h1>
        <p className="text-sm font-medium text-slate-500">
          Manage business profile, operational alert thresholds and operator accounts
        </p>
      </div>

      {toast && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-500 p-3.5 text-xs font-bold text-white shadow-md">
          <CheckCircle2 className="h-4 w-4 text-white" />
          <span>{toast}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-700">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-[#3525CD]" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Provider Profile Form */}
          <form onSubmit={handleSubmit} className="stitch-card p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Store className="h-5 w-5 text-[#3525CD]" />
              <h3 className="text-base font-bold text-slate-900">
                Business Organization Profile
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Provider Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#3525CD] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#3525CD] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Business Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#3525CD] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Low Balance Alert Threshold (Meals)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={lowBalanceThreshold}
                  onChange={(e) => setLowBalanceThreshold(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#3525CD] focus:bg-white focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Customers with remaining balance ≤ this value will trigger low balance warnings.
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div>
                  <span className="block text-xs font-bold text-slate-800">
                    POS Counter Audio Chime
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Play confirmation tone when a meal is recorded
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={chimeEnabled}
                  onChange={(e) => setChimeEnabled(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-[#3525CD] focus:ring-[#3525CD]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#3525CD] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-[#2A1DB5] disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>Save Provider Settings</span>
              </button>
            </div>
          </form>

          {/* Operator Accounts List */}
          <div className="stitch-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#3525CD]" />
                <h3 className="text-base font-bold text-slate-900">
                  Staff & Operator Accounts
                </h3>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {provider?.users?.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="/avatar.png"
                      alt="Avatar"
                      className="h-8 w-8 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900">{u.name}</h4>
                      <p className="text-slate-500">{u.email}</p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-[#3525CD]">
                    <Shield className="h-3 w-3" />
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
