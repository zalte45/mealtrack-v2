import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/session';
import { updateSubscriptionStatus } from '@/lib/services/subscriptionService';

export async function PATCH(request, { params }) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();

    await updateSubscriptionStatus(user.providerId, params.id, body);
    return NextResponse.json({ success: true, message: 'Subscription updated successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to update subscription' },
      { status: error.status || 400 }
    );
  }
}
