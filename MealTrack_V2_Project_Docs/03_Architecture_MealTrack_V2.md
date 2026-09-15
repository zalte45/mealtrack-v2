# MealTrack V2 — Architecture Document

## Architecture
Use a modular monolith. One Next.js application with clear internal domain modules. Do not introduce unnecessary microservices.

## Stack
- Next.js App Router
- React
- **JavaScript only**
- `.js` / `.jsx`
- Tailwind CSS
- PostgreSQL
- Prisma
- Zod
- Auth.js/NextAuth Credentials
- bcryptjs
- Vercel-compatible deployment

### JavaScript Rule
No `.ts`, `.tsx`, TypeScript types/interfaces/generics, or `tsconfig.json`.

## High-Level Flow
Browser → Next.js App Router → Auth/Route Handlers/Server Services → Validation → Prisma → PostgreSQL.

## Domain Modules
Auth, Providers, Users, Customers, Plans, Subscriptions, Meal Ledger, Reporting, Settings.

## Core Entities
Provider, User, Customer, MealPlan, Subscription, MealRecord, AuditLog.

## Relationships
Provider owns Users, Customers, MealPlans, and AuditLogs. Customers own subscriptions; subscriptions own meal records. Tenant relationships must be enforced server-side.

## Member ID
Exactly four numeric digits; unique per provider; starts at 1001; never recycled; remains with customer across renewals. Generation must be concurrency-safe.

## Subscription
Store a snapshot of purchased quota, price, validity, mealsPerDay, and allowed meal types. Renewal creates a new subscription and keeps previous history.

## Ledger-First Balance
`remaining = snapshotQuota - count(VALID meal records for subscription)` subject to configured rules. Do not use a manually edited remaining balance as the source of truth.

## Transactional Meal Recording
Authenticate → resolve provider → resolve customer → resolve eligible subscription → validate date/rules/quota → apply idempotency → create VALID MealRecord transactionally → return derived balance.

## Idempotency
Protect against double-clicks, repeated Enter, retries, and network duplication. Do not create a database uniqueness rule that accidentally prevents legitimate multiple meals in one day.

## Tenant Isolation
Every protected query is scoped to authenticated `providerId`. Never trust an arbitrary provider ID supplied by the client.

## Security
Server-side authorization, bcrypt, secure cookies, validation, tenant isolation, rate limiting, safe logs, environment secrets.

## UI Architecture
Use reusable App Shell, Sidebar, TopBar, buttons, inputs, cards, badges, tabs, modals, tables/cards, alerts, toasts, loading/empty/error states.

## Stitch
Google Stitch project: **MealTrack SaaS Admin Dashboard**
Project ID: `18403732243560118432`.
Stitch is the visual source of truth. Its demo data is never production business data. Real values come from MealTrack services/session/database.

## Deployment
GitHub → Vercel → Next.js → Neon PostgreSQL.
Expected environment variables: DATABASE_URL, DIRECT_URL, AUTH_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_APP_NAME.
