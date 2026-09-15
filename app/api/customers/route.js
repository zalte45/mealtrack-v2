import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/session';
import { getCustomers, createCustomer } from '@/lib/services/customerService';

export async function GET(request) {
  try {
    const user = await requireAuthUser();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'ACTIVE';

    const customers = await getCustomers(user.providerId, { search, filter });
    return NextResponse.json({ customers });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customers' },
      { status: error.status || 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();

    const customer = await createCustomer(user.providerId, body);
    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to create customer' },
      { status: error.status || 400 }
    );
  }
}
