import { prisma } from '../prisma.js';

export async function getDashboardData(providerId) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    provider,
    statusCounts,
    activeCustomers,
    activeSubscriptions,
    activeSubs,
    expiringSubscriptions,
    recentActivity
  ] = await Promise.all([
    prisma.provider.findUnique({
      where: { id: providerId },
      select: { lowBalanceThreshold: true, name: true },
    }),
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
    prisma.subscription.findMany({
      where: { providerId, status: 'ACTIVE' },
      select: {
        id: true,
        quota: true,
        planName: true,
        customer: { select: { memberId: true, name: true, mobile: true } },
        _count: { select: { mealRecords: { where: { status: 'VALID' } } } },
      },
    }),
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

  const lowThreshold = provider?.lowBalanceThreshold ?? 3;

  const lowBalanceCustomers = activeSubs
    .map((sub) => {
      const remaining = Math.max(0, sub.quota - sub._count.mealRecords);
      return {
        subscriptionId: sub.id,
        memberId: sub.customer.memberId,
        customerName: sub.customer.name,
        mobile: sub.customer.mobile,
        planName: sub.planName,
        remainingBalance: remaining,
      };
    })
    .filter((c) => c.remainingBalance <= lowThreshold)
    .sort((a, b) => a.remainingBalance - b.remainingBalance);

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
