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

- `npm run typecheck`: passed via `npm run build`.
- `npm test`: passed, 59 tests.
- `npm run build`: passed with the known Vite chunk-size warning.
- `npm run test:e2e`: passed, 29 tests.

Use `docs/QA_CHECKLIST.md` for the current command, data safety, calculation, board, responsive, and documentation handoff checklist.

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

Demo seeding is controlled by `Store.seedDemoIfNeeded(force = false)`. Current behavior seeds fictional demo data only on true first run or explicit sample restore. User-selected empty setup states such as `deleted`, `restored-backup`, `existing-ledger`, and `empty-setup` are not silently reseeded on reload. `Store.getSampleDataStatus()` exposes the seed flag so the dashboard can visibly label the fictional sample ledger without affecting finance calculations.

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

- `src/persistence/schema-migration.js` has a registry for the current schema plus a legacy `finance-master.local-first.v0` repository snapshot migration that fills newer local buckets such as scenarios, price cache, and backup metadata.
- `inspectRepositoryMigration` validates snapshots before and after migration.
- Future schema changes need explicit version-aware migrations.

Data health is in `src/persistence/data-health.js` and reports storage availability, corrupted local shapes, incomplete ledger events, duplicate IDs, orphaned ledger/goal links, event counts, latest event timestamps, schema label, backup version, last backup time, migration status, and storage keys.

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
- Expected income settlement into actual cash without forecast double-counting.
- No-deadline debt review pressure without hidden burn/runway distortion.
- CSV import parsing and validation.
- Backup validation/migration/rejection.
- Data health for corrupt storage, duplicate IDs, and orphaned links.
- Repository migration inspection.
- Forecast expected landing, forecast low points, reserve health, weather, and signals.
- Weekly checkpoint normalization, replacement, and history retention.
- Decision engine and scenario lab behavior.
- E2E navigation, data safety, backup/restore, repair-query preservation, forms, settings preference propagation, empty-ledger first-run guidance, and UI boundaries.

## Suspicious Or Known Roadmap Areas

- Visible board labels completed the Phase 2 rename to Money Status, Decision Lab, Cash Timeline, Money Plan, Risk Radar, Reality Check, Records, and Settings.
- `src/dashboard/financial-mode.js` is very large and mixes rendering, routing, presentation logic, UI state, and action handling.
- The global plus button now opens a predictable creation-focused Quick Add menu on every board. It uses existing workflows for transactions, income, cash accounts, recurring costs, debt items, reserve buckets, and CSV import; standalone obligation and decision-scenario creation remain deferred until product workflows exist.
- Shared board actions use the `renderFinanceButton` primitive. Legacy `.fin-action-btn` markup is covered by E2E absence checks and its dead CSS has been removed.
- Decision Lab layout/readability is guarded by viewport E2E checks, its explanatory "why this board exists" copy now lives in the help layer instead of a prominent board card, and it can create saved planning drafts that reuse Scenario Lab 2.0 for non-mutating decision previews.
- Settings now keeps app preferences, one backup/restore flow, local data health, a visible preference-impact summary, reduced-motion persistence, and a distinct typed-confirmation safety zone for reset/sample-data actions. CSV import actions, import history, and saved CSV profiles live with Records, where raw transaction utility belongs.
- Records now has one header action cluster for Import CSV, Export, and Add transaction; duplicate utility-card import/add buttons were removed to improve action hierarchy.
- Records now keeps search always visible, moves account/category/date/source filters into collapsed advanced filters, and exposes common filter chips for review/link/type states.
- Money Plan now labels protected account allocations and reserve bucket balances separately, uses readable debt plan counts, and gives Protected Money one primary creation action.
- Money Status now raises Financial Weather directly below the Safe-to-Spend cockpit, keeps weather signals compact, renames the daily focus to Suggested Next Move, makes that action primary, and shows obligation due dates before type labels.
- Money Status now shows a non-blocking minimum useful setup checklist when local data is empty or incomplete, with first-run actions for cash accounts, recurring costs, upcoming obligations, expected income, and reserve protection.
- Money Status now marks the seeded fictional sample ledger with a clear note, a confirmation-gated Start Empty action, and a Settings route; empty local setup is not labeled as sample data.
- Mobile shell surfaces now use theme-controlled sidebar, control, nav-pill, and selected-row tokens instead of hard-coded pale navigation colors.
- Primary board copy now uses "Needs confirmation" and "Reality check suggested" instead of the older "Unreviewed" / "Review due today" wording.
- Cash Timeline now separates actual cash, available cash, and expected landing; expected income is visibly forecast-only, low points have risk labels, and Scenario Pressure uses simpler status cards.
- Risk Radar rows now show status, reason, impact, and a route to the relevant source board; Pattern Memory stays compact until 3 checkpoints exist and shows a clear unlock condition instead of a large locked list.
- Reality Check now keeps Review Queue as the actionable source of truth, uses compact obligation/payment checks to reduce duplicate lists, and places Save Checkpoint as the final action.
- The deployable `docs/index.html` and `docs/assets/` GitHub Pages artifact has been refreshed from the current Vite build so it no longer carries old navigation or obsolete bundle hashes.
- `Store.seedDemoIfNeeded` still auto-seeds first-run sample data when no local seed state exists; a fuller first-run chooser remains a future onboarding refinement.
- Schema migration has a small historical v0 repository migration, but future schema additions still need explicit version-aware migrations and fixtures.
- Backup restore validation is strong, but future schema additions must update backup validation and migration fixtures.
- Central protected cash can come from protected account allocations while explicit reserve buckets are tracked separately; future calculation work should decide whether reserve bucket balances should become canonical protected cash inputs or remain planning containers.
- Debt/payment-plan lifecycle affordances are implemented and covered by E2E; future debt work should focus on copy and archive/delete product semantics rather than rebuilding the lifecycle model.

## Phase 1 Acceptance Criteria

- `docs/CODEBASE_AUDIT.md` exists.
- `docs/QA_CHECKLIST.md` exists.
- `docs/PRODUCT_SPEC.md` exists.
- `docs/DATA_MODEL.md` exists.
- Boards, major components, data models, and calculation paths are listed.
- Known broken or suspicious areas are identified.
- Exact build/test/typecheck commands are documented.

## Recommended Next Chunk

### Phase 16 — Fresh desktop/mobile interaction QA

- Goal: Run a current interaction and screenshot QA pass against the remaining open/polish items in the roadmap.
- Files likely affected: `docs/FINANCE_MASTER_ROADMAP.md`, `docs/QA_CHECKLIST.md`, `tests/e2e/finance-master.spec.ts`, and any narrowly touched board markup/CSS if QA finds a concrete regression.
- Implementation steps: exercise Money Status, Risk Radar, Records detail drawer, and the mobile layout; compare findings against the roadmap's remaining QA list; open new focused chunks only for still-reproducible problems.
- Tests: `npm test`, `npm run build`, targeted Playwright checks for any touched board, and full E2E if shared UI or navigation changes.
- Acceptance criteria: manual QA findings are documented, deferred work is explicit, and no new critical visual or interaction issue remains without a reproduction.
- Risks / notes: do not turn the QA pass into a broad redesign; fix only high-confidence regressions in small follow-up chunks.
