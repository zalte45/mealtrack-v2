'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  History,
  Search,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  User,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import VoidModal from '@/components/history/VoidModal';

export default function MealHistoryPage() {
  const [historyData, setHistoryData] = useState({ summary: {}, mealRecords: [] });
  const [date, setDate] = useState('');
  const [mealType, setMealType] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Void modal state
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [selectedRecordToVoid, setSelectedRecordToVoid] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ...(date && { date }),
        ...(mealType !== 'ALL' && { mealType }),
        ...(status !== 'ALL' && { status }),
        ...(search && { search }),
        page,
      }).toString();

      const res = await fetch(`/api/history?${query}`);
      const data = await res.json();

      if (res.ok) {
        setHistoryData(data);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }, [date, mealType, status, search, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchHistory]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Meal History & Ledger Audit
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Authoritative meal register, timestamped transaction audit trail & correction log
          </p>
        </div>
        <a
          href="/api/reports/export"
          download
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          <span>Export Ledger CSV</span>
        </a>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="stitch-card p-5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Total Logged Transactions
          </span>
          <p className="mt-1 text-3xl font-black text-slate-900">
            {historyData.summary?.totalRecords || 0}
          </p>
        </div>

        <div className="stitch-card p-5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
            Valid Served Meals
          </span>
          <p className="mt-1 text-3xl font-black text-emerald-600">
            {historyData.summary?.validCount || 0}
          </p>
        </div>

        <div className="stitch-card p-5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
            Voided / Corrected Meals
          </span>
          <p className="mt-1 text-3xl font-black text-amber-600">
            {historyData.summary?.voidedCount || 0}
          </p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by 4-digit ID or name..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-[#3525CD] focus:bg-white focus:outline-none"
            />
          </div>

          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Meal Type Filter */}
          <select
            value={mealType}
            onChange={(e) => { setMealType(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
          >
            <option value="ALL">All Meal Types</option>
            <option value="BREAKFAST">Breakfast</option>
            <option value="LUNCH">Lunch</option>
            <option value="DINNER">Dinner</option>
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="VALID">Valid Only</option>
            <option value="VOIDED">Voided Only</option>
          </select>
        </div>
      </div>

      {/* Ledger Audit Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-[#3525CD]" />
        </div>
      ) : historyData.mealRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <History className="h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm font-bold text-slate-700">No Meal Records Found</p>
          <p className="text-xs text-slate-500">No transaction matches your selected date and status filters.</p>
        </div>
      ) : (
        <div className="stitch-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Member ID</th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Plan Name</th>
                  <th className="px-4 py-3">Meal Type</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Served By</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {historyData.mealRecords.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-lg bg-indigo-50 px-2 py-0.5 font-extrabold text-[#3525CD]">
                        #{m.customer?.memberId}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {m.customer?.name}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-600">
                      {m.subscription?.planName || 'Standard'}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      {m.mealType}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {m.servedBy?.name || 'Operator'}
                    </td>
                    <td className="px-4 py-3">
                      {m.status === 'VALID' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 font-bold text-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          VALID
                        </span>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 font-bold text-amber-800">
                            <AlertTriangle className="h-3 w-3" />
                            VOIDED
                          </span>
                          {m.voidReason && (
                            <p className="text-[10px] text-slate-400 italic">
                              &quot;{m.voidReason}&quot;
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {m.status === 'VALID' && (
                        <button
                          onClick={() => {
                            setSelectedRecordToVoid(m);
                            setIsVoidModalOpen(true);
                          }}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                        >
                          Void Record
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {historyData.summary?.totalRecords > 100 && (
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
              <span>
                Showing {((page - 1) * 100) + 1} to {Math.min(page * 100, historyData.summary.totalRecords)} of {historyData.summary.totalRecords} records
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
                >
                  Previous
                </button>
                <button
                  disabled={page * 100 >= historyData.summary.totalRecords}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Void Modal */}
      <VoidModal
        isOpen={isVoidModalOpen}
        onClose={() => setIsVoidModalOpen(false)}
        onSuccess={fetchHistory}
        mealRecord={selectedRecordToVoid}
      />
    </div>
  );
}
