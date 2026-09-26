import { BarChart3, PieChart } from 'lucide-react';
import ReportsToolbar from '@/components/reports/ReportsToolbar';
import { getAuthSession } from '@/lib/session';
import { getOperationalReport } from '@/lib/services/reportService';

export default async function ReportsPage({ searchParams }) {
  const session = await getAuthSession();
  const startDate = searchParams?.startDate || '';
  const endDate = searchParams?.endDate || '';

  const reportData = await getOperationalReport(session.user.providerId, { startDate, endDate });

  return (
    <div className="space-y-6">
      <ReportsToolbar initialStartDate={startDate} initialEndDate={endDate} />

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
    </div>
  );
}
