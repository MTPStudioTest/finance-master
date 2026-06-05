# Finance Master Codebase Audit

Audit date: 2026-06-04

Canonical roadmap: `docs/FINANCE_MASTER_ROADMAP.md`

## Phase 1 Summary

Finance Master is a local-first Vite app with a TypeScript entry point, mostly JavaScript finance/dashboard modules, an event-sourced finance ledger, IndexedDB-backed persistence, localStorage compatibility mirrors, centralized treasury calculations, and Playwright plus Node test coverage.

The current codebase is already partially aligned with the roadmap's foundation: actual cash, protected cash, available cash, Safe-to-Spend, monthly burn, runway, income scenarios, debt pressure, backup validation, data health checks, and restore previews are implemented in shared modules rather than only in UI widgets.

The main near-term roadmap gap is not missing foundations from scratch. It is consolidation: `src/dashboard/financial-mode.js` is very large, some roadmap Quick Add options are intentionally deferred because no standalone workflow exists yet, and several roadmap-known UI issues still need focused implementation phases.

## Framework, Build, And App Entry

- Framework/build: Vite 7 with TypeScript.
- App entry: `src/main.ts`.
- HTML shell and primary navigation: `index.html`.
- Styling: `src/styles/master.css`, `src/styles/base.css`, and `src/styles/finance-dashboard.css`.
- Runtime shape: static local app, no backend, auth, bank sync, or server persistence.

Startup sequence:

1. `src/main.ts` imports styles, finance globals, modal/events/controllers, dashboard modules, and settings helpers.
2. `Store.initialize()` loads repository state.
3. `Store.seedDemoIfNeeded()` seeds fictional demo data when appropriate.
4. `applyAppearance(Store)` applies visual preferences.
5. `window.FinancialMode?.init()` renders the dashboard.

## Exact Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`
- Typecheck: `npm run typecheck`
- Build: `npm run build`
- Preview build: `npm run preview`

There is no separate lint script in `package.json`.

## Baseline Check Results

Last run during this audit:

- `npm run typecheck`: passed.
- `npm test`: passed, 54 tests.
- `npm run build`: passed.

`npm run test:e2e` was not run for this documentation-only Phase 1 change. It should be run before or after UI phases that touch navigation, layout, modals, storage workflows, or primary user actions.

## Navigation And Routing

Primary section IDs are stable and stored through `finance-master.layout.active-section`.

Current section IDs:

- `dashboard`
- `decisions`
- `flow`
- `plan`
- `radar`
- `review`
- `logbook`
- `settings`

Visible labels in `index.html` and `src/dashboard/section-registry.js` now use the roadmap names while keeping route IDs stable:

- Money Status
- Decision Lab
- Cash Timeline
- Money Plan
- Risk Radar
- Reality Check
- Records
- Settings

Compatibility aliases in `src/dashboard/financial-mode.js` preserve old or alternate route names such as `overview`, `today`, `cashflow`, `transactions`, `ledger`, `monthly-review`, `month-close`, `treasury`, `reserves`, `insights`, `import`, and `backup`.

Phase 2 renamed visible labels and headings while keeping these route IDs stable.

## Board Map

- Money Status / `dashboard`: current cockpit for Safe-to-Spend, actual/protected cash, runway, next income, next obligations, top actions, and financial weather.
- Decision Lab / `decisions`: current decision/focus board with decision cards, focus queue, timeline columns, opportunities, and scenario shortcuts.
- Cash Timeline / `flow`: cash calendar, scenario outcomes, projection, invoices, pipeline, and forecast movement.
- Money Plan / `plan`: structural money area for accounts, protected cash, reserves, recurring costs, debts/payment plans, goals, and project views.
- Risk Radar / `radar`: reports/risk surface with signals, reserve health, debt intelligence, scenario lab, and recommendations.
- Reality Check / `review`: review queue, obligation review, payment matching, tension signals, weekly/monthly checkpoint workflow.
- Records / `logbook`: ledger records, filters, imports, matching evidence, cleanup, transaction detail drawer.
- Settings / `settings`: local data health, backup/restore/reset/sample data, appearance, currency, horizon, and display preferences.

## Major Component And Module Map

- `src/dashboard/financial-mode.js`: main UI controller, routing, local dashboard state, render functions, board sections, widget info popovers, ledger filters, and action handlers.
- `src/dashboard/section-registry.js`: page title/subtitle and board-section mapping.
- `src/dashboard/finance-ui.js`: shared HTML render helpers for buttons, rows, widget headers/footers, section headings, status pills, and info popovers.
- `src/dashboard/financial-engine.js`: snapshot-first compatibility layer for older dashboard metric consumers.
- `src/components/modal-controller.ts`: modal workflow controller for add/edit/confirm/backup/import flows.
- `src/components/modal-ui.ts`: shared modal UI helpers.
- `src/components/modal-workflows/core.ts`: smaller workflow renderers for quick add and transactions.
- `src/components/sag-icons.ts`: icon registration.

## Storage Layer

Primary persistence is IndexedDB:

- Database: `finance-master`
- Version: `1`
- Object store: `state`
- Adapter: `src/persistence/repositories.ts`

The repository adapter keeps an in-memory synchronized state after initialization, writes through to IndexedDB, and mirrors values into localStorage for compatibility. If IndexedDB is unavailable, localStorage and memory act as fallback paths where possible.

Storage keys are centralized in `src/settings/storage-keys.ts`:

- `finance-master.ledger.v1`
- `finance-master.settings.v1`
- `finance-master.ui.v1`
- `finance-master.review.v1`
- `finance-master.goals.v1`
- `finance-master.imports.v1`
- `finance-master.scenarios.v1`
- `finance-master.prices.v1`
- `finance-master.backup-meta.v1`
- `finance-master.layout.focus-mode`
- `finance-master.layout.pipeline-tab`
- `finance-master.layout.collapsed.`
- `finance-master.layout.hero-details`
- `finance-master.demo-seeded.v1`

Additional layout keys are read directly in `src/dashboard/financial-mode.js`, including ledger view/filter/selected transaction, invoice view, treasury project view, and active section.

## Demo Data And Reset Behavior

Demo data comes from `src/data/demo-data.ts` via `createDemoDrafts(currency)`.

Demo seeding is controlled by `Store.seedDemoIfNeeded(force = false)`. Current behavior seeds demo data when the ledger is empty. The implementation comment says an empty ledger is not considered a stable deployed state, so stale demo flags such as `deleted` do not keep GitHub Pages empty forever.

Destructive or replacement methods in `Store`:

- `restoreBackup(input)`: validates/migrates backup input, replaces operational local state, and sets demo seed to `restored-backup`.
- `resetLocalFinanceData()`: removes Finance Master storage keys, sets demo seed to `deleted`, invalidates caches, and emits updates.
- `clearAndReseedDemo()`: removes ledger/demo seed, then force seeds demo data.
- `deleteSampleData()`: removes ledger, sets demo seed to `deleted`, and emits updates.

The UI exposes confirmation-gated reset and restore flows in modals. E2E tests cover repair-query preservation and backup restore validation.

## Backup, Restore, Schema, And Data Health

Backup validation is in `src/persistence/backup-validation.js`.

Current constants:

- App name: `Finance Master`
- Backup version: `2`
- Schema label: `finance-master.local-first.v1`
- Supported backup versions: `1`, `2`

Backup behavior:

- `Store.exportBackup()` exports ledger, finance settings, UI settings, review state, goals, import history, saved scenarios, price cache, and metadata.
- `Store.previewBackup(input)` uses `validateFinanceBackup`.
- `Store.restoreBackup(input)` uses `assertFinanceBackup`, including V1-to-V2 migration.
- Invalid backups are rejected before replacing local state.
- Restore previews include counts and warnings for backups older than local data.

Schema migration is currently minimal:

- `src/persistence/schema-migration.js` has a registry containing the current schema only.
- `inspectRepositoryMigration` validates snapshots before and after migration.
- Future schema changes need explicit version-aware migrations.

Data health is in `src/persistence/data-health.js` and reports storage availability, corrupted local shapes, event counts, latest event timestamps, schema label, backup version, last backup time, migration status, and storage keys.

## Data Model

The durable model is an append-only `FinanceEvent[]`.

Core event families:

- Cash accounts: `asset.account_set`
- Reserve buckets: `asset.reserve_set`, `asset.reserve_allocated`
- Actual transactions: `income.received`, `expense.recorded`, `transfer.recorded`, `cash.adjusted`
- Recurring costs: `expense.recurring_set`
- Obligations/review: `obligation.reviewed`, `transaction.reviewed`
- Income pipeline/invoices: `pipeline.*`, `invoice.sent`, `invoice.paid`
- Debt: `debt.added`, `debt.payment_made`, `debt.plan_updated`
- Projects/goals/checkpoints and reversals: `project.profile_set`, goal/review events, `finance.event_reversed`

Read models are derived in `src/finance/ledger.js`:

- `fiatAccounts`
- `reserveBuckets`
- `recurringExpenses`
- `obligationReviews`
- `transactions`
- `pipelineDeals`
- `invoices`
- `debtAccounts`
- `projectProfiles`
- optional web3/DeFi positions

`DATA_MODEL.md` already provides a useful canonical model summary and should be kept in sync as later phases alter schema or events.

## Calculation Logic

Central calculation modules:

- `src/finance/ledger.js`: event normalization, recurrence normalization, debt-plan status/monthly pressure, active-event derivation, read-model building.
- `src/finance/compute.js`: actual cash, protected cash, available cash, Safe-to-Spend, monthly burn, runway, debt pressure, obligations, income scenarios, review queue, metric explanations, confidence, invariants, diagnostics.
- `src/finance/forecast.js`: finance forecasts, roadmap finance metrics, reserve health, danger-zone forecast, financial weather, top signals.
- `src/finance/decision-engine.js`: decision/focus calculations.
- `src/finance/scenario-lab.js`: scenario analysis.
- `src/finance/pressure-timeline.js`: pressure timeline.
- `src/finance/month-close.js`: checkpoint/month-close summaries.
- `src/finance/confidence.js`: confidence score.
- `src/finance/invariants.js`: invariant checks.

Important current formulas and behaviors:

- Actual cash is derived from active liquid fiat account balances.
- Protected cash is derived from reserved/protected accounts and reserve buckets.
- Available cash is actual cash minus protected cash minus committed short-term obligations.
- Safe-to-Spend uses actual cash, protected cash, confirmed obligations due within 30 days, debt payments due soon, and a 7-day minimum buffer.
- Monthly burn includes recurring expenses plus included active debt payment plans.
- Runway uses available cash divided by recurring/debt runway burn.
- Expected income is handled as forecast/scenario income and is not counted as actual cash.
- Transfers are represented separately and should not count as income or expense.
- Debt payment frequency normalization supports weekly, biweekly, monthly, quarterly, and yearly.
- Debt plan statuses include active, on hold, starts later, irregular, completed, archived, and missing.

Future calculation changes should extend these modules with tests rather than adding math directly in dashboard renderers.

## Tests

Current test files:

- `tests/finance-ledger.test.mjs`
- `tests/trust-hardening.test.mjs`
- `tests/decision-engine.test.mjs`
- `tests/scenario-lab.test.mjs`
- `tests/e2e/finance-master.spec.ts`

Current coverage includes:

- Empty ledger snapshots.
- Read-model derivation.
- Project treasury tags.
- Recurrence normalization.
- Treasury separation.
- CSV import parsing and validation.
- Backup validation/migration/rejection.
- Data health for corrupt storage.
- Repository migration inspection.
- Forecast, reserve health, weather, and signals.
- Decision engine and scenario lab behavior.
- E2E navigation, data safety, backup/restore, repair-query preservation, forms, and UI boundaries.

## Suspicious Or Known Roadmap Areas

- Visible board labels completed the Phase 2 rename to Money Status, Decision Lab, Cash Timeline, Money Plan, Risk Radar, Reality Check, Records, and Settings.
- `src/dashboard/financial-mode.js` is very large and mixes rendering, routing, presentation logic, UI state, and action handling.
- The global plus button now opens a predictable creation-focused Quick Add menu on every board. It uses existing workflows for transactions, income, cash accounts, recurring costs, debt items, reserve buckets, and CSV import; standalone obligation and decision-scenario creation remain deferred until product workflows exist.
- Decision Lab layout/readability is guarded by viewport E2E checks, its explanatory "why this board exists" copy now lives in the help layer instead of a prominent board card, and it can create saved planning drafts that reuse Scenario Lab 2.0 for non-mutating decision previews.
- Settings now keeps backup/restore/reset/sample data and app preferences. CSV import actions, import history, and saved CSV profiles live with Records, where raw transaction utility belongs.
- Records now has one header action cluster for Import CSV, Export, and Add transaction; duplicate utility-card import/add buttons were removed to improve action hierarchy.
- Money Plan now labels protected account allocations and reserve bucket balances separately, uses readable debt plan counts, and gives Protected Money one primary creation action.
- Money Status now raises Financial Weather directly below the Safe-to-Spend cockpit, keeps weather signals compact, renames the daily focus to Suggested Next Move, makes that action primary, and shows obligation due dates before type labels.
- Cash Timeline now separates actual cash, available cash, and expected landing; expected income is visibly forecast-only, low points have risk labels, and Scenario Pressure uses simpler status cards.
- Risk Radar Pattern Memory stays compact until 3 checkpoints exist and shows a clear unlock condition instead of a large locked list.
- `Store.seedDemoIfNeeded` can repopulate an empty deployed app even after a stale `deleted` demo flag; this is intentional per comment but should be reviewed against the roadmap's sample-data separation rule before changing behavior.
- Schema migration has a registry but no historical migrations beyond current-shape clone.
- Backup restore validation is strong, but future schema additions must update backup validation and migration fixtures.
- Central protected cash can come from protected account allocations while explicit reserve buckets are tracked separately; future calculation work should decide whether reserve bucket balances should become canonical protected cash inputs or remain planning containers.
- Debt/payment-plan UI still needs explicit lifecycle affordances and labels even though the calculation layer has status support.

## Phase 1 Acceptance Criteria

- `docs/CODEBASE_AUDIT.md` exists.
- Boards, major components, data models, and calculation paths are listed.
- Known broken or suspicious areas are identified.
- Exact build/test/typecheck commands are documented.

## Recommended Next Chunk

### Phase 4 — Board action hierarchy and design-system consolidation

- Goal: Continue consolidating shared card/button/status patterns and reduce equal-weight board actions.
- Files likely affected: `src/dashboard/finance-ui.js`, `src/dashboard/financial-mode.js`, `src/styles/finance-dashboard.css`, and `tests/e2e/finance-master.spec.ts`.
- Implementation steps: identify repeated button/card variants already in use; choose one narrow board or component family; make one primary action visually and semantically dominant; keep secondary utilities quieter.
- Tests: targeted Playwright checks for the touched board plus `npm run typecheck`, `npm test`, and `npm run build`; run full E2E when touching shared UI helpers.
- Acceptance criteria: the touched board has one clear primary action per section, existing actions still work, and shared primitive usage increases without broad redesign.
- Risks / notes: avoid a large design-system rewrite; keep changes incremental and product-boundary aware.
