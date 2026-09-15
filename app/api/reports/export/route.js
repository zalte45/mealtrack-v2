import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/session';
import { getOperationalReport, generateCSVReport } from '@/lib/services/reportService';

export async function GET(request) {
  try {
    const user = await requireAuthUser();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const report = await getOperationalReport(user.providerId, { startDate, endDate });
    const csvContent = generateCSVReport(report.mealRecords);

    const filename = `MealTrack_Ledger_Export_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to export CSV report' },
      { status: error.status || 500 }
    );
  }
}
