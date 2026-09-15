-- CreateIndex
CREATE INDEX "MealRecord_providerId_status_createdAt_idx" ON "MealRecord"("providerId", "status", "createdAt");
