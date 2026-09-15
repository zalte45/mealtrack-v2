import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MealTrack V2 database...');

  // 1. Create Default Provider
  const provider = await prisma.provider.upsert({
    where: { id: 'prov_demo_1001' },
    update: {},
    create: {
      id: 'prov_demo_1001',
      name: 'Anand Meals & Mess Services',
      email: 'contact@anandmeals.com',
      phone: '+91 98765 43210',
      address: '102 Main Street, Tech Park, Pune 411057',
      lowBalanceThreshold: 3,
      chimeEnabled: true,
    },
  });

  console.log('Provider created:', provider.name);

  // 2. Create Users (Owner & Staff)
  const passwordHash = await bcrypt.hash('password123', 10);

  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@mealtrack.com' },
    update: { passwordHash },
    create: {
      providerId: provider.id,
      email: 'owner@mealtrack.com',
      passwordHash,
      name: 'Anand Gunvant Zalte',
      role: 'OWNER',
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@mealtrack.com' },
    update: { passwordHash },
    create: {
      providerId: provider.id,
      email: 'staff@mealtrack.com',
      passwordHash,
      name: 'Rahul Sharma (Staff)',
      role: 'STAFF',
    },
  });

  console.log('Users seeded:', ownerUser.email, staffUser.email);

  // 3. Create Sample Meal Plans
  const deluxePlan = await prisma.mealPlan.create({
    data: {
      providerId: provider.id,
      name: 'Monthly Deluxe Plan',
      description: 'Full lunch & dinner coverage for 30 days',
      quota: 60,
      validityDays: 30,
      price: 3500.0,
      mealsPerDay: 2,
      allowedMealTypes: ['BREAKFAST', 'LUNCH', 'DINNER'],
      isActive: true,
    },
  });

  const standardPlan = await prisma.mealPlan.create({
    data: {
      providerId: provider.id,
      name: 'Standard Lunch Plan',
      description: 'Single lunch meal daily for 30 days',
      quota: 30,
      validityDays: 30,
      price: 2000.0,
      mealsPerDay: 1,
      allowedMealTypes: ['LUNCH'],
      isActive: true,
    },
  });

  const trialPlan = await prisma.mealPlan.create({
    data: {
      providerId: provider.id,
      name: '10-Meal Trial Pack',
      description: 'Flexible 10 meal pass valid for 15 days',
      quota: 10,
      validityDays: 15,
      price: 850.0,
      mealsPerDay: 2,
      allowedMealTypes: ['BREAKFAST', 'LUNCH', 'DINNER'],
      isActive: true,
    },
  });

  console.log('Meal Plans created:', deluxePlan.name, standardPlan.name, trialPlan.name);

  // 4. Create Sample Customers (Member IDs 1001, 1002, 1003, 1004)
  const cust1 = await prisma.customer.upsert({
    where: { providerId_memberId: { providerId: provider.id, memberId: 1001 } },
    update: {},
    create: {
      providerId: provider.id,
      memberId: 1001,
      name: 'Rahul Sharma',
      mobile: '9876543210',
      email: 'rahul.sharma@example.com',
      notes: 'Prefers extra rice, vegetarian',
    },
  });

  const cust2 = await prisma.customer.upsert({
    where: { providerId_memberId: { providerId: provider.id, memberId: 1002 } },
    update: {},
    create: {
      providerId: provider.id,
      memberId: 1002,
      name: 'Priya Patel',
      mobile: '9876543211',
      email: 'priya.patel@example.com',
      notes: 'No spicy food',
    },
  });

  const cust3 = await prisma.customer.upsert({
    where: { providerId_memberId: { providerId: provider.id, memberId: 1003 } },
    update: {},
    create: {
      providerId: provider.id,
      memberId: 1003,
      name: 'Amit Kumar',
      mobile: '9876543212',
      email: 'amit.k@example.com',
      notes: 'Low balance demo customer',
    },
  });

  const cust4 = await prisma.customer.upsert({
    where: { providerId_memberId: { providerId: provider.id, memberId: 1004 } },
    update: {},
    create: {
      providerId: provider.id,
      memberId: 1004,
      name: 'Sneha Gupta',
      mobile: '9876543213',
      email: 'sneha.g@example.com',
      notes: 'VIP customer',
    },
  });

  console.log('Customers created with Member IDs 1001..1004');

  // 5. Create Subscriptions for Customers
  const now = new Date();
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
  const fifteenDaysLater = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

  const sub1 = await prisma.subscription.create({
    data: {
      providerId: provider.id,
      customerId: cust1.id,
      planId: deluxePlan.id,
      planName: deluxePlan.name,
      quota: deluxePlan.quota,
      validityDays: deluxePlan.validityDays,
      price: deluxePlan.price,
      mealsPerDay: deluxePlan.mealsPerDay,
      allowedMealTypes: deluxePlan.allowedMealTypes,
      startDate: now,
      endDate: thirtyDaysLater,
      paymentStatus: 'PAID',
      status: 'ACTIVE',
    },
  });

  const sub2 = await prisma.subscription.create({
    data: {
      providerId: provider.id,
      customerId: cust2.id,
      planId: standardPlan.id,
      planName: standardPlan.name,
      quota: standardPlan.quota,
      validityDays: standardPlan.validityDays,
      price: standardPlan.price,
      mealsPerDay: standardPlan.mealsPerDay,
      allowedMealTypes: standardPlan.allowedMealTypes,
      startDate: now,
      endDate: thirtyDaysLater,
      paymentStatus: 'PAID',
      status: 'ACTIVE',
    },
  });

  // Low balance demo subscription for Amit Kumar (quota 10, start date 15 days ago)
  const sub3 = await prisma.subscription.create({
    data: {
      providerId: provider.id,
      customerId: cust3.id,
      planId: trialPlan.id,
      planName: trialPlan.name,
      quota: 10,
      validityDays: 15,
      price: trialPlan.price,
      mealsPerDay: 2,
      allowedMealTypes: trialPlan.allowedMealTypes,
      startDate: fifteenDaysAgo,
      endDate: fifteenDaysLater,
      paymentStatus: 'PAID',
      status: 'ACTIVE',
    },
  });

  console.log('Subscriptions created for Rahul, Priya, Amit');

  // 6. Create Initial Meal Records for History
  // Sub 1: 5 valid meals
  for (let i = 0; i < 5; i++) {
    await prisma.mealRecord.create({
      data: {
        providerId: provider.id,
        customerId: cust1.id,
        subscriptionId: sub1.id,
        servedById: ownerUser.id,
        mealType: i % 2 === 0 ? 'LUNCH' : 'DINNER',
        status: 'VALID',
        createdAt: new Date(now.getTime() - i * 3600 * 1000 * 4),
      },
    });
  }

  // Sub 3 (Low balance demo): 8 valid meals created so remaining balance is 2 (below threshold 3)
  for (let i = 0; i < 8; i++) {
    await prisma.mealRecord.create({
      data: {
        providerId: provider.id,
        customerId: cust3.id,
        subscriptionId: sub3.id,
        servedById: staffUser.id,
        mealType: i % 2 === 0 ? 'LUNCH' : 'DINNER',
        status: 'VALID',
        createdAt: new Date(now.getTime() - i * 3600 * 1000 * 6),
      },
    });
  }

  // 1 Voided meal record for audit testing
  await prisma.mealRecord.create({
    data: {
      providerId: provider.id,
      customerId: cust1.id,
      subscriptionId: sub1.id,
      servedById: ownerUser.id,
      mealType: 'BREAKFAST',
      status: 'VOIDED',
      voidedAt: now,
      voidedById: ownerUser.id,
      voidReason: 'Accidental double tap by operator',
      createdAt: new Date(now.getTime() - 2 * 3600 * 1000),
    },
  });

  // Audit Logs
  await prisma.auditLog.create({
    data: {
      providerId: provider.id,
      userId: ownerUser.id,
      action: 'SYSTEM_BOOTSTRAP',
      details: 'Initial database seeding completed successfully.',
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
