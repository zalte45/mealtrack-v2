import { prisma } from '../prisma.js';
import { z } from 'zod';

const voidMealSchema = z.object({
  mealRecordId: z.string().min(1),
  voidReason: z.string().min(3, 'Void reason must be at least 3 characters'),
});

export async function getMealHistory(
  providerId,
  { date, customerId, mealType = 'ALL', status = 'ALL', search = '' } = {}
) {
  const where = { providerId };

  if (date) {
    const targetDate = new Date(date);
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
    const dayEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59);
    where.createdAt = { gte: dayStart, lte: dayEnd };
  }

  if (customerId) {
    where.customerId = customerId;
  }

  if (mealType !== 'ALL') {
    where.mealType = mealType;
  }

  if (status !== 'ALL') {
    where.status = status;
  }

  if (search.trim()) {
    const s = search.trim();
    const isNum = /^\d+$/.test(s);

    where.customer = {
      OR: [
        { name: { contains: s, mode: 'insensitive' } },
        { mobile: { contains: s, mode: 'insensitive' } },
      ],
    };

    if (isNum) {
      where.customer.OR.push({ memberId: parseInt(s, 10) });
    }
  }

  const mealRecords = await prisma.mealRecord.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      subscription: true,
      servedBy: { select: { name: true, email: true } },
    },
  });

  const totalRecords = mealRecords.length;
  const validCount = mealRecords.filter((m) => m.status === 'VALID').length;
  const voidedCount = mealRecords.filter((m) => m.status === 'VOIDED').length;

  return {
    summary: {
      totalRecords,
      validCount,
      voidedCount,
    },
    mealRecords,
  };
}

export async function voidMealRecord(providerId, userId, data) {
  const validated = voidMealSchema.parse(data);

  return await prisma.$transaction(async (tx) => {
    const meal = await tx.mealRecord.findFirst({
      where: { id: validated.mealRecordId, providerId },
      include: { subscription: true },
    });

    if (!meal) {
      throw new Error('Meal record not found or tenant mismatch.');
    }

    if (meal.status === 'VOIDED') {
      throw new Error('Meal record is already voided.');
    }

    // Update status to VOIDED with reason and audit timestamp
    const updatedRecord = await tx.mealRecord.update({
      where: { id: meal.id },
      data: {
        status: 'VOIDED',
        voidedAt: new Date(),
        voidedById: userId,
        voidReason: validated.voidReason.trim(),
      },
    });

    // If subscription was marked EXHAUSTED, restore to ACTIVE since balance increased by 1
    if (meal.subscription.status === 'EXHAUSTED') {
      await tx.subscription.update({
        where: { id: meal.subscriptionId },
        data: { status: 'ACTIVE' },
      });
    }

    // Create Audit Log entry
    await tx.auditLog.create({
      data: {
        providerId,
        userId,
        action: 'MEAL_VOIDED',
        details: `Meal record ${meal.id} voided for customer #${meal.customerId}. Reason: ${validated.voidReason}`,
      },
    });

    return updatedRecord;
  });
}
