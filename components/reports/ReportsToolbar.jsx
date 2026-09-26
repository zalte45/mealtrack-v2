'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, FileSpreadsheet } from 'lucide-react';

export default function ReportsToolbar({ initialStartDate, initialEndDate }) {
  const router = useRouter();
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');

  const handleApply = (start, end) => {
    const params = new URLSearchParams();
    if (start) params.set('startDate', start);
    if (end) params.set('endDate', end);
    router.push(`/reports?${params.toString()}`);
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    router.push('/reports');
  };

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
            onChange={(e) => {
              setStartDate(e.target.value);
              handleApply(e.target.value, endDate);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              handleApply(startDate, e.target.value);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
          />

          {(startDate || endDate) && (
            <button
              onClick={clearFilter}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
