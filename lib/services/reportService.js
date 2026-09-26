import { prisma } from '../prisma.js';

export async function getOperationalReport(providerId, { startDate, endDate, includeRecords = false } = {}) {
  const where = { providerId };

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const { Prisma } = require('@prisma/client');

  const [statusCounts, activeSubscriptions, activeCustomers, breakdownRaw, planCountsRaw] = await Promise.all([
    prisma.mealRecord.groupBy({
      by: ['status'],
      where,
      _count: { _all: true },
    }),
    prisma.subscription.count({
      where: { providerId, status: 'ACTIVE' },
    }),
    prisma.customer.count({
      where: { providerId, isArchived: false },
    }),
    prisma.mealRecord.groupBy({
      by: ['mealType'],
      where: { ...where, status: 'VALID' },
      _count: { _all: true },
    }),
    prisma.$queryRaw`
      SELECT s."planName", CAST(COUNT(m.id) AS INTEGER) as "count"
      FROM "MealRecord" m
      JOIN "Subscription" s ON m."subscriptionId" = s.id
      WHERE m."providerId" = ${providerId} AND m.status = 'VALID'
      ${startDate && endDate ? Prisma.sql`AND m."createdAt" >= ${new Date(startDate)} AND m."createdAt" <= ${new Date(endDate)}` : Prisma.empty}
      GROUP BY s."planName"
    `,
  ]);

  const validMealsCount = statusCounts.find((c) => c.status === 'VALID')?._count._all || 0;
  const voidedMealsCount = statusCounts.find((c) => c.status === 'VOIDED')?._count._all || 0;

  const breakdown = {
    BREAKFAST: 0,
    LUNCH: 0,
    DINNER: 0,
    OTHER: 0,
  };
  breakdownRaw.forEach(b => {
    const t = b.mealType;
    if (breakdown[t] !== undefined) breakdown[t] = b._count._all;
    else breakdown.OTHER += b._count._all;
  });

  const planCounts = {};
  planCountsRaw.forEach(p => {
    planCounts[p.planName || 'Standard'] = Number(p.count);
  });

  let mealRecords = [];
  if (includeRecords) {
    mealRecords = await prisma.mealRecord.findMany({
      where,
      select: {
        id: true,
        createdAt: true,
        mealType: true,
        status: true,
        voidReason: true,
        customer: { select: { memberId: true, name: true, mobile: true } },
        subscription: { select: { planName: true } },
        servedBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  return {
    summary: {
      totalValidMeals: validMealsCount,
      totalVoidedMeals: voidedMealsCount,
      activeSubscriptions,
      activeCustomers,
    },
    breakdown,
    planCounts,
    mealRecords,
  };
}

export function generateCSVReport(mealRecords) {
  // RFC 4180 compatible CSV formatter
  const headers = [
    'Record ID',
    'Date & Time',
    'Member ID',
    'Customer Name',
    'Mobile',
    'Plan Name',
    'Meal Type',
    'Status',
    'Served By',
    'Void Reason',
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = mealRecords.map((m) => [
    escapeCSV(m.id),
    escapeCSV(new Date(m.createdAt).toISOString()),
    escapeCSV(m.customer?.memberId || ''),
    escapeCSV(m.customer?.name || ''),
    escapeCSV(m.customer?.mobile || ''),
    escapeCSV(m.subscription?.planName || ''),
    escapeCSV(m.mealType),
    escapeCSV(m.status),
    escapeCSV(m.servedBy?.name || 'Operator'),
    escapeCSV(m.voidReason || ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}
