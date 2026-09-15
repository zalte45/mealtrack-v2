import { prisma } from '../prisma.js';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  planId: z.string().min(1, 'Plan is required'),
  startDate: z.string().optional(),
  paymentStatus: z.enum(['PAID', 'PENDING', 'PARTIAL']).default('PAID'),
});

export async function getSubscriptions(providerId, { status = 'ALL', search = '' } = {}) {
  const where = { providerId };

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

  const subscriptions = await prisma.subscription.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      mealRecords: {
        where: { status: 'VALID' },
        select: { id: true },
      },
    },
  });

  const now = new Date();

  // Evaluate & recalculate derived status and balance
  const result = subscriptions.map((sub) => {
    const validMeals = sub.mealRecords.length;
    const remainingBalance = Math.max(0, sub.quota - validMeals);

    let derivedStatus = sub.status;

    if (sub.status !== 'CANCELLED') {
      if (now < new Date(sub.startDate)) {
        derivedStatus = 'PENDING_START';
      } else if (now > new Date(sub.endDate)) {
        derivedStatus = 'EXPIRED';
      } else if (remainingBalance === 0) {
        derivedStatus = 'EXHAUSTED';
      } else {
        derivedStatus = 'ACTIVE';
      }
    }

    return {
      ...sub,
      validMealsCount: validMeals,
      remainingBalance,
      derivedStatus,
    };
  });

  if (status !== 'ALL') {
    return result.filter((s) => s.derivedStatus === status);
  }

  return result;
}

export async function createSubscription(providerId, data) {
  const validated = createSubscriptionSchema.parse(data);

  // Fetch plan to snapshot terms
  const plan = await prisma.mealPlan.findFirst({
    where: { id: validated.planId, providerId },
  });

  if (!plan) {
    throw new Error('Selected meal plan not found');
  }

  const customer = await prisma.customer.findFirst({
    where: { id: validated.customerId, providerId },
  });

  if (!customer) {
    throw new Error('Selected customer not found');
  }

  const startDate = validated.startDate ? new Date(validated.startDate) : new Date();
  const endDate = new Date(startDate.getTime() + plan.validityDays * 24 * 60 * 60 * 1000);

  const now = new Date();
  let initialStatus = 'ACTIVE';
  if (now < startDate) {
    initialStatus = 'PENDING_START';
  }

  return await prisma.subscription.create({
    data: {
      providerId,
      customerId: customer.id,
      planId: plan.id,
      planName: plan.name,
      quota: plan.quota,
      validityDays: plan.validityDays,
      price: plan.price,
      mealsPerDay: plan.mealsPerDay,
      allowedMealTypes: plan.allowedMealTypes,
      startDate,
      endDate,
      paymentStatus: validated.paymentStatus,
      status: initialStatus,
    },
  });
}

export async function updateSubscriptionStatus(providerId, subscriptionId, { status, paymentStatus }) {
  const data = {};
  if (status) data.status = status;
  if (paymentStatus) data.paymentStatus = paymentStatus;

  return await prisma.subscription.updateMany({
    where: { id: subscriptionId, providerId },
    data,
  });
}
