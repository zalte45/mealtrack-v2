# MealTrack V2 — Software Requirements Specification

## Scope
Provider-only responsive web application. OWNER and STAFF authenticate; customers do not.

## Functional Requirements
### Authentication
- Authenticate users.
- Protect application routes.
- Include provider and role context in the session.
- Hash passwords with bcrypt.
- Use secure sessions/cookies.

### Customers
- Create, edit, view, search, and archive customers.
- Generate permanent unique 4-digit Member IDs.
- Search by ID/name/mobile.
- Enforce provider isolation.

### Plans
- Create configurable plans.
- Support quota, validity, price, mealsPerDay, and allowed meal types.

### Subscriptions
- Create subscriptions.
- Snapshot purchased plan terms.
- Track start/end dates, quota, payment status, and derived status.
- Support ACTIVE, EXHAUSTED, EXPIRED, CANCELLED, PENDING_START.
- Renew by creating a new subscription.
- Preserve historical subscriptions.

### Meal Counter
- 4-digit lookup.
- Show eligible subscription and balance.
- Validate eligibility.
- Record transactionally.
- Protect against duplicates.
- Enforce configured daily/meal-type rules.
- Return updated balance.
- Clear/refocus after success.

### Ledger
- Timestamped meal records.
- VALID and VOIDED states.
- Database-backed idempotency.
- No silent historical deletion.
- Audit information for corrections.

### History/Reports
- Today's register.
- Customer history.
- Date/range filtering.
- Reproducible ledger-derived totals.
- CSV export where implemented.

### Dashboard
- Today's valid meals.
- Active customers/subscriptions.
- Low-balance customers.
- Expiry alerts.
- Recent activity.

### Settings
- Provider information.
- Operational thresholds.
- Staff permissions.
- Owner-only sensitive configuration.

## Data Integrity
Every tenant-owned record must be provider-scoped. Member ID uniqueness is provider-scoped. Balances are ledger-derived. Voids preserve traceability. Renewals never overwrite historical subscriptions.

## Validation
Use server-side runtime validation for auth, customers, plans, subscriptions, meal recording, filters, and settings. Client validation is UX only.

## Performance
- Lookup normally under 500 ms server time.
- Meal recording normally under 750 ms server time.
- At least 10 concurrent counter users/arrivals without noticeable degradation.
- Appropriate database indexes.

## Security
HTTPS in production, bcrypt, secure HTTP-only sessions, server-side authorization, tenant isolation, rate limiting where appropriate, environment secrets, safe logging, backups, and tested restore procedures.

## Testing
Each phase runs its own tests plus relevant regression tests. Test unit rules, customer→subscription→meal→balance integration, auth/role/isolation/idempotency APIs, E2E meal workflow, responsive layouts, lint/static checks, Prisma validation, build, and security.

## Definition of Done
Acceptance criteria pass; server validation/authorization exists; tests pass; no critical runtime errors; responsive states work; migrations are reproducible; no secrets are committed; audit requirements are met; preview deployment is manually verified.
