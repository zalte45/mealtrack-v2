# MealTrack V2 — Development Plan

## Strategy
Build the complete operational loop first:

Authentication → Customer → Subscription → 4-digit ID → Meal Counter → Meal Record → Balance → History.

Each phase includes its own tests plus relevant previous-phase regression tests, JavaScript lint/static validation, Prisma validation where applicable, and responsive/manual verification where relevant.

## Phase 1 — Foundation + Database
- Next.js App Router, React, JavaScript/JSX only
- Tailwind
- Prisma/PostgreSQL
- env setup
- project structure
- reusable UI foundation
- Stitch design tokens/assets
- Provider/User/Customer/MealPlan/Subscription/MealRecord/AuditLog schema
- migrations
- seed/initial owner support
- scripts
**Done:** app runs, DB connects, migration is reproducible, Stitch design foundation is usable, no TypeScript.

## Phase 2 — Authentication + Protected UI Shell
- Owner/staff credentials
- bcrypt
- secure sessions
- role authorization
- protected routes
- sidebar/top bar
- responsive navigation
- provider identity
- login states
**Done:** login/logout/protection/role behavior and responsive shell work.

## Phase 3 — Customers + Member IDs
- CRUD
- search
- archive
- permanent 4-digit IDs
- start at 1001
- concurrency-safe generation
- profile
- active/all/archived filters
**Done:** unique provider-scoped IDs, never recycled, Customer Directory matches Stitch.

## Phase 4 — Plans + Subscriptions
- plans
- quota
- validity
- price
- payment status
- mealsPerDay
- meal types
- status engine
- create/renew/history
- snapshot terms
**Done:** eligibility, quota, renewal, historical subscription behavior are correct.

## Phase 5 — Meal Counter
- focused ID input
- Enter lookup
- confirmation card
- plan/status/balance
- transactional record
- idempotency
- daily/meal-type rules
- zero/expired/duplicate handling
- success
- auto clear/refocus
- recent activity
- chime preference where implemented
**Done:** valid recording is fast, safe, ledger-correct, and does not accidentally block legitimate multiple meals.

## Phase 6 — History + Register + Audit + Reports
- today's register
- customer history
- filters
- operator logging
- valid/voided states
- correction modal
- audit log
- date-range reports
- totals/utilization
- breakdowns
- CSV export
**Done:** ledger-derived totals are reproducible and corrections remain traceable.

## Phase 7 — Dashboard
- today's meals
- active customers/subscriptions
- low balance
- expiry alerts
- recent activity
- quick actions
- Stitch dashboard
**Done:** real database/service values only; correct alert logic and responsive UI.

## Phase 8 — Hardening + Verification
- full regression
- auth/authorization audit
- tenant isolation
- ledger/idempotency/concurrency
- validation
- accessibility
- responsive checks
- runtime/console checks
- loading/empty/error/success checks
- build/migration/security/performance verification
**Done:** all tests and production-readiness checks pass.

## Phase 9 — Production Deployment
- Neon production DB
- migrations
- env vars
- Vercel
- domain/HTTPS
- monitoring/logging
- backups/restore verification
- production smoke tests
**Done:** real provider workflow works in production.

## Testing Strategy
### Unit
Member ID, balance, quota, eligibility, date rules, daily limits, meal types, duplicate rules.

### Integration
Customer → subscription → meal → balance.

### API
Authentication, role authorization, tenant isolation, idempotency.

### E2E
Login → customer → subscription → consecutive meal records → balance → history → correction/audit.

### Responsive
Phone, tablet, laptop.

## Milestones
M1 Foundation.
M2 Core Data.
M3 First Vertical Slice.
M4 Operational MVP.
M5 Release Candidate.
M6 Production MVP.

## Dependency Order
Foundation → Database → Authentication → Customers → Plans → Subscriptions → Meal Counter → Ledger/History → Dashboard → Reports → Hardening → Production.

## Future Backlog
Offline-first queue, optional QR scanning, payment gateway, WhatsApp/SMS, pause/holiday extensions, advanced exports/analytics, multi-branch SaaS, customer-facing application.
