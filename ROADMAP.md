# Finance Master Roadmap

Finance Master is a local-first treasury operating system for a freelance creative or small studio operator. It should reduce financial anxiety by making real cash, reserved cash, obligations, income timing, debt pressure, and weekly decisions visible without becoming a generic accounting suite.

This roadmap follows the feature audit in `FEATURE_AUDIT.md`. The product should stay local-first, lightweight, and private. Do not add authentication, backend sync, bank linking, paid APIs, invoice generation, receipt OCR, full accounting, or AI insight features unless the product direction changes explicitly.

## Product North Star

Finance Master should answer these questions quickly:

- How much money is actually available after reserves?
- What money is already spoken for?
- What obligations are overdue or due soon?
- What income is confirmed, expected, or risky?
- How long is the runway?
- What actual payments need review?
- What should be decided this week?

Every roadmap item must improve one of those answers or make the underlying data more trustworthy.

## Current Baseline

Implemented baseline:

- Grouped app shell: Overview, Transactions, Income, Cashflow, Monthly Review, Reserves, Obligations, Reports, Import & Backup, Settings.
- Overview Money Picture cockpit with runway, 30-day projected result, cash structure, and burn pressure.
- Page-native Transactions Ledger Workspace with compact filters, Ledger / Review modes, a transaction inspector, and no visible Audit mode.
- Page-native Monthly Review workspace with inline cash reconciliation, review checklist, review note, validation, and Close month.
- Row actions in Review, Reserves, Income, Cashflow pipeline rows, recurring costs, and debt cards are icon-first where the action is contextual.
- Initial UI hardening seams for shared dashboard helpers, section composition, and modal helper rendering.
- Local-first Store/repository architecture with backup support.
- CSV import preview/import/undo.
- Manual transaction capture, ledger review, and transaction reversal.
- Cash accounts, recurring costs, debt items, income pipeline, goals, and weekly review primitives.
- Appearance modes: `aurora`, `midnight`, `bright`.
- Tests for core calculations, currency formatting, income windowing, backup validation, CSV import, goals, weekly review, and E2E reachability.

Known baseline limitations:

- Some workflows are functional but still need depth: debt repayment planning, recurring-cost confirmation, reports, and long-term trend views.
- The data model is implicit across Store events, read models, and dashboard calculations.
- Import/export is useful but not yet a polished data operations center.
- Planning projections need clearer formulas and stronger scenario controls.
- Mobile layout has smoke coverage, but dense tables still need more deliberate small-screen design.
- The old Monthly Review modal renderer still exists as a compatibility fallback, but the intended workflow is now page-native.
- Transactions has pulled forward part of Phase 5; future ledger work should focus on import profiles, categorization rules, and evidence depth rather than rebuilding the workspace shell.

## Phase 1A: Hardening The Operating Core

Status: in progress.

Goal: Make existing core workflows trustworthy before adding more product surface.

Scope:

- Normalize date-only handling around `YYYY-MM-DD`.
- Prevent timezone drift in form fields, recurring obligations, deferred dates, and pipeline expected dates.
- Keep Dashboard focused on answers, not all actions.
- Move obligation resolution into Review, where actual payments are reviewed and status decisions belong.
- Remove duplicate in-content navigation now that the global grouped shell exists.
- Add regression coverage for exact date-only behavior and review payment reachability.

Acceptance criteria:

- A selected date persists as the same calendar day.
- Recurring costs due on day 5 render as day 5, not day 4 or day 6.
- Dashboard shows obligation state and routes to Review.
- Review exposes Mark paid, Defer, and Review actions for due obligations.
- Marking an obligation paid creates a linked actual payment and removes it from the unresolved due queue.
- Unit tests, build, and E2E tests pass.

## Phase 1B: Review Queue As Real Operations

Status: implemented in the Review-first slice.

Goal: Make Review the weekly financial command center rather than a passive list.

Planned work:

- Add specific review item types with explicit actions:
  - overdue obligation
  - due-soon obligation
  - uncategorized transaction
  - actual payment needing match or categorization
  - pipeline item needing confirmation
  - debt without due date or payment plan
  - stale account balance
- Add transaction categorization from Review.
- Add payment matching from Review:
  - match existing transaction to obligation
  - mark obligation paid from matched transaction
  - leave unmatched payments as needs-review until classified
- Add pipeline actions:
  - mark received
  - cancel
  - update probability/status
  - defer expected date
- Save review decisions as durable events or review log entries, not only transient UI state.
- Show unresolved count, last reviewed date, and next review due status on Dashboard.

Acceptance criteria:

- Every Review item has at least one useful action.
- Completing a weekly review changes durable local state.
- Review no longer feels like a checklist detached from actual payments and obligations.
- The user can trust Dashboard metrics after Review is cleared.

## Phase 1C: Ledger Reliability

Status: implemented; page-native ledger hardening added in the latest slice.

Goal: Make the ledger the source of truth for actual cash movement.

Planned work:

- Document transaction semantics:
  - income
  - expense
  - transfer
  - adjustment
  - debt payment
  - obligation payment
- Require account selection for every cash-moving transaction.
- Clarify amount direction:
  - either explicit type plus positive amount, or signed amount with clear preview
  - avoid ambiguous forms
- Ensure edit/delete/reversal updates balances predictably.
- Add filters:
  - account
  - scope
  - type
  - category
  - review status
  - date range
- Add stable empty states and long-label handling.
- Add CSV export for transactions.
- Keep full ledger browsing on the Transactions page instead of routing the user into a large modal.
- Provide inline Categorize, Match, and Reverse actions in the Work/Audit views.

Acceptance criteria:

- Adding, editing, deleting, and reversing transactions produce correct account balances.
- Unclear transactions are marked needs-review.
- Ledger filters do not hide data unexpectedly.
- Exported CSV is useful for accountant or personal archive review.
- E2E coverage verifies the Transactions page as the primary ledger workspace.

## Phase 1D: Local Data Safety

Status: implemented in the Local Data Safety slice.

Goal: Make local-first behavior explicit, recoverable, and safe.

Implemented work:

- Extended `DATA_MODEL.md` with storage keys, backup metadata, restore semantics, migration policy, and recovery guidance.
- Centralized backup version/schema constants.
- Preserved version 1 to version 2 backup migration and kept version 2 compatible.
- Added corrupt local data handling:
  - explain the problem
  - offer backup import
  - offer safe reset
  - avoid blank-screen failure
- Added backup metadata:
  - schema version
  - export timestamp
  - event count
  - latest local event timestamp
  - warning if backup appears older than current data
- Added restore confirmation copy that clearly says local data will be replaced.
- Added explicit reset flow that clears only Finance Master local data in this browser.

Acceptance criteria:

- A user understands where data lives and how to back it up.
- Bad backup files do not mutate current state.
- Reset and restore flows are visible, explicit, and tested.

## Phase 1E: Structural UI Hardening

Status: initial extraction slice implemented.

Goal: Reduce controller size and prevent page/modal responsibilities from drifting back together.

Implemented work:

- Moved dashboard presentation helpers to `src/dashboard/finance-ui.js`.
- Moved section routing/composition to `src/dashboard/section-registry.js`.
- Moved shared modal rendering helpers to `src/components/modal-ui.ts`.
- Moved quick-add and transaction modal renderers to a focused workflow module.
- Kept Settings focused on preferences while Import & Backup owns data operations.
- Added a small CSS organization header and reusable primitive classes.

Acceptance criteria:

- `window.FinancialMode` and modal `data-action` entry points remain compatible.
- Settings no longer duplicates export, restore, reset, or sample-data workflows.
- Full verification suite passes after the complete hardening pass.

## Phase 2: Dashboard Clarity

Status: implemented in the Dashboard Clarity slice.

Goal: Turn the Observatory into a calm financial truth surface.

Implemented work:

- Prioritized the top hierarchy:
  1. Actually available
  2. Reserved
  3. Monthly burn
  4. Runway
  5. Action this week
  6. Next 30 days
- Added formula helper text:
  - Actually available = total active cash minus reserve buckets.
  - Runway = actually available divided by monthly burn.
  - Monthly burn = active recurring costs plus relevant debt minimums when configured.
- Added Action This Week:
  - overdue obligations
  - due within 7 days
  - overdue expected income
  - uncategorized transactions
  - unmatched actual payments
  - review due
- Added Next 30 Days:
  - confirmed incoming
  - expected weighted incoming
  - obligations due
  - projected net movement
- Reduced Dashboard noise by moving full Review Queue/detail records back to their dedicated sections.

Acceptance criteria:

- A user can understand cash safety in under one minute.
- Dashboard metrics are explainable in plain language.
- The page does not give equal weight to every metric.

## Phase 3: Planning And Forecasting

Goal: Make Planning useful for decisions without pretending to be full accounting.

Planned work:

- Strengthen income pipeline:
  - confirmed, expected, risky
  - probability as a clear percent
  - expected date
  - settlement account
  - linked transaction when received
- Add cash calendar:
  - 30/60/90-day view
  - expected income and obligations
  - projected cash balance
- Make scenario lab transparent:
  - conservative = confirmed only
  - expected = confirmed + expected weighted
  - optimistic = confirmed + expected + risky weighted
  - show date horizon and assumptions
- Add deterministic advice:
  - runway under threshold
  - reserve gap
  - too many uncategorized transactions
  - overdue expected income
  - debt without payment plan
- Keep advice rule-based. Do not label it AI.

Acceptance criteria:

- Scenario controls affect numbers visibly and predictably.
- Planning explains what changed and why.
- The user can decide whether to chase income, defer costs, reserve cash, or reduce burn.

## Phase 4: Reserves, Taxes, And Buckets

Goal: Make reserved money explicit and operational.

Planned work:

- Define reserve buckets:
  - tax
  - VAT
  - health insurance
  - debt repayment
  - buffer
  - personal survival
  - operating costs
  - custom
- Add reserve rule settings:
  - percentage of income
  - fixed monthly amount
  - applies to scope, account, or manual income
- Add reserve gap calculation:
  - target reserve
  - actual reserve cash
  - gap
- When income is received, suggest reserve allocation.
- Keep this as suggestions/local clarity, not tax filing logic.

Acceptance criteria:

- The user can see which cash is usable and which cash is reserved.
- Reserve suggestions are understandable and editable.
- No feature claims to calculate or file taxes.

## Phase 5: Debt And Fixed Cost Pressure

Goal: Make debt and fixed costs visible as runway pressure, not a hidden list.

Planned work:

- Add debt item fields:
  - creditor/name
  - current amount
  - minimum payment
  - due date
  - scope
  - payment plan note
- Make debt payment a complete workflow:
  - choose debt
  - choose account
  - amount
  - date
  - linked transaction
  - reduce debt balance
- Add debt pressure to Dashboard:
  - total debt
  - minimum monthly debt service
  - debts without plan
- Review should flag debts without due date or payment plan.

Acceptance criteria:

- Debt payments update both debt balance and account cash.
- Debt pressure influences monthly burn where appropriate.
- Debt without a plan becomes an actionable review item.

## Phase 6: Data Operations

Goal: Make imports, exports, and backups feel reliable enough for real use.

Planned work:

- Polish Data page:
  - backup export
  - backup restore
  - transaction CSV export
  - CSV import
  - latest import undo
  - seed/clear demo data
- Add import preview improvements:
  - row count
  - accepted/duplicate/rejected
  - destination account
  - review status for imported rows
- Add restore preview improvements:
  - accounts count
  - transactions count
  - settings summary
  - schema version
- Keep bank-specific mapping minimal.

Acceptance criteria:

- User can back up before risky actions.
- CSV import mistakes can be reversed.
- Imported ambiguous rows go to Review.

## Phase 7: Onboarding And Empty States

Goal: Make the app useful from zero data without fake confidence.

Planned work:

- Add onboarding checklist:
  - set base currency
  - add cash accounts
  - add reserves
  - add recurring fixed costs
  - add income pipeline
  - run first review
  - export backup
- Add empty states:
  - no accounts
  - no transactions
  - no recurring costs
  - no income pipeline
  - no review items
  - no debts
- Distinguish demo data from user data.
- Make sample restore/delete copy clear.

Acceptance criteria:

- Fresh users know the minimum setup path.
- Empty states invite action without making false claims.
- Demo data is never confused with private user financial data.

## Phase 8: Mobile And Accessibility

Goal: Make the app usable during real weekly review on a laptop, tablet, or phone.

Planned work:

- Make dense tables become safe card lists or horizontally scroll only inside contained wrappers.
- Ensure modal forms fit mobile screens.
- Add consistent labels and aria connections for errors.
- Keep keyboard navigation predictable.
- Ensure Escape/Close behavior returns focus.
- Improve status color contrast in all appearance modes.

Acceptance criteria:

- No top-level section causes horizontal page overflow on common mobile widths.
- All primary flows are keyboard reachable.
- Invalid forms expose visible, screen-reader reachable errors.

## Phase 9: Quality System

Goal: Catch regressions before deployment.

Planned work:

- Keep unit tests for:
  - date utilities
  - treasury calculations
  - forecast windows
  - currency formatting
  - persistence migrations
  - review queue generation
  - transaction balance updates
- Keep E2E tests for:
  - grouped navigation
  - important modal reachability
  - appearance persistence
  - obligation payment review
  - CSV import/undo
  - backup restore
  - weekly review
  - mobile overflow
- Add visual smoke checks for Dashboard, Review, and Planning if layout churn increases.

Acceptance criteria:

- `npm test`, `npm run build`, and `npm run test:e2e` pass before deployment.
- Tests follow product workflows, not stale prototype labels.

## Postponed Or Explicitly Out Of Scope

Keep these out of production flows unless a later strategy decision reopens them:

- Bank sync and account linking.
- PSD2 integrations.
- Automatic categorization from external providers.
- Double-entry accounting.
- Balance sheets and full P&L reports.
- DATEV export.
- Tax filing logic.
- Invoice generation.
- Receipt upload, OCR, or document archive.
- AI insights.
- Multi-user collaboration, comments, approvals, or permissions.
- Web3/DeFi portfolio UI and CoinGecko refresh as core flows.

Compatibility code for old local data may remain, but it should not create prominent UI promises.

## Release Discipline

Each implementation slice should include:

- A short product rationale.
- Scoped code changes.
- Tests for the corrected behavior.
- Build verification.
- Notes in `FEATURE_AUDIT.md`, `ROADMAP.md`, or `DATA_MODEL.md` if the product shape changes.

Preferred order:

1. Finish Phase 1A and ship it.
2. Implement Phase 1B Review operations.
3. Implement Phase 1C Ledger reliability.
4. Document the data model in Phase 1D.
5. Improve Dashboard clarity in Phase 2.
6. Expand Planning only after Review and Ledger are trustworthy.
