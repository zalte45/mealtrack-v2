import { prisma } from '../prisma.js';
import { z } from 'zod';

const recordMealSchema = z.object({
  customerId: z.string().min(1),
  subscriptionId: z.string().min(1),
  mealType: z.string().default('LUNCH'),
  idempotencyKey: z.string().optional(),
  notes: z.string().optional(),
});

export async function lookupMemberByNumber(providerId, memberIdNum) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const customer = await prisma.customer.findUnique({
    where: {
      providerId_memberId: {
        providerId,
        memberId: memberIdNum,
      },
    },
    include: {
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { mealRecords: { where: { status: 'VALID' } } },
          },
          mealRecords: {
            where: { 
              status: 'VALID',
              createdAt: { gte: todayStart, lte: todayEnd } 
            },
            select: { id: true }
          },
        },
      },
    },
  });

  if (!customer) {
    return {
      success: false,
      errorType: 'NOT_FOUND',
      message: `No customer found with Member ID #${memberIdNum}`,
    };
  }

  if (customer.isArchived) {
    return {
      success: false,
      errorType: 'CUSTOMER_ARCHIVED',
      message: `Customer #${memberIdNum} (${customer.name}) is archived.`,
      customer,
    };
  }

  let activeSub = null;
  let eligibilityError = null;

  for (const sub of customer.subscriptions) {
    if (sub.status === 'CANCELLED') continue;

    const validMeals = sub._count.mealRecords;
    const remaining = Math.max(0, sub.quota - validMeals);

    if (now < new Date(sub.startDate)) {
      eligibilityError = `Subscription "${sub.planName}" is pending start (${new Date(sub.startDate).toLocaleDateString()}).`;
      continue;
    }

    if (now > new Date(sub.endDate)) {
      eligibilityError = `Subscription "${sub.planName}" expired on ${new Date(sub.endDate).toLocaleDateString()}.`;
      continue;
    }

    if (remaining <= 0) {
      eligibilityError = `Subscription "${sub.planName}" has 0 meals remaining (Exhausted).`;
      continue;
    }

    // Found active eligible subscription!
    activeSub = {
      ...sub,
      validMealsCount: validMeals,
      remainingBalance: remaining,
    };
    break;
  }

  if (!activeSub) {
    return {
      success: false,
      errorType: 'NO_ELIGIBLE_SUBSCRIPTION',
      message: eligibilityError || `Customer #${memberIdNum} has no active subscription.`,
      customer: {
        id: customer.id,
        memberId: customer.memberId,
        name: customer.name,
        mobile: customer.mobile,
      },
    };
  }

  // Check today's meals for this customer
  const todayMealsCount = activeSub.mealRecords.length;

  const canRecordToday = todayMealsCount < activeSub.mealsPerDay;

  return {
    success: true,
    customer: {
      id: customer.id,
      memberId: customer.memberId,
      name: customer.name,
      mobile: customer.mobile,
      notes: customer.notes,
    },
    subscription: {
      id: activeSub.id,
      planName: activeSub.planName,
      quota: activeSub.quota,
      validMealsCount: activeSub.validMealsCount,
      remainingBalance: activeSub.remainingBalance,
      mealsPerDay: activeSub.mealsPerDay,
      allowedMealTypes: activeSub.allowedMealTypes,
      endDate: activeSub.endDate,
      todayMealsCount,
      canRecordToday,
    },
  };
}

export async function recordMealTransaction(providerId, userId, data) {
  const validated = recordMealSchema.parse(data);

  // Use Prisma transaction for concurrency safety & idempotency
  return await prisma.$transaction(async (tx) => {
    // Check idempotency key
    if (validated.idempotencyKey) {
      const existing = await tx.mealRecord.findUnique({
        where: { idempotencyKey: validated.idempotencyKey },
      });
      if (existing) {
        // Return existing record gracefully without double-charging
        return {
          duplicate: true,
          mealRecord: existing,
        };
      }
    }

    // Verify subscription belongs to provider and is active
    const subscription = await tx.subscription.findFirst({
      where: { id: validated.subscriptionId, providerId },
      include: {
        customer: true,
        _count: {
          select: { mealRecords: { where: { status: 'VALID' } } },
        },
      },
    });

    if (!subscription) {
      throw new Error('Subscription not found or tenant mismatch.');
    }

    const validCount = subscription._count.mealRecords;
    const remaining = subscription.quota - validCount;

    if (remaining <= 0) {
      throw new Error('Subscription quota exhausted. No meals remaining.');
    }

    const now = new Date();
    if (now > new Date(subscription.endDate)) {
      throw new Error('Subscription expired.');
    }

    // Create authoritative VALID meal record
    const mealRecord = await tx.mealRecord.create({
      data: {
        providerId,
        customerId: subscription.customerId,
        subscriptionId: subscription.id,
        servedById: userId,
        mealType: validated.mealType || 'LUNCH',
        status: 'VALID',
        idempotencyKey: validated.idempotencyKey || null,
        notes: validated.notes || null,
      },
    });

    const newRemaining = remaining - 1;

    // Update subscription status if exhausted
    if (newRemaining === 0) {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: { status: 'EXHAUSTED' },
      });
    }

    return {
      duplicate: false,
      mealRecord,
      customer: subscription.customer,
      remainingBalance: newRemaining,
    };
  });
}
