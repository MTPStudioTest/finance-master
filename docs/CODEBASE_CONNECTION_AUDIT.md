# Finance Master Codebase Connection Audit

Audit date: 2026-06-04

## Executive Summary

Finance Master is a local-first Vite app with an event-sourced finance ledger, an IndexedDB/localStorage repository adapter, a derived read model, and centralized treasury calculations. The safety and calculation foundation is stronger than the incoming brief assumed: URL repair/reset behavior is covered by e2e tests, backup restore uses validation/preview, cash accounts are editable, and actual/protected/available cash plus burn/runway are computed centrally.

The main confirmed reconnection gap is Debt & Payment Plans. The app currently stores debt liability and payment-plan pressure on the same derived `debtAccounts` record. Treasury shows only the top 3 debt cards before a generic details panel, and payment plan lifecycle states such as on hold, starts later, irregular, completed, and archived are not first-class. That makes monthly pressure look more deterministic than real freelance debt often is.

## Current Architecture Map

- App entry: `src/main.ts` imports finance utilities, initializes `Store`, seeds demo data if needed, applies appearance, and starts `FinancialMode`.
- Persistence: `src/persistence/store.ts` is the public facade. `src/persistence/repositories.ts` reads/writes IndexedDB first and mirrors localStorage for compatibility.
- Storage keys: `src/settings/storage-keys.ts` names ledger, settings, UI, review, goals, imports, prices, backup metadata, and demo seed state.
- Finance domain: `src/finance/ledger.js` builds the read model from events; `src/finance/compute.js` computes treasury metrics; `forecast.js`, `month-close.js`, `confidence.js`, and `invariants.js` provide supporting domain logic.
- UI shell: `src/dashboard/financial-mode.js` renders all seven boards and many widget-level calculations/presentations.
- Modals/actions: `src/components/modal-controller.ts` renders focused edit/confirm modals and calls `Store` methods or appends finance events.
- Tests: `tests/finance-ledger.test.mjs`, `tests/trust-hardening.test.mjs`, and `tests/e2e/finance-master.spec.ts`.

## Dashboard Map

- Pulse: cockpit for Safe-to-Spend, cash structure, burn pressure, runway, next income, obligations, and top actions.
- Flow: cash calendar, projection, scenarios, income pipeline, invoices, and upcoming movements.
- Plan: structural setup for cash accounts, protected money, recurring burn, debt/payment plans, goals, and project views.
- Radar: insight/risk board for income dependency, expense gravity, debt intelligence, reserve discipline, scenario moves, and recommendations.
- Review: operating loop for review queue, obligation checks, payment matching, tension signals, and checkpoint history.
- Logbook: ledger records, filters, import evidence, transaction inspector, and cleanup actions.
- Settings: local data health, backup/restore/reset/sample data, appearance, currency, horizon, and display preferences.

## Widget Classification

- Read-only summaries based on real editable data: Pulse cash/runway cards, Flow projections, Radar risk cards, Review checkpoint summaries.
- Editable widgets: Plan cash accounts, reserve buckets, recurring costs, debt plan cards, goals, income/pipeline rows.
- Action widgets: quick add, review queue rows, obligation payment/defer rows, import/backup controls, destructive confirmations.
- Confirmed weak widgets: Debt & Payment Plans presents a top-3 card preview plus generic details. It does not classify plan states or expose every lifecycle action inline.
- Legacy/advanced widgets to keep contained: market/crypto/DeFi placeholders and broader Radar diagnostics. These are useful only if they stay downstream from the treasury core.

## Data Model Map

The canonical data model is an append-only `FinanceEvent[]`. Current core events include:

- Cash account: `asset.account_set`
- Reserve bucket: `asset.reserve_set`, `asset.reserve_allocated`
- Transaction: `income.received`, `expense.recorded`, `transfer.recorded`, `cash.adjusted`
- Recurring cost: `expense.recurring_set`
- Debt liability/payment: `debt.added`, `debt.payment_made`, `debt.plan_updated`
- Income pipeline/invoice: `pipeline.*`, `invoice.sent`, `invoice.paid`
- Review: `transaction.reviewed`, `obligation.reviewed`
- Lifecycle/reversal: `finance.event_reversed`

Canonical direction: keep the ledger as source of truth, but derive separate debt liability and debt payment-plan pressure fields from debt events instead of adding a parallel model.

## Broken Or Disconnected Functions

Confirmed:

- Debt payment plan state is under-modeled. `debt.plan_updated` only carries due date, minimum payment, plan type, frequency, installments, and note.
- Debt pressure calculations treat any outstanding debt with positive payment as active burn pressure, regardless of pause/future/irregular/completed/archive intent.
- Treasury debt cards call `renderTreasuryDebtCards(activeDebts, 3)`, so only the top 3 debt cards are visible in the primary grid.
- `deactivateDebtAccount` reverses `debt.added` and `debt.payment_made` events but not `debt.plan_updated`, leaving lifecycle semantics muddy.

Not confirmed after inspection:

- Cash accounts being impossible to edit. The current app has add/edit/deactivate cash account flows, balance edit fields, and e2e persistence coverage.
- URL repair deleting data. The current e2e suite includes a `?repair=demo` preservation regression.
- Backup restore silently overwriting data. Restore preview and typed destructive confirmation are implemented and tested.

## Cash Account Findings

Cash accounts are already central to the app:

- Created/edited through `renderFiatAccount` in `src/components/modal-controller.ts`.
- Stored as `asset.account_set` events.
- Derived into `readModel.fiatAccounts`.
- Used by `src/finance/compute.js` to calculate actual cash, protected cash, available cash, Safe-to-Spend, and runway.
- Covered by the e2e test `treasury cash accounts and reserve buckets can be edited and persist`.

Remaining gap: deletion vs archive is not product-clear. Current deactivate behavior reverses account set events and removes the account from active calculations. A later cash-account pass should decide whether mistaken deletion and historical archive need separate visible flows.

## Debt And Payment Plan Findings

Debt is the highest-risk product gap:

- Liability and payment plan are currently represented by one derived debt record.
- Debt status and payment plan status are not distinct.
- No first-class status controls exist for on hold, starts later, irregular, completed, or archived.
- User-defined monthly pressure is missing.
- Inclusion controls for burn, Safe-to-Spend, and runway are missing.
- The primary Plan board hides debt cards after a top-3 preview.
- The modal title says “Add debt payment plan” even when editing an existing plan.

Desired canonical model:

- Debt liability: creditor/name, original/added amount, paid amount, outstanding, scope, project, notes, active/archive state.
- Payment plan pressure: status, amount, frequency, start/end dates, custom monthly pressure, inclusion flags, note, and review timestamp.

## Persistence And Safety Issues

Confirmed safe baseline:

- Primary data remains local-first.
- IndexedDB is the durable repository; localStorage compatibility remains.
- Backup validation and metadata exist.
- Destructive reset/restore/sample flows require typed confirmation.

Risks:

- Adding new debt-plan metadata must remain backward compatible with old backups and old events.
- New debt lifecycle actions should append or reverse ledger events; they should not mutate stored events in place.
- Archive/complete/pause should be non-destructive and reversible. Delete mistaken debt should use typed confirmation and event reversal.

## UI / UX Hierarchy Issues

- Plan is close to the right home for structural money setup, but Debt & Payment Plans needs to become a control panel rather than a static card list.
- Important debt states should be grouped by decision meaning: active pressure, starts later, on hold, irregular, no plan, completed/archived.
- Important numbers should trace back to editable sources. Metric explanations exist in compute, but not every dashboard has an obvious path to them.
- Settings should stay limited to preferences and local data safety; structural finance setup belongs in Plan.

## Legacy / Redundant Feature Classification

- Keep and improve: Pulse cockpit, Flow projection, Plan structural setup, Review loop, Logbook evidence, backup/restore safety.
- Keep but reconnect: Radar debt intelligence and scenario lab should consume richer debt-plan status/pressure.
- Hide as advanced: crypto/DeFi placeholders until treasury foundations are stable.
- Merge or simplify later: duplicate cash/burn/debt summaries across Pulse, Plan, Flow, and Radar.
- Do not remove yet: existing compatibility aliases and legacy backup fields.

## Recommended Canonical Product Structure

- Pulse answers: what can I safely do now?
- Flow answers: what money moves next?
- Plan answers: what structure defines cash, reserves, burn, debt, and goals?
- Radar answers: what risk or opportunity deserves attention?
- Review answers: what needs my eyes this week?
- Logbook answers: what happened and what evidence supports it?
- Settings answers: how is this local app configured and protected?

## Prioritized Fix Roadmap

1. Add this audit and implementation plan documentation.
2. Extend debt-plan derived fields and calculation rules while preserving old data.
3. Replace the Debt & Payment Plans top-3 preview with a grouped control panel.
4. Add real debt lifecycle actions: pause, reactivate, complete, archive, delete mistaken entry, and record payment.
5. Verify cash-account behavior and patch only concrete gaps.
6. Improve metric traceability and classify legacy widgets before removal.

## Suggested Tests

- Unit: old debt plans default active; missing plans remain missing; on-hold/future/completed/archived plans do not affect burn; irregular plans require custom monthly pressure; linked recurring costs are not double-counted.
- E2E: five debt plans remain visible; pause/reactivate/complete/archive/delete actions persist after refresh; starts-later plan does not affect current burn; typed confirmation protects deletion.
- Regression: `npm test`, `npm run typecheck`, `npm run build`, `npm run test:e2e`.
