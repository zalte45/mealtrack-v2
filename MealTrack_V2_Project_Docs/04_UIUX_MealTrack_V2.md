# MealTrack V2 — UI/UX Specification

## Visual Source
Google Stitch project **MealTrack SaaS Admin Dashboard**, ID `18403732243560118432`.

## Stitch Resources
1. Design System — `asset-stub-assets_22453715c3ef44a3abd7c9082c4a90ff`
2. MealTrack Logo — `4d7066bec04e410fb8b88b18da253e56`
3. Operations Manager Avatar — `972af85b439e4f329b0144a3e98990ef`
4. Dashboard — `eb10ca58f0be43a48f0e2eb7e8ee8b95`
5. Customer Directory — `c1725b68f546420b98e9d9e62fd30609`
6. Meal Counter — `bde2bb0e4ac24421adb6f8b35d4d5cba`
7. Meal History & Audit — `656491cca5ef4576ad08e5bcfd31e48c`
8. Subscriptions — `306bd0f784964a029eee45b62aa60cb8`
9. Operational Reports — `8f173b3028e643a3b1286419d63098e0`
10. Provider Settings — `986176267e354a36ac2cb2daec0b4a31`

## Design System
Stitch uses a strong indigo primary around `#3525CD`, mint secondary around `#6CF8BB`, light surface around `#FAF8FF`, error around `#FF5449`, Plus Jakarta Sans for headings, Inter/Geist-style body typography, and 12–16 px rounded geometry. Use imported Stitch tokens/assets where available.

## Navigation
Meal Counter, Dashboard, Customers, Subscriptions, Meal History, Reports, Settings. Meal Counter is the operational home.

## Login
Branding, email/username, password, sign-in, validation, loading, and error states.

## Meal Counter
Prominent 4-digit input, keyboard-first flow, customer card, subscription status, balance, Record Meal action, recent activity, and operational indicators. Mobile uses large numeric input/action and single-column layout.

Interaction:
ID input → Enter → customer lookup → customer/plan/balance → confirm → record → updated balance → clear/refocus.

## Dashboard
Real data for today's meals, active customers/subscriptions, low balances, expiry alerts, recent activity, and quick actions. Never hardcode Stitch demo values.

## Customers
Search, Active/All/Archived filters, count, cards/list, add, profile, edit/archive, prominent Member ID.

## Subscriptions
Plans/subscriptions, active/expired status, quota/usage meters, validity, payment status, renewal, customer association, history.

## History & Audit
Date filters, daily/customer history, VALID/VOIDED states, operator information, correction/void workflow, audit trail.

## Reports
Date range, totals, utilization, breakdowns, export where implemented. All totals derive from the ledger.

## Settings
Provider information, operational thresholds, counter preferences where implemented, staff permissions, owner-only sensitive controls.

## Reusable Components
Buttons, inputs, selects, cards, badges, tabs, dialogs, tables, mobile cards, alerts, toasts, skeletons, empty/error/success states.

## Accessibility
Keyboard navigation, visible focus, contrast, semantic controls, labels, accessible dialogs and status messages, suitable touch targets.

## Responsive Verification
375, 768, 1280, 1536, 1680, and 1920 px. Check alignment, spacing, overflow, navigation, modal behavior, typography, forms, tables/cards, and keyboard flow.

## Data Fidelity
Stitch defines visual design. MealTrack APIs/services/database define real business data and behavior.
