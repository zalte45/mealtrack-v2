import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/session';
import { voidMealRecord } from '@/lib/services/historyService';

export async function POST(request) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();

    const result = await voidMealRecord(user.providerId, user.id, body);
    return NextResponse.json({ success: true, mealRecord: result });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to void meal record' },
      { status: 400 }
    );
  }
}
