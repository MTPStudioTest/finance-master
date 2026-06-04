# Finance Master Current-State Audit

Source roadmap: `/Users/maximilianschertz/Downloads/finance-master-roadmap-for-codex_2.md`

Audit date: 2026-06-04

## Current Architecture

Finance Master is a static Vite app with a TypeScript entry point and mostly JavaScript finance/dashboard modules.

- Entry point: `src/main.ts`
- Shell and primary navigation: `index.html`
- Dashboard controller: `src/dashboard/financial-mode.js`
- Dashboard page registry: `src/dashboard/section-registry.js`
- Modal controller: `src/components/modal-controller.ts`
- Persistence facade: `src/persistence/store.ts`
- IndexedDB/localStorage repository adapter: `src/persistence/repositories.ts`
- Finance domain modules: `src/finance/*`
- Demo data: `src/data/demo-data.ts`

The app initializes finance event utilities, persistence, modal workflows, and the dashboard controller from `src/main.ts`. `Store.initialize()` loads repository state, `Store.seedDemoIfNeeded()` seeds fictional local demo data on first launch, and `FinancialMode.init()` renders the active dashboard.

## Current Dashboards

The visible navigation now exposes the downloaded roadmap's seven workspaces:

- `Pulse` (`dashboard`): main cockpit for Safe-to-Spend, current cash, runway, today’s finance focus, next money in, next obligations, financial weather, and a tiny trend strip.
- `Flow` (`flow`): timeline and forecast surface for dated money movement, scenario pressure, runway projection, invoice status, and income timing.
- `Plan` (`plan`): structural finance setup for accounts, reserves, recurring costs, debts/payment plans, goals, and project plans.
- `Radar` (`radar`): diagnosis board for risk radar, scenario lab, concentration, reserve health, debt intelligence, and recommended moves.
- `Review` (`review`): lightweight operating loop for review queue, obligation review, payment matching, review signals, and saved checkpoints.
- `Logbook` (`logbook`): raw record utility for transactions, imported rows, matching evidence, cleanup, and detail inspection.
- `Settings` (`settings`): imports, backups, restore/reset/sample-data controls, local data health, and app preferences.

Compatibility aliases in `src/dashboard/financial-mode.js` preserve older stored section IDs such as `transactions`, `cashflow`, `treasury`, `month-close`, `insights`, `import`, and `backup`.

Implemented Phase 2 update: `src/dashboard/section-registry.js` now defines the seven dashboard responsibilities, `index.html` exposes the seven-board nav, and older stored section IDs remain aliases.

## Current Data Structures

The canonical app state is an event-sourced ledger plus supporting local state.

- `FinanceEvent[]`: cash accounts, reserves, recurring costs, debt events, income pipeline, invoices, transactions, review events, and reversals.
- `FinanceSettings`: base currency and forecast horizon.
- `FinanceUiSettings`: appearance, reduced motion, scope filter, crypto price source, and scenario preferences.
- `FinanceReviewState`: account reconciliations, review checklist, notes, and month-close history.
- `FinanceGoalState`: savings and buffer goals linked to cash accounts.
- `FinanceImportState`: CSV import batches and saved mapping profiles.
- `FinancePriceCache`: local cached wallet quotes.

Primary storage is IndexedDB database `finance-master`, object store `state`. The repository adapter mirrors writes to localStorage for compatibility and reads IndexedDB first when both exist. In-memory state is the synchronous read source after initialization.

## Calculation Logic

Central finance calculations already exist and should be preserved.

- `src/finance/ledger.js` builds normalized read models from raw events.
- `src/finance/compute.js` computes actual cash, protected cash, available cash, Safe-to-Spend, monthly burn, runway, debt pressure, income scenarios, obligations, review queue items, and metric explanations.
- `src/finance/forecast.js` builds horizon forecasts.
- `src/finance/month-close.js` builds deterministic review summaries.
- `src/finance/confidence.js` and `src/finance/invariants.js` support trust and diagnostic checks.

This mostly satisfies the roadmap's shared calculation utility direction. Future UI work should consume these functions instead of recalculating metrics inside widgets.

## Current Components

Dashboard rendering is centralized in `src/dashboard/financial-mode.js`, with many local render functions. The file owns navigation, section rendering, quick actions, filters, workspace widgets, and page-specific actions.

Important renderer groups:

- Pulse/cockpit: `renderObservatoryHeader`, `renderDashboardCockpit`, `renderTodaysDecision`, `renderNext30Days`, `renderNextActions`, `renderStrategicPicture`
- Flow/forecast: `renderCashCalendar`, `renderInvoicesSection`, `renderScenarioOutcomes`, `renderPipelineTabs`, `renderProjection`
- Plan/structure: `renderReservesSection`, treasury cost/reserve/debt/project renderers, goals
- Radar: `renderReportsSection`, risk/opportunity/scenario helpers
- Review: `renderReviewQueue`, `renderObligationReviewSection`, `renderPaymentReviewSection`, `renderWeeklyReviewSection`, month-close summary/history
- Logbook/records: `renderLedgerSection`, ledger row/detail renderers, expected income rows, import-batch filters
- Settings/data: `renderDataSection`, `renderSettingsSection`, import batch/profile rows, local data health

Modal rendering is centralized in `src/components/modal-controller.ts`, with smaller shared pieces in `src/components/modal-ui.ts` and `src/components/modal-workflows/core.ts`.

## Major Issues Against The Downloaded Roadmap

- The seven-board IA is now represented, and Pulse, Flow, Plan, Radar, and Review have had first roadmap-aligned simplification passes. Logbook and Settings still reuse several older renderers and need deeper per-board simplification.
- `Flow` is now forecast/timeline-first, but it still includes older invoice and pipeline table renderers under clearer Flow labels.
- `Settings` includes import/export/backup/restore, while the roadmap's Settings scope is app behavior and local data/privacy. This is acceptable short term, but import/add-entry belongs closer to Logbook in the roadmap.
- `src/dashboard/financial-mode.js` is large and mixes page routing, rendering, UI state, business presentation decisions, and actions.
- `src/components/modal-controller.ts` remains large and contains several complex workflows. The roadmap prefers drawers/progressive disclosure for richer detail views.
- `Plan` is now the user-facing structural board, with `map`, `treasury`, and `reserves` preserved as stored-section aliases.
- There is duplicated conceptual summary across Flow, Plan, Radar, and older report surfaces. Each remaining board needs a stricter role and visible metric budget.
- The demo data is meaningful for a freelancer/studio, but demo debt is seeded without a payment plan, which intentionally creates a review item. That is useful for trust testing but may make Pulse look less complete on first launch.

## Safe Refactor Plan

### Phase 2 dashboard responsibility config

- Goal: make the seven boards explicitly map to the downloaded roadmap responsibilities without breaking saved section aliases.
- Files likely affected: `index.html`, `src/dashboard/section-registry.js`, `src/dashboard/financial-mode.js`, `tests/e2e/finance-master.spec.ts`.
- Implementation steps: define a single dashboard config, document each board question, keep aliases, and add tests for responsibility boundaries.
- Tests: e2e navigation and boundary assertions.
- Acceptance criteria: Pulse has no raw ledger, Settings has no structural finance setup, Plan owns debts/reserves/costs/goals, Logbook owns raw records and cleanup, Review owns the maintenance loop.
- Risks / notes: changing nav labels can break stored local UI state unless aliases remain.
- Status: completed in this slice.

### Phase 4 calculation utility audit

- Goal: confirm every roadmap metric is present or intentionally missing before redesigning widgets.
- Files likely affected: `src/finance/compute.js`, `src/finance/forecast.js`, `tests/finance-ledger.test.mjs`, `tests/trust-hardening.test.mjs`.
- Implementation steps: inventory Safe-to-Spend, runway, burn, obligations, income, reserve health, debt schedule, financial weather, top signals, and danger zone forecast; add missing pure helpers if needed.
- Tests: direct unit tests for missing helpers and edge cases.
- Acceptance criteria: widgets can consume inspectable finance outputs without local math.
- Risks / notes: avoid changing formulas without fixture-backed tests.
- Status: completed in this slice with `buildRoadmapFinanceMetrics`, reserve health, danger-zone forecast, financial weather, and top signals.

### Phase 5 Pulse redesign

- Goal: make Pulse a clean main cockpit centered on Safe-to-Spend.
- Files likely affected: `src/dashboard/financial-mode.js`, `src/styles/finance-dashboard.css`, e2e tests.
- Implementation steps: reduce visible Pulse metrics to roadmap widgets, add expandable calculation drawer/panel for Safe-to-Spend, remove long queues, keep current explanations from compute layer.
- Tests: e2e checks for no raw records, dominant Safe-to-Spend, next income/obligations, and no overflow.
- Acceptance criteria: user can understand state quickly, with no raw transaction table or repeated summary wall.
- Risks / notes: preserve accessibility labels and mobile layout.
- Status: completed in this slice for the first Pulse pass. Further visual polish can happen in Phase 14.

### Phase 6 Flow redesign

- Goal: make Flow the timeline and forecast board for incoming money, outgoing obligations, runway projection, and scenario pressure.
- Files likely affected: `src/dashboard/section-registry.js`, `src/dashboard/financial-mode.js`, `src/styles/finance-dashboard.css`, `tests/e2e/finance-master.spec.ts`.
- Implementation steps: reorganize Flow around cash calendar, next income/outflows, runway projection, invoice status, and scenario toggles; remove structural setup and raw ledger affordances from Flow.
- Tests: e2e checks that Flow shows timeline/forecast widgets, preserves invoice/pipeline controls, links structural edits to Plan, and does not expose raw transaction log.
- Acceptance criteria: Flow answers “what is moving, when, and under which scenario?” without becoming a settings or ledger board.
- Risks / notes: keep forecast math sourced from `src/finance/forecast.js` and `src/finance/compute.js`.
- Status: completed in this slice for the first Flow pass.

### Phase 7 Plan redesign

- Goal: make Plan the structural money board for accounts, reserves, fixed costs, debt payment plans, and goals.
- Files likely affected: `src/dashboard/financial-mode.js`, `src/styles/finance-dashboard.css`, `tests/e2e/finance-master.spec.ts`.
- Implementation steps: keep the existing treasury/Plan calculations, simplify labels away from “map”, emphasize structural inputs and payment-plan normalization, and remove forecast/timeline concerns from Plan.
- Tests: e2e checks for accounts, protected money, recurring burn, debt/payment plans, goals, project profiles, and no Flow timeline/raw ledger content.
- Acceptance criteria: Plan answers “what money is protected, committed, and structurally planned?” without duplicating Flow or Logbook.
- Risks / notes: avoid changing calculation formulas while rearranging presentation.
- Status: completed in this slice for the first Plan pass. Project profile UI copy now uses Plan language while aliases/data keys remain compatible.

### Phase 8 Radar redesign

- Goal: make Radar the risk/opportunity diagnosis board rather than a generic reports page.
- Files likely affected: `src/dashboard/financial-mode.js`, `src/styles/finance-dashboard.css`, `tests/e2e/finance-master.spec.ts`.
- Implementation steps: keep the existing insight calculations, emphasize current risks, reserve health, income concentration, scenario moves, and locked historical intelligence separately.
- Tests: e2e checks for Radar risk sections and absence of Flow timeline, Plan setup, and raw Logbook tables.
- Acceptance criteria: Radar answers “what should I notice?” without becoming reports, setup, or ledger.
- Risks / notes: do not introduce advanced AI or advice language; keep outputs framed as operational signals.
- Status: completed in this slice for the first Radar pass. Existing insight calculations remain; the board is now framed as Radar Diagnosis.

### Phase 9 Review dashboard

- Goal: make Review the maintenance loop for unresolved items, obligations, tension signals, and saved checkpoints.
- Files likely affected: `src/dashboard/section-registry.js`, `src/dashboard/financial-mode.js`, `src/finance/month-close.js`, `tests/e2e/finance-master.spec.ts`.
- Implementation steps: simplify Review labels around a weekly/monthly ritual, keep transaction/payment review actions focused, and make saved checkpoint state prominent.
- Tests: e2e checks for open items, obligation review, tension signals, checkpoint summary/history, and no Flow/Plan/Logbook leakage.
- Acceptance criteria: Review answers “what needs my eyes?” without becoming the raw ledger or a settings page.
- Risks / notes: preserve non-destructive review actions and existing month-close summaries.
- Status: completed in this slice for the first Review pass. Review now owns payment matching and checkpoint ritual visibility.

### Phase 10 Logbook

- Goal: make Logbook the raw record and import evidence workspace for transactions, imported rows, filters, matching, and cleanup.
- Files affected: `src/dashboard/financial-mode.js`, `src/styles/finance-dashboard.css`, `tests/e2e/finance-master.spec.ts`.
- Implementation steps: preserved ledger utility, added Logbook utility cards, added a focused record detail drawer, moved stale ledger-workspace tests from Flow to Logbook, and kept checkpoint/review responsibilities on Review.
- Tests: e2e checks for transaction log, record filters, import evidence, matching actions, record detail inspection, and absence of Flow/Plan summaries.
- Acceptance criteria: Logbook answers “what happened and what evidence supports it?” without becoming Review or Flow.
- Risks / notes: the ledger renderer remains inside the large dashboard controller and should be extracted only after the current IA is stable.
- Status: completed in this slice. Logbook now owns raw records, import/add-entry utilities, category cleanup cues, recurring detection cues, filters, matching actions, and record detail inspection.

## Immediate Next Chunk

The next safest implementation chunk is Phase 11: clean Settings so it is limited to app preferences, local data/privacy, backup/restore safety, and display behavior. Import/add-entry affordances should continue moving toward Logbook, while structural finance setup stays in Plan.
