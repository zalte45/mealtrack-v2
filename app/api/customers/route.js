import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/session';
import { getCustomers, createCustomer } from '@/lib/services/customerService';

export async function GET(request) {
  try {
    const user = await requireAuthUser();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'ACTIVE';
    const page = searchParams.get('page') || 1;
    const limit = searchParams.get('limit') || 50;

    const result = await getCustomers(user.providerId, { search, filter, page, limit });
    return NextResponse.json(result);
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
