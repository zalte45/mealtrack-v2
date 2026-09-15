import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/session';
import { getDashboardData } from '@/lib/services/dashboardService';

export async function GET(request) {
  try {
    const user = await requireAuthUser();
    const data = await getDashboardData(user.providerId);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dashboard data' },
      { status: error.status || 500 }
    );
  }
}
