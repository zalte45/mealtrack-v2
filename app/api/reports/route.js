import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/session';
import { getOperationalReport } from '@/lib/services/reportService';

export async function GET(request) {
  try {
    const user = await requireAuthUser();
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const report = await getOperationalReport(user.providerId, { startDate, endDate });
    const { mealRecords, ...reportData } = report;
    return NextResponse.json(reportData);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch report' },
      { status: error.status || 500 }
    );
  }
}
