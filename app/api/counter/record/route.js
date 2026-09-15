import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/session';
import { recordMealTransaction } from '@/lib/services/counterService';

export async function POST(request) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();

    const result = await recordMealTransaction(user.providerId, user.id, body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to record meal' },
      { status: 400 }
    );
  }
}
