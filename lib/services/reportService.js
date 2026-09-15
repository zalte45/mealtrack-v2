import { prisma } from '../prisma.js';

export async function getOperationalReport(providerId, { startDate, endDate } = {}) {
  const where = { providerId };

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const [mealRecords, activeSubscriptions, activeCustomers] = await Promise.all([
    prisma.mealRecord.findMany({
      where,
      include: {
        customer: true,
        subscription: true,
        servedBy: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subscription.count({
      where: { providerId, status: 'ACTIVE' },
    }),
    prisma.customer.count({
      where: { providerId, isArchived: false },
    }),
  ]);

  const validMeals = mealRecords.filter((m) => m.status === 'VALID');
  const voidedMeals = mealRecords.filter((m) => m.status === 'VOIDED');

  // Breakdown by Meal Type
  const breakdown = {
    BREAKFAST: validMeals.filter((m) => m.mealType === 'BREAKFAST').length,
    LUNCH: validMeals.filter((m) => m.mealType === 'LUNCH').length,
    DINNER: validMeals.filter((m) => m.mealType === 'DINNER').length,
    OTHER: validMeals.filter((m) => !['BREAKFAST', 'LUNCH', 'DINNER'].includes(m.mealType)).length,
  };

  // Plan popularity breakdown
  const planCounts = {};
  validMeals.forEach((m) => {
    const planName = m.subscription?.planName || 'Standard';
    planCounts[planName] = (planCounts[planName] || 0) + 1;
  });

  return {
    summary: {
      totalValidMeals: validMeals.length,
      totalVoidedMeals: voidedMeals.length,
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
