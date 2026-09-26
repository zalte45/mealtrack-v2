import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/session';
import { getSubscriptions, createSubscription } from '@/lib/services/subscriptionService';

export async function GET(request) {
  try {
    const user = await requireAuthUser();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'ALL';
    const search = searchParams.get('search') || '';
    const page = searchParams.get('page') || 1;
    const limit = searchParams.get('limit') || 50;

    const result = await getSubscriptions(user.providerId, { status, search, page, limit });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscriptions' },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();

    const subscription = await createSubscription(user.providerId, body);
    return NextResponse.json({ subscription }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: error.status || 400 }
    );
  }
}
