# MealTrack V2 — Product Requirements Document

## Product
MealTrack is a provider-only web application for restaurants, messes, tiffin services, and meal providers. It replaces handwritten meal registers with fast customer, subscription, meal, history, reporting, and settings workflows.

## Goals
- Normal meal recording in about 2–4 seconds after the 4-digit ID is known.
- Meal Counter is the operational home screen.
- Permanent 4-digit Member IDs.
- Ledger-first, auditable balances.
- Flexible quotas, validity, meal types, and meals-per-day rules.
- Responsive laptop, tablet, and mobile UX.
- Provider/tenant data isolation.

## Users
**OWNER/ADMIN:** customers, subscriptions, corrections, reports, staff, settings.
**STAFF:** Meal Counter, customer lookup, limited customer/subscription view, meal recording.
**CUSTOMER:** business record only; no customer login in MVP.

## MVP Modules
1. Authentication — P0
2. Meal Counter — P0
3. Customers + Member IDs — P0
4. Plans + Subscriptions — P0
5. Meal Ledger — P0
6. History — P0
7. Dashboard — P1
8. Reports — P1
9. Settings — P1

## Core Business Rules
- Member ID is exactly four numeric digits.
- IDs are unique within a provider, start at 1001, and are never recycled.
- Member ID is an identifier, not an authentication secret.
- Customer keeps the same Member ID across renewals.
- Every meal record belongs to one customer and one subscription.
- Remaining balance is derived from quota minus VALID ledger records according to plan rules.
- Missing days do not consume meals unless explicitly configured by contract.
- Expired/exhausted subscriptions are blocked by default.
- Duplicate requests are idempotent.
- Historical meal records are never hard-deleted.
- Corrections create traceable VOIDED/audit state changes.
- Renewal creates a new subscription and preserves old history.
- mealsPerDay is a configurable maximum, not a universal one-meal-per-day rule.
- Multiple meals/day and meal types remain supported where plan rules allow.

## Meal Counter Golden Path
1. Focus 4-digit ID field.
2. Enter ID.
3. Press Enter.
4. Resolve provider-owned customer/subscription.
5. Show customer, plan, balance, status.
6. Confirm Record Meal.
7. Transactionally create ledger record.
8. Show updated balance.
9. Clear and refocus ID field.
10. Show recent activity.

## Explicit Error Cases
Invalid ID, customer not found, no active subscription, pending start, expired, exhausted, daily limit, invalid meal type, duplicate/idempotent request, unauthorized action, and server/database failure.

## MVP Exclusions
Customer login/app, QR/NFC as primary flow, payment gateway, WhatsApp/SMS, inventory, kitchen, delivery, POS/accounting, biometrics, AI, multi-branch SaaS expansion, and offline-first queue.

## Acceptance
Provider can log in, resolve a valid ID, record a valid meal without manually entering date/name/plan, see updated balance, return to the ID field, handle invalid/expired/zero/duplicate cases explicitly, preserve correction audit history, and use the application on mobile and laptop.
