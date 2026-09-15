import { prisma } from '../prisma.js';
import { z } from 'zod';

const planSchema = z.object({
  name: z.string().min(2, 'Plan name is required'),
  description: z.string().optional().or(z.literal('')),
  quota: z.number().int().positive('Quota must be a positive number'),
  validityDays: z.number().int().positive('Validity days must be positive'),
  price: z.number().nonnegative('Price must be 0 or greater'),
  mealsPerDay: z.number().int().min(1, 'Meals per day must be at least 1').default(1),
  allowedMealTypes: z.array(z.string()).default(['BREAKFAST', 'LUNCH', 'DINNER']),
});

export async function getPlans(providerId) {
  return await prisma.mealPlan.findMany({
    where: { providerId, isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createPlan(providerId, data) {
  const validated = planSchema.parse(data);

  return await prisma.mealPlan.create({
    data: {
      providerId,
      name: validated.name.trim(),
      description: validated.description ? validated.description.trim() : null,
      quota: validated.quota,
      validityDays: validated.validityDays,
      price: validated.price,
      mealsPerDay: validated.mealsPerDay,
      allowedMealTypes: validated.allowedMealTypes,
      isActive: true,
    },
  });
}

export async function updatePlan(providerId, planId, data) {
  const validated = planSchema.parse(data);

  return await prisma.mealPlan.updateMany({
    where: { id: planId, providerId },
    data: {
      name: validated.name.trim(),
      description: validated.description ? validated.description.trim() : null,
      quota: validated.quota,
      validityDays: validated.validityDays,
      price: validated.price,
      mealsPerDay: validated.mealsPerDay,
      allowedMealTypes: validated.allowedMealTypes,
    },
  });
}
