# Finance Master Reconnection Implementation Plan

## Summary

Execute the reconnection work in small reviewable slices. The first implementation slice is Debt & Payment Plans because it is the clearest confirmed disconnect between the current app and the product promise. Preserve the event-sourced local-first architecture and keep all new debt behavior backward compatible with existing `debt.plan_updated` events.

## Phase 1 — Debt Plan Domain Model

- Extend derived `debtAccounts` records with payment-plan metadata:
  - `planStatus`
  - `startDate`
  - `endDate`
  - `customMonthlyPressure`
  - `includeInBurnRate`
  - `includeInSafeToSpend`
  - `includeInRunway`
  - `paymentFrequency`
  - `paymentAmount`
  - `monthlyPressure`
- Keep storage as `debt.plan_updated` event metadata.
- Default old positive-payment plans to `planStatus: active`.
- Default debts without a positive payment to `planStatus: missing`.
- Derive `starts_later` behavior when a plan start date is in the future.
- Treat `on_hold`, `starts_later`, `completed`, `archived`, and irregular plans without custom monthly pressure as zero current pressure.

## Phase 2 — Calculation Reconnection

- Update `src/finance/compute.js` so debt burn uses `monthlyPressure` only when the plan is current and included in burn/runway.
- Use debt pressure for Safe-to-Spend only when the plan is current and included in Safe-to-Spend.
- Preserve linked recurring-cost double-count prevention.
- Add metric explanation wording for debt pressure and plan-state warnings.

## Phase 3 — Debt Control Panel UI

- Replace the silent top-3 debt grid with grouped debt sections:
  - Active pressure
  - Starts later
  - On hold
  - Irregular
  - No plan
  - Completed / archived
- Each row/card should show liability, current pressure, next due/start date, status, and focused actions.
- Add controls for edit plan, pause, reactivate, complete, archive, delete mistaken debt, and record payment.
- Keep modals focused; extend the existing debt plan modal rather than adding a large settings-style modal.

## Phase 4 — Debt Actions

- Extend `Store.saveDebtPlan(...)` to accept lifecycle/status and inclusion fields.
- Add store methods that append status-bearing `debt.plan_updated` events for pause/reactivate/complete/archive.
- Add a typed-confirmation delete path that reverses debt liability, payment, and plan events for mistaken entries.
- Keep archive/complete/pause reversible and non-destructive.

## Phase 5 — Cash Account Verification

- Verify existing cash-account flows after debt work:
  create, rename, balance edit, adjustment/reconcile, deactivate/archive, bucket, scope/project filter, and metric propagation.
- Patch only confirmed gaps.
- Document remaining product decisions around delete vs archive if not implemented in this slice.

## Phase 6 — Widget Traceability And Legacy Cleanup

- Improve “how this is calculated” visibility for Actual Cash, Protected Cash, Available Cash, Monthly Burn, Runway, Safe-to-Spend, and Debt Pressure.
- Keep legacy/advanced widgets classified in docs before deletion.
- Avoid new isolated widgets; every new surface should consume `Store.computeFinanceContext()` or the derived read model.

## Testing And Acceptance

- Unit tests must cover debt status defaults, inactive/future/completed/archived exclusion, irregular custom pressure, linked recurring-cost double-count prevention, and runway/Safe-to-Spend effects.
- E2E tests must cover five visible debt plans, pause/reactivate persistence, starts-later exclusion from current burn, delete/archive/complete confirmations, and refresh safety.
- Regression commands: `npm test`, `npm run typecheck`, `npm run build`, `npm run test:e2e`.

## Assumptions

- The ledger remains the only source of truth.
- New fields are optional in stored data and derived safely for old backups.
- Debt deletion is for mistaken entries and uses typed confirmation.
- Archive, complete, pause, and reactivate are lifecycle states, not destructive deletion.
