'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Utensils,
  Users,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  Loader2,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error('Failed to load dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Quick Action Hero Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-[#3525CD] via-indigo-700 to-indigo-800 p-6 text-white shadow-xl shadow-indigo-600/25">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#6CF8BB] animate-ping" />
            <span>OPERATIONAL READY</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            MealTrack SaaS Dashboard
          </h1>
          <p className="text-xs text-indigo-100 font-medium max-w-xl">
            Live overview of today&apos;s meal transactions, low balance alerts & customer subscriptions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/counter"
            className="flex items-center gap-2 rounded-xl bg-[#6CF8BB] px-5 py-3 text-sm font-extrabold text-slate-900 shadow-md transition hover:bg-emerald-300"
          >
            <Utensils className="h-4.5 w-4.5" />
            <span>⚡ Open Meal Counter</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-[#3525CD]" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* KPI Metric Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="stitch-card p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Today&apos;s Valid Meals
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-[#3525CD]">
                  <Utensils className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900">
                {data.kpis.todayValidMeals}
              </p>
              <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Served today
              </p>
            </div>

            <div className="stitch-card p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Today&apos;s Voids
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <AlertTriangle className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-amber-600">
                {data.kpis.todayVoidedMeals}
              </p>
              <p className="text-[11px] font-semibold text-slate-500">
                Audit corrections
              </p>
            </div>

            <div className="stitch-card p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Active Customers
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900">
                {data.kpis.activeCustomers}
              </p>
              <p className="text-[11px] font-semibold text-slate-500">
                Registered members
              </p>
            </div>

            <div className="stitch-card p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  Active Subscriptions
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-[#3525CD]">
                  <CreditCard className="h-4 w-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900">
                {data.kpis.activeSubscriptions}
              </p>
              <p className="text-[11px] font-semibold text-slate-500">
                Active plan passes
              </p>
            </div>
          </div>

          {/* Low Balance Alerts & Expiring Subscriptions Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Low Balance Alert List */}
            <div className="stitch-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900">
                    Low Balance Customers (≤3 meals)
                  </h3>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-extrabold text-amber-800">
                  {data.lowBalanceCustomers.length} Need Top-Up
                </span>
              </div>

              {data.lowBalanceCustomers.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  No customers with low meal balance.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {data.lowBalanceCustomers.map((cust) => (
                    <div
                      key={cust.subscriptionId}
                      className="flex items-center justify-between rounded-xl bg-amber-50/60 p-3 text-xs border border-amber-200/50"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#3525CD]">
                            #{cust.memberId}
                          </span>
                          <span className="font-bold text-slate-900">
                            {cust.customerName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {cust.planName}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-amber-700 text-sm">
                          {cust.remainingBalance} left
                        </span>
                        <Link
                          href="/subscriptions"
                          className="block text-[11px] font-bold text-[#3525CD] hover:underline"
                        >
                          Renew →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Expiring Subscriptions List */}
            <div className="stitch-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#3525CD]" />
                  <h3 className="text-base font-bold text-slate-900">
                    Subscriptions Expiring Soon
                  </h3>
                </div>
                <Link
                  href="/subscriptions"
                  className="text-xs font-bold text-[#3525CD] hover:underline"
                >
                  View All →
                </Link>
              </div>

              {data.expiringSubscriptions.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  No subscriptions expiring within the next 7 days.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {data.expiringSubscriptions.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#3525CD]">
                            #{sub.memberId}
                          </span>
                          <span className="font-bold text-slate-900">
                            {sub.customerName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {sub.planName}
                        </p>
                      </div>
                      <div className="text-right text-[11px]">
                        <span className="font-bold text-slate-700">
                          Ends {new Date(sub.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Live Activity Stream */}
          <div className="stitch-card p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Recent Ledger Activity
              </h3>
              <Link
                href="/history"
                className="text-xs font-bold text-[#3525CD] hover:underline"
              >
                Full Audit History →
              </Link>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {data.recentActivity.map((act) => (
                <div key={act.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex rounded-lg bg-indigo-50 px-2 py-1 font-extrabold text-[#3525CD]">
                      #{act.memberId}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900">{act.customerName}</span>
                      <span className="ml-2 text-slate-500">
                        served by {act.servedBy}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                      {act.mealType}
                    </span>
                    <span className="text-slate-400">
                      {new Date(act.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
