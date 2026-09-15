import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/session';
import { getPlans, createPlan } from '@/lib/services/planService';

export async function GET(request) {
  try {
    const user = await requireAuthUser();
    const plans = await getPlans(user.providerId);
    return NextResponse.json({ plans });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch plans' },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();

    const plan = await createPlan(user.providerId, body);
    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to create plan' },
      { status: error.status || 400 }
    );
  }
}
