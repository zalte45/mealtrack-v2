import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/session';
import { getCustomerById, updateCustomer, toggleArchiveCustomer } from '@/lib/services/customerService';

export async function GET(request, { params }) {
  try {
    const user = await requireAuthUser();
    const customer = await getCustomerById(user.providerId, params.id);

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch customer details' },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await requireAuthUser();
    const body = await request.json();

    await updateCustomer(user.providerId, params.id, body);
    return NextResponse.json({ success: true, message: 'Customer updated successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to update customer' },
      { status: error.status || 400 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await requireAuthUser();
    const { isArchived } = await request.json();

    await toggleArchiveCustomer(user.providerId, params.id, Boolean(isArchived));
    return NextResponse.json({
      success: true,
      message: `Customer ${isArchived ? 'archived' : 'restored'} successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to update archive status' },
      { status: error.status || 400 }
    );
  }
}
