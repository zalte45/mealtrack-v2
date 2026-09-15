import { prisma } from '../prisma.js';
import { z } from 'zod';

const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export async function generateNextMemberId(providerId) {
  const highest = await prisma.customer.findFirst({
    where: { providerId },
    orderBy: { memberId: 'desc' },
    select: { memberId: true },
  });

  if (!highest || highest.memberId < 1001) {
    return 1001;
  }

  return highest.memberId + 1;
}

export async function createCustomer(providerId, data) {
  const validated = createCustomerSchema.parse(data);

  let attempts = 0;
  let memberId = await generateNextMemberId(providerId);

  while (attempts < 5) {
    try {
      const customer = await prisma.customer.create({
        data: {
          providerId,
          memberId,
          name: validated.name.trim(),
          mobile: validated.mobile.trim(),
          email: validated.email ? validated.email.trim().toLowerCase() : null,
          address: validated.address ? validated.address.trim() : null,
          notes: validated.notes ? validated.notes.trim() : null,
        },
      });
      return customer;
    } catch (error) {
      if (error.code === 'P2002') {
        // Unique constraint failed on providerId_memberId, increment and retry
        memberId += 1;
        attempts += 1;
      } else {
        throw error;
      }
    }
  }

  throw new Error('Failed to generate a unique Member ID due to high concurrency. Please try again.');
}

export async function getCustomers(providerId, { search = '', filter = 'ACTIVE' } = {}) {
  const where = { providerId };

  if (filter === 'ACTIVE') {
    where.isArchived = false;
  } else if (filter === 'ARCHIVED') {
    where.isArchived = true;
  }

  if (search.trim()) {
    const s = search.trim();
    const isNum = /^\d+$/.test(s);

    where.OR = [
      { name: { contains: s, mode: 'insensitive' } },
      { mobile: { contains: s, mode: 'insensitive' } },
    ];

    if (isNum) {
      where.OR.push({ memberId: parseInt(s, 10) });
    }
  }

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { memberId: 'asc' },
    include: {
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          _count: {
            select: { mealRecords: { where: { status: 'VALID' } } },
          },
        },
      },
    },
  });

  // Calculate derived remaining balance for latest subscription
  return customers.map((cust) => {
    const activeSub = cust.subscriptions[0];
    let remainingBalance = null;
    let subStatus = 'NO_SUBSCRIPTION';

    if (activeSub) {
      const validMealsCount = activeSub._count.mealRecords;
      remainingBalance = Math.max(0, activeSub.quota - validMealsCount);
      subStatus = activeSub.status;
    }

    return {
      ...cust,
      activeSubStatus: subStatus,
      remainingBalance,
      latestSubscription: activeSub
        ? {
            id: activeSub.id,
            planName: activeSub.planName,
            status: activeSub.status,
            quota: activeSub.quota,
            remainingBalance,
            endDate: activeSub.endDate,
          }
        : null,
    };
  });
}

export async function getCustomerById(providerId, customerId) {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, providerId },
    include: {
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { mealRecords: { where: { status: 'VALID' } } },
          },
          mealRecords: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      },
      mealRecords: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!customer) return null;

  const subscriptionsWithBalance = customer.subscriptions.map((sub) => {
    const validMeals = sub._count.mealRecords;
    return {
      ...sub,
      validMealsCount: validMeals,
      remainingBalance: Math.max(0, sub.quota - validMeals),
    };
  });

  return {
    ...customer,
    subscriptions: subscriptionsWithBalance,
  };
}

export async function updateCustomer(providerId, customerId, data) {
  const validated = createCustomerSchema.parse(data);

  return await prisma.customer.updateMany({
    where: { id: customerId, providerId },
    data: {
      name: validated.name.trim(),
      mobile: validated.mobile.trim(),
      email: validated.email ? validated.email.trim().toLowerCase() : null,
      address: validated.address ? validated.address.trim() : null,
      notes: validated.notes ? validated.notes.trim() : null,
    },
  });
}

export async function toggleArchiveCustomer(providerId, customerId, isArchived) {
  return await prisma.customer.updateMany({
    where: { id: customerId, providerId },
    data: { isArchived },
  });
}
