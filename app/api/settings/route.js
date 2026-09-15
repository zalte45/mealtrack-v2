import { NextResponse } from 'next/server';
import { requireAuthUser, requireOwnerRole } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const user = await requireAuthUser();
    const provider = await prisma.provider.findUnique({
      where: { id: user.providerId },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true, createdAt: true },
        },
      },
    });

    return NextResponse.json({ provider });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settings' },
      { status: error.status || 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await requireOwnerRole(); // Only OWNER/ADMIN can modify provider settings
    const { name, phone, address, lowBalanceThreshold, chimeEnabled } = await request.json();

    const provider = await prisma.provider.update({
      where: { id: user.providerId },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(address && { address: address.trim() }),
        ...(lowBalanceThreshold !== undefined && { lowBalanceThreshold: parseInt(lowBalanceThreshold, 10) }),
        ...(chimeEnabled !== undefined && { chimeEnabled: Boolean(chimeEnabled) }),
      },
    });

    return NextResponse.json({ success: true, provider });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: error.status || 400 }
    );
  }
}
