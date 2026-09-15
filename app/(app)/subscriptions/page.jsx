'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Plus,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ban,
  Loader2,
  Calendar,
} from 'lucide-react';
import SubscriptionModal from '@/components/subscriptions/SubscriptionModal';
import PlanModal from '@/components/subscriptions/PlanModal';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, planRes] = await Promise.all([
        fetch(`/api/subscriptions?status=${statusFilter}&search=${encodeURIComponent(search)}`),
        fetch('/api/plans'),
      ]);

      const subData = await subRes.json();
      const planData = await planRes.json();

      if (subRes.ok) setSubscriptions(subData.subscriptions || []);
      if (planRes.ok) setPlans(planData.plans || []);
    } catch (err) {
      console.error('Failed to load subscriptions data:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleCancelSub = async (subId) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    try {
      const res = await fetch(`/api/subscriptions/${subId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      alert('Failed to cancel subscription.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Subscriptions & Plans
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Manage customer plan allocations, quota meters, renewals and plan terms
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsPlanModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Sparkles className="h-4 w-4 text-[#3525CD]" />
            <span>Create Plan</span>
          </button>
          <button
            onClick={() => setIsSubModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#3525CD] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-[#2A1DB5]"
          >
            <Plus className="h-4 w-4" />
            <span>New Subscription</span>
          </button>
        </div>
      </div>

      {/* Available Plans Horizontal Ribbon */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Active Meal Plans ({plans.length})
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className="stitch-card p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-slate-900">{plan.name}</h4>
                  <span className="text-sm font-extrabold text-[#3525CD]">
                    ₹{plan.price}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {plan.description || 'Standard meal subscription terms'}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-slate-600">
                  <span className="rounded-md bg-indigo-50 px-2 py-1 text-[#3525CD]">
                    {plan.quota} Meals
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-1">
                    {plan.validityDays} Days
                  </span>
                  <span className="rounded-md bg-slate-100 px-2 py-1">
                    Max {plan.mealsPerDay}/day
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, mobile, or Member ID..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-900 focus:border-[#3525CD] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3525CD]/20"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-1">
          {['ALL', 'ACTIVE', 'EXHAUSTED', 'EXPIRED', 'PENDING_START'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-white text-[#3525CD] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Subscriptions Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-[#3525CD]" />
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-[#3525CD]">
            <CreditCard className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-base font-bold text-slate-900">No Subscriptions Found</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            {search
              ? 'No matching subscriptions for your search filter.'
              : 'Create a new subscription for a customer to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => {
            const consumed = sub.validMealsCount || 0;
            const remaining = sub.remainingBalance;
            const progressPercent = Math.min(100, Math.round((consumed / sub.quota) * 100));

            return (
              <div key={sub.id} className="stitch-card flex flex-col justify-between p-5 space-y-4">
                <div className="space-y-3">
                  {/* Customer Info & Status Badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-[#3525CD]">
                        #{sub.customer.memberId}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 leading-tight">
                        {sub.customer.name}
                      </h4>
                      <p className="text-xs font-medium text-slate-500">
                        {sub.customer.mobile}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                        sub.derivedStatus === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.derivedStatus === 'EXHAUSTED'
                          ? 'bg-amber-100 text-amber-800'
                          : sub.derivedStatus === 'EXPIRED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {sub.derivedStatus === 'ACTIVE' && <CheckCircle2 className="h-3 w-3" />}
                      {sub.derivedStatus === 'EXHAUSTED' && <AlertTriangle className="h-3 w-3" />}
                      {sub.derivedStatus === 'EXPIRED' && <Clock className="h-3 w-3" />}
                      {sub.derivedStatus}
                    </span>
                  </div>

                  {/* Plan Name & Terms */}
                  <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{sub.planName}</span>
                      <span className="font-extrabold text-slate-900">₹{sub.price}</span>
                    </div>

                    {/* Progress Usage Meter */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                        <span>Meals Consumed: {consumed}</span>
                        <span className="font-bold text-[#3525CD]">
                          {remaining} Left
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full transition-all duration-300 ${
                            remaining <= 3 ? 'bg-amber-500' : 'bg-[#3525CD]'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Validity Dates */}
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 pt-1 border-t border-slate-200/60">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span>
                        Valid: {new Date(sub.startDate).toLocaleDateString()} –{' '}
                        {new Date(sub.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cancel Action */}
                {sub.derivedStatus !== 'CANCELLED' && (
                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleCancelSub(sub.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-red-600 transition"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      <span>Cancel Plan</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        onSuccess={fetchData}
      />
      <PlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
