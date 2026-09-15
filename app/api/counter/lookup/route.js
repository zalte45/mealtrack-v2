import { NextResponse } from 'next/server';
import { requireAuthUser } from '@/lib/session';
import { lookupMemberByNumber } from '@/lib/services/counterService';

export async function GET(request) {
  try {
    const user = await requireAuthUser();
    const { searchParams } = new URL(request.url);
    const memberIdStr = searchParams.get('memberId');

    if (!memberIdStr || !/^\d{4}$/.test(memberIdStr.trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid 4-digit Member ID (e.g. 1001).' },
        { status: 400 }
      );
    }

    const memberIdNum = parseInt(memberIdStr.trim(), 10);
    const result = await lookupMemberByNumber(user.providerId, memberIdNum);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Lookup failed' },
      { status: error.status || 500 }
    );
  }
}
