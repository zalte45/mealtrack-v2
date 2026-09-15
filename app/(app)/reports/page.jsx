'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Calendar,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  PieChart,
} from 'lucide-react';

export default function ReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      }).toString();

      const res = await fetch(`/api/reports?${query}`);
      const data = await res.json();

      if (res.ok) {
        setReportData(data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Operational Reports & Analytics
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Ledger-derived meal service metrics, shift breakdowns & CSV data exports
          </p>
        </div>
        <a
          href={`/api/reports/export?startDate=${startDate}&endDate=${endDate}`}
          download
          className="flex items-center justify-center gap-2 rounded-xl bg-[#3525CD] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-[#2A1DB5]"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Download CSV Report</span>
        </a>
      </div>

      {/* Date Range Picker Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Calendar className="h-4 w-4 text-[#3525CD]" />
            <span>Date Range:</span>
          </div>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
          />

          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-[#3525CD]" />
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="stitch-card p-5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Total Valid Meals Served
              </span>
              <p className="mt-1 text-3xl font-black text-[#3525CD]">
                {reportData.summary.totalValidMeals}
              </p>
            </div>

            <div className="stitch-card p-5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
                Voided Transactions
              </span>
              <p className="mt-1 text-3xl font-black text-amber-600">
                {reportData.summary.totalVoidedMeals}
              </p>
            </div>

            <div className="stitch-card p-5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Active Subscriptions
              </span>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {reportData.summary.activeSubscriptions}
              </p>
            </div>

            <div className="stitch-card p-5">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Active Customer Base
              </span>
              <p className="mt-1 text-3xl font-black text-slate-900">
                {reportData.summary.activeCustomers}
              </p>
            </div>
          </div>

          {/* Shift Breakdown & Plan Distribution Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Shift Breakdown */}
            <div className="stitch-card p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <BarChart3 className="h-5 w-5 text-[#3525CD]" />
                <h3 className="text-base font-bold text-slate-900">
                  Meal Shift Breakdown
                </h3>
              </div>

              <div className="space-y-3">
                {Object.entries(reportData.breakdown).map(([shift, count]) => {
                  const maxCount = Math.max(1, reportData.summary.totalValidMeals);
                  const pct = Math.round((count / maxCount) * 100);

                  return (
                    <div key={shift} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{shift}</span>
                        <span>{count} meals ({pct}%)</span>
                      </div>
                      <div className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full bg-[#3525CD] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Plan Popularity Distribution */}
            <div className="stitch-card p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <PieChart className="h-5 w-5 text-[#3525CD]" />
                <h3 className="text-base font-bold text-slate-900">
                  Plan Usage Distribution
                </h3>
              </div>

              {Object.keys(reportData.planCounts).length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  No plan data recorded for selected period.
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(reportData.planCounts).map(([planName, count]) => (
                    <div
                      key={planName}
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs"
                    >
                      <span className="font-bold text-slate-800">{planName}</span>
                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1 font-extrabold text-[#3525CD]">
                        {count} meals served
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
