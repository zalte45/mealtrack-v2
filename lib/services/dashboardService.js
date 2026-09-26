import { prisma } from '../prisma.js';

export async function getDashboardData(providerId) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    select: { lowBalanceThreshold: true, name: true },
  });
  const lowThreshold = provider?.lowBalanceThreshold ?? 3;

  const { Prisma } = require('@prisma/client');

  const [
    statusCounts,
    activeCustomers,
    activeSubscriptions,
    lowBalanceCustomersRaw,
    expiringSubscriptions,
    recentActivity
  ] = await Promise.all([
    prisma.mealRecord.groupBy({
      by: ['status'],
      where: {
        providerId,
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      _count: { _all: true },
    }),
    prisma.customer.count({
      where: { providerId, isArchived: false },
    }),
    prisma.subscription.count({
      where: { providerId, status: 'ACTIVE' },
    }),
    prisma.$queryRaw`
      SELECT 
        s.id AS "subscriptionId", 
        c."memberId", 
        c.name AS "customerName", 
        c.mobile, 
        s."planName",
        CAST((s.quota - COALESCE((
          SELECT COUNT(*) 
          FROM "MealRecord" m 
          WHERE m."providerId" = ${providerId} AND m."subscriptionId" = s.id AND m.status = 'VALID'
        ), 0)) AS INTEGER) AS "remainingBalance"
      FROM "Subscription" s
      JOIN "Customer" c ON s."customerId" = c.id
      WHERE s."providerId" = ${providerId} 
        AND s.status = 'ACTIVE'
        AND (s.quota - COALESCE((
          SELECT COUNT(*) 
          FROM "MealRecord" m 
          WHERE m."providerId" = ${providerId} AND m."subscriptionId" = s.id AND m.status = 'VALID'
        ), 0)) <= ${lowThreshold}
      ORDER BY "remainingBalance" ASC
    `,
    prisma.subscription.findMany({
      where: {
        providerId,
        status: 'ACTIVE',
        endDate: { gte: now, lte: sevenDaysLater },
      },
      include: { customer: true },
      orderBy: { endDate: 'asc' },
      take: 5,
    }),
    prisma.mealRecord.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        customer: { select: { memberId: true, name: true } },
        servedBy: { select: { name: true } },
      },
    }),
  ]);

  const lowBalanceCustomers = lowBalanceCustomersRaw.map(c => ({
    ...c,
    remainingBalance: Number(c.remainingBalance)
  }));

  const todayValidMeals = statusCounts.find((c) => c.status === 'VALID')?._count._all || 0;
  const todayVoidedMeals = statusCounts.find((c) => c.status === 'VOIDED')?._count._all || 0;

  return {
    kpis: {
      todayValidMeals,
      todayVoidedMeals,
      activeCustomers,
      activeSubscriptions,
    },
    lowBalanceCustomers,
    expiringSubscriptions: expiringSubscriptions.map((s) => ({
      id: s.id,
      memberId: s.customer.memberId,
      customerName: s.customer.name,
      planName: s.planName,
      endDate: s.endDate,
    })),
    recentActivity: recentActivity.map((r) => ({
      id: r.id,
      memberId: r.customer?.memberId,
      customerName: r.customer?.name,
      mealType: r.mealType,
      status: r.status,
      servedBy: r.servedBy?.name || 'Operator',
      createdAt: r.createdAt,
    })),
  };
}
