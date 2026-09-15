import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/session';
import { getMealHistory } from '@/lib/services/historyService';

export async function GET(request) {
  try {
    const user = await requireAuthUser();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || undefined;
    const customerId = searchParams.get('customerId') || undefined;
    const mealType = searchParams.get('mealType') || 'ALL';
    const status = searchParams.get('status') || 'ALL';
    const search = searchParams.get('search') || '';
    const page = searchParams.get('page') || 1;

    const history = await getMealHistory(user.providerId, {
      date,
      customerId,
      mealType,
      status,
      search,
      page,
    });

    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch history' },
      { status: error.status || 500 }
    );
  }
}
