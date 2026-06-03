# Finance Master — 30-Phase Implementation Roadmap for Codex

## Purpose of this document

This is a **developer-facing implementation roadmap** for upgrading the Finance Master product.

Use this document as the source of truth for the next development cycle. It is written for a coding agent working inside the repository. The goal is not to add random features, but to turn Finance Master into a serious, trustworthy, local-first treasury cockpit for freelancers, creative entrepreneurs, and small studios.

The live product is currently available at:

```txt
https://mtpstudiotest.github.io/finance-master/
```

The product thesis is:

```txt
Finance Master should answer one question better than any spreadsheet:
How much money is actually available after obligations, reserves, debt plans, tax/VAT/health insurance, and upcoming cashflow reality?
```

Everything implemented should serve that goal.

---

## Agent operating instructions

Before implementing anything, inspect the current repository deeply.

Do not assume the exact structure from this roadmap if the code has changed. First locate the existing modules, domain objects, persistence layer, UI rendering pattern, tests, and build setup. Then adapt this roadmap to the existing architecture with the smallest clean refactor necessary.

Work in phases. Do not jump ahead to later phases before the safety and calculation foundations are correct.

For every phase:

1. Inspect the current implementation.
2. Identify the files and modules affected.
3. Implement incrementally.
4. Add or update tests.
5. Run all existing tests.
6. Do not break local-first behavior.
7. Do not introduce a backend, authentication, bank sync, invoice generation, AI advice, tax filing, or accounting compliance unless explicitly requested in a later task.

Use clear commits or patch groups per phase where possible.

---

## Product identity

Finance Master is not a normal budgeting app and not accounting software.

It is a **local-first treasury cockpit**.

The product should help users understand:

- actual cash
- protected cash
- available cash
- recurring obligations
- debt payment plans
- income confidence
- cashflow risk
- tax/VAT/health reserves
- monthly review status
- runway
- next actions

The product should feel:

- calm
- private
- trustworthy
- premium
- minimal
- editorial
- serious but not corporate
- useful under financial stress

Avoid turning it into:

- QuickBooks
- Xero
- DATEV
- a full double-entry accounting tool
- a tax filing tool
- a bloated dashboard full of generic charts
- a generic SaaS admin panel

---

## Global non-goals

Do not implement these unless the user explicitly asks later:

- bank account sync
- direct PSD2 integrations
- invoice PDF generation
- tax filing
- DATEV export
- payroll
- receipt OCR
- multi-user collaboration
- comments or approvals
- authentication
- cloud backend
- AI financial advice
- double-entry bookkeeping
- balance sheet accounting
- full profit-and-loss accounting
- automatic legal or tax recommendations

The strength of Finance Master is focused treasury clarity.

---

## Global technical principles

### 1. Local-first by default

All user finance data should remain local unless an explicit optional integration is enabled.

Do not introduce server persistence.

### 2. Data safety comes before features

Never add features that can corrupt, silently mutate, or delete finance data without backup and confirmation.

### 3. One calculation engine

Important financial metrics must not be calculated separately in multiple UI components.

Create or strengthen a central domain layer for:

- cash position
- protected cash
- available cash
- burn rate
- debt schedule
- reserves
- runway
- cashflow forecast
- forecast confidence

### 4. Deterministic over magical

Avoid hidden AI-like advice. Insights should be explainable from data.

### 5. Every metric needs an explanation

Important numbers should include an inline “How this is calculated” explanation.

### 6. Modals must stay focused

A modal should do one thing. Do not use modals as overloaded settings dashboards.

### 7. Tests are required

Every phase must include appropriate unit, integration, or Playwright tests.

---

## Current product understanding

Finance Master appears to be a static Vite app deployed on GitHub Pages. It is local-first and uses browser storage, primarily IndexedDB with some localStorage behavior.

Observed/expected sections:

- Overview
- Transactions
- Invoices / Income
- Cashflow Plan
- Monthly Review
- Cash & Reserves
- Fixed Costs & Debt
- Reports
- Import & Backup
- Settings

Known important risk from analysis:

```txt
A URL behavior like ?repair=demo appears to clear local Finance Master data. This must be removed or production-gated immediately.
```

Important existing product concepts:

- runway
- protected cash
- attention queue
- 30-day outlook
- forecast confidence
- import/backup
- CSV import preview
- monthly review
- debt plans
- fixed costs
- reserves
- local-first storage

---

## Current implementation status — 2026-06-03

This section records the latest implemented roadmap slices so future work can adapt the roadmap to the actual product state.

### Completed foundation slices

- Phase 1 data-safety hardening is implemented:
  - URL-based repair/reset no longer deletes local finance data.
  - Destructive reset, restore, sample restore, and sample delete flows use typed confirmation.
  - Import & Backup includes local data health metadata, schema/backup status, storage status, and last backup metadata.
  - Migration guardrails exist for the current local-first schema without changing stored data shape.
- Phase 2 calculation stabilization is implemented:
  - Recurring costs normalize weekly, biweekly, monthly, quarterly, and yearly equivalents.
  - Debt payment plans contribute to burn and runway without double-counting linked recurring obligations.
  - Actual cash, protected cash, committed short-term obligations, available cash, legacy cash-after-reserves, monthly burn, runway, forecast confidence, and debt burden are centralized in the finance context.
  - Metric explanations are returned from the compute layer for future surfaces, while the current Overview keeps the cockpit visually minimal without explanation dropdowns.
- Phase 3 IA simplification is implemented:
  - Visible navigation now follows the roadmap language: Overview, Cashflow, Transactions, Income, Obligations, Reserves, Monthly Review, Reports, Import & Backup, Settings.
  - Internal section IDs remain compatible with older stored values.
  - Settings is limited to app preferences and routes data safety work to Import & Backup.

### Latest UI simplification slices

- Overview has moved from a large attention queue to a calmer Money Picture cockpit:
  - dominant runway signal
  - 30-day projected result with a lightweight trend line
  - cash structure
  - burn pressure
  - route to Cash Movement for review work
- Transactions has been redesigned into a Ledger Workspace:
  - A compact status strip replaces large KPI cards.
  - Ledger and Review are the only visible modes.
  - The earlier Audit mode was removed from the visible workflow after review; technical evidence now lives in the transaction inspector.
  - The page uses a two-column desktop layout with transaction list on the left and inspector on the right.
  - On mobile/tablet the inspector stacks without horizontal overflow.
  - The old `clean | work` stored values are preserved; old/stored `audit` values safely fall back to Ledger.
- Phase 5 transaction/data depth has begun:
  - CSV imports save the last successful mapping profile for matching headers and reuse it on later imports.
  - Import profiles stay in local import state and are included in backup/restore validation.
  - Transaction review shows deterministic category suggestions from existing ledger categories and recurring obligations, but never mutates data until the user confirms the review.
- Monthly Review has been simplified into an inline dashboard workflow:
  - The monthly close flow now lives directly on the Monthly Review page instead of opening a large modal by default.
  - Cash account reconciliation, review steps, review note, inline validation, and Close month are part of the page.
  - Overview review actions route to the Monthly Review page instead of opening the old modal.
  - Review queue, expected obligations, and actual payments use one edit icon per row instead of multiple text buttons.
  - The old modal renderer remains in code as a compatibility/fallback path, but it is no longer the intended product path.
- Cross-section row actions now follow the same quieter pattern in Reserves, Income, Cashflow pipeline rows, recurring costs, and debt cards:
  - Row-level edit/received/archive/plan/payment actions are icon-first with accessible labels.
  - Top-level creation and navigation buttons remain text buttons where the command needs to be explicit.

### Tests currently covering this baseline

The latest local validation passed:

```txt
npm test
npm run typecheck
npm run build
npm run test:e2e
```

The e2e suite covers:

- roadmap navigation labels and aliases
- Overview Money Picture structure and compact cockpit metrics
- compact Quick Add menu
- Ledger Workspace filters, inspector, Review mode actions, and absence of Audit mode
- local data repair/reset safety
- Import & Backup safety
- Monthly Review inline close workflow
- icon-based review actions for transaction categorization, payment matching, pipeline review, and debt plan confirmation
- mobile/tablet no-horizontal-overflow checks

### Roadmap adaptation notes

- Phase 3 should be treated as substantially complete for IA and cockpit simplification. Remaining Phase 3 work is polish, density reduction, and consistent icon/action patterns.
- Phase 5’s Transactions workspace requirements are partially pulled forward and implemented. Import profiles and category suggestions are now started; future Phase 5 work should focus on deeper transaction evidence, import profile management, and matching depth rather than recreating the ledger workspace.
- Phase 8’s Monthly Review ritual is partially pulled forward and implemented. Future Phase 8 work should refine the review ritual, monthly summary, reserve review, and review history, not reintroduce the large review modal.
- Product direction learned from the latest review:
  - Avoid “Audit” as a primary user-facing mode unless a later professional/accountant export surface explicitly needs it.
  - Avoid repeated text-button clusters in operational rows; prefer one clear edit/action icon that opens the focused workflow.
  - Avoid heavy dark cards on the light/aurora surface; use readable, high-contrast light cards.
  - Prefer page-native workflows for important operating rituals; keep modals focused on a single edit or confirmation.

### Recommended next slices

1. **Complete focused Phase 3 polish**
   - Standardize cross-page surfaces, outlines, status pills, spacing, dark-mode readability, and icon-first row actions.
   - Keep Overview compact and do not reintroduce explanation dropdowns there.
   - Keep calculation and data safety untouched unless a test exposes a regression.
2. **Then continue Phase 5 transaction/data depth**
   - Transaction evidence depth, import profile management, and richer matching support.
   - Do not rebuild the Ledger Workspace shell or expose Audit as a primary mode.
3. **Then continue Phase 8 monthly review depth**
   - Review history, monthly summary, reserve review, and review completion narrative.
   - Keep the ritual page-native and avoid returning to the large review modal.

---

# Phase 1 — Data Safety, Storage Integrity & Production Hardening

## Objective

Make Finance Master safe enough to trust with real financial data.

This phase is mandatory before feature expansion.

## Primary risks to solve

- destructive URL-based repair/reset behavior
- unclear browser storage durability
- insufficient backup/restore safety
- no visible data health system
- migration risk
- private/incognito storage limitations
- potential silent data loss

---

## Required implementation work

### 1. Remove or production-gate destructive URL repair behavior

Search for any implementation similar to:

```txt
repairLocalFinanceDataFromUrl
?repair=demo
repair=demo
indexedDB.deleteDatabase
localStorage.removeItem
```

Required behavior:

- In production, no URL parameter may automatically delete user finance data.
- If repair/reset functionality is needed for development, gate it behind a development-only condition.
- If repair/reset functionality remains in production, it must be an explicit in-app flow with typed confirmation.

Safe destructive reset flow must include:

- explanation of what will be deleted
- recommendation to export a backup first
- typed confirmation, for example `DELETE LOCAL FINANCE DATA`
- final confirmation button
- no silent deletion
- no deletion just from opening a URL

### 2. Add a data health system

Create a data health diagnostic service.

It should check:

- IndexedDB availability
- localStorage availability
- storage quota if available through browser APIs
- current schema version
- latest successful save timestamp
- latest backup timestamp if tracked
- whether app appears to run in private/incognito-like storage mode
- whether migration is pending
- whether migration failed
- whether repository reads/writes are healthy

Expose this in **Import & Backup**, not Settings.

Suggested UI section:

```txt
Data Health
Storage: Healthy / Limited / Unavailable
Last saved: date/time
Last backup: date/time or Never
Schema version: x.y.z
Migration status: Current / Pending / Failed
Private mode warning: shown only when relevant
```

### 3. Add safe migration infrastructure

If not already present, introduce explicit schema migration discipline.

Each schema version should have:

- version identifier
- migration function
- validation before migration
- pre-migration backup snapshot
- post-migration validation
- error handling
- recovery path
- tests for old schema fixtures

Migration failure must never leave the app in a half-mutated state without warning.

### 4. Improve backup restore safety

Restore flow should validate and preview incoming data before replacing current data.

Preview should show:

- backup creation date
- backup app version
- backup schema version
- number of accounts
- number of transactions / ledger events
- number of income items / invoices
- number of fixed costs
- number of debts
- number of reserve buckets
- number of import batches if applicable
- current data summary
- incoming data summary

Restore modes:

- Preview only
- Replace current data

Do not expose “merge” unless merge is truly implemented.

Before replacement, require explicit confirmation.

### 5. Add backup prompts at high-risk moments

Prompt for backup before:

- reset
- restore
- schema migration
- first major real-data entry if no backup exists
- monthly close if no backup exists
- destructive import undo if it affects many rows

This should be calm and non-annoying.

### 6. Add malformed backup protection

Malformed backup files must:

- be rejected
- not mutate existing data
- show clear error copy
- disable destructive restore action

### 7. Add private/incognito storage warning

If storage seems ephemeral or unavailable, show a warning near Import & Backup and possibly on first launch.

Copy direction:

```txt
Your browser may not keep local data permanently in this mode. Export a backup before closing this window.
```

---

## Files/modules to inspect

Look for:

```txt
src/main.ts
src/persistence/*
src/store/*
src/repositories/*
src/backup/*
src/import/*
src/components/*backup*
src/dashboard/*backup*
tests/e2e/*
```

Adapt to actual repository structure.

---

## Tests required

Add or update tests for:

- opening URL with `?repair=demo` does not delete data in production mode
- reset requires explicit confirmation
- backup export creates valid JSON
- restore preview displays summary
- malformed backup is rejected
- restore does not mutate data until confirmation
- migration from previous schema version succeeds
- migration failure preserves prior data or shows recovery state
- private/incognito-like storage limitation message appears when storage is unavailable or simulated unavailable

---

## Acceptance criteria

Phase 1 is complete when:

- no URL can wipe finance data silently
- reset/restore flows are explicit and safe
- backup preview is informative
- malformed backups cannot corrupt data
- data health is visible in Import & Backup
- migration paths are tested
- private/incognito limitations are communicated
- all existing tests pass

---

# Phase 2 — Financial Logic Audit & Domain Model Stabilization

## Objective

Make all financial calculations trustworthy, explainable, and centralized.

Finance Master is useless if the numbers are ambiguous or double-counted.

---

## Required financial definitions

Implement or standardize these definitions.

### Actual Cash

Money currently held in accounts, wallets, or cash buckets.

Formula:

```txt
Actual Cash = sum of included liquid account balances
```

Do not include unpaid invoices or expected income.

### Protected Cash

Money that exists but is reserved for specific purposes.

Examples:

- VAT reserve
- income tax reserve
- health insurance reserve
- debt repayment reserve
- emergency buffer
- studio rent reserve
- project-specific reserve

Formula:

```txt
Protected Cash = sum of active reserve bucket balances
```

### Available Cash

The most important number in the product.

Formula:

```txt
Available Cash = Actual Cash - Protected Cash - committed short-term obligations
```

Committed short-term obligations should include confirmed obligations due within the selected horizon, usually 30 days.

### Monthly Burn Rate

Monthly burn rate must include predictable recurring obligations.

Formula:

```txt
Monthly Burn Rate = fixed monthly costs + normalized recurring costs + active debt payment plans + minimum required obligations
```

Important rule:

```txt
If a debt has a payment plan, the monthly equivalent must be included in recurring costs and monthly burn rate.
```

Examples:

```txt
€250 monthly debt payment -> €250/month
€600 quarterly debt payment -> €200/month
€1,200 yearly debt payment -> €100/month
€100 weekly debt payment -> about €433/month
€50 biweekly debt payment -> about €108/month
```

### Runway

Primary formula:

```txt
Runway = Available Cash / Monthly Burn Rate
```

Also support variants if useful:

```txt
Actual-cash runway = Actual Cash / Monthly Burn Rate
Protected-adjusted runway = Available Cash / Monthly Burn Rate
Conservative forecast runway = forecast-based ending cash / monthly burn
```

Do not present total-cash runway as the only truth.

### Forecast Confidence

Forecast confidence should reflect data quality and income certainty.

Inputs may include:

- confirmed income
- open invoices
- expected income probability
- overdue items
- recurring costs completeness
- debts with or without payment plan
- last monthly review date
- unresolved transaction count
- backup/data health status

---

## Required implementation work

### 1. Create or consolidate a financial calculation engine

All important calculations should live in domain-level modules, not scattered UI code.

Suggested modules:

```txt
src/domain/cash-position.ts
src/domain/burn-rate.ts
src/domain/runway.ts
src/domain/reserves.ts
src/domain/debt-schedule.ts
src/domain/cashflow-forecast.ts
src/domain/forecast-confidence.ts
src/domain/recurrence.ts
src/domain/financial-snapshot.ts
```

Adapt names to current architecture.

### 2. Standardize canonical entities

Create or refine TypeScript types.

#### Account

```ts
type Account = {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'wallet' | 'paypal' | 'wise' | 'crypto' | 'other';
  currency: string;
  openingBalance?: number;
  currentBalance: number;
  includedInRunway: boolean;
  scope: 'personal' | 'business' | 'studio' | 'shared';
  archived?: boolean;
};
```

#### Transaction

```ts
type Transaction = {
  id: string;
  date: string;
  type: 'income' | 'expense' | 'transfer' | 'adjustment';
  amount: number;
  accountId: string;
  category?: string;
  counterparty?: string;
  note?: string;
  source?: 'manual' | 'csv' | 'import' | 'system';
  importBatchId?: string;
  linkedInvoiceId?: string;
  linkedDebtId?: string;
  linkedObligationId?: string;
  linkedReserveBucketId?: string;
  tags?: string[];
  scope: 'personal' | 'business' | 'studio' | 'shared';
  reviewed?: boolean;
};
```

#### Income Item / Invoice

```ts
type IncomeItem = {
  id: string;
  client: string;
  project?: string;
  amountNet: number;
  amountVat?: number;
  amountGross: number;
  invoiceDate?: string;
  expectedDate?: string;
  dueDate?: string;
  status: 'lead' | 'proposal' | 'expected' | 'confirmed' | 'invoiced' | 'due' | 'overdue' | 'paid' | 'cancelled' | 'lost';
  probability: number;
  confidence?: 'low' | 'medium' | 'high';
  linkedTransactionId?: string;
  scope: 'personal' | 'business' | 'studio' | 'shared';
  tags?: string[];
  notes?: string;
};
```

#### Fixed Cost / Obligation

```ts
type Obligation = {
  id: string;
  name: string;
  amount: number;
  recurrence: RecurrenceRule;
  nextDueDate?: string;
  category?: string;
  paymentMethod?: string;
  active: boolean;
  scope: 'personal' | 'business' | 'studio' | 'shared';
  linkedDebtId?: string;
};
```

#### Debt

```ts
type Debt = {
  id: string;
  creditor: string;
  principalOriginal?: number;
  currentBalance: number;
  interestRate?: number;
  paymentPlan?: DebtPaymentPlan;
  minimumPayment?: number;
  recurrence?: RecurrenceRule;
  nextDueDate?: string;
  status: 'active' | 'paused' | 'settled' | 'disputed';
  linkedTransactionIds?: string[];
  scope: 'personal' | 'business' | 'studio' | 'shared';
  notes?: string;
};
```

#### Reserve Bucket

```ts
type ReserveBucket = {
  id: string;
  name: string;
  targetAmount?: number;
  currentAmount: number;
  reserveRule?: ReserveRule;
  linkedCategory?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  scope: 'personal' | 'business' | 'studio' | 'shared';
  active: boolean;
};
```

### 3. Implement recurrence normalization

Create one recurrence utility used everywhere.

It must support at least:

- weekly
- biweekly
- monthly
- quarterly
- yearly
- custom interval if already supported

It should output:

- monthly equivalent
- next due dates within horizon
- occurrences within horizon

### 4. Prevent double-counting

Implement explicit rules:

- transfers do not count as income or expense
- invoice-linked incoming transactions do not double-count expected income
- debt payment plans count in burn rate once
- if a debt payment is represented as an obligation, it must not also be counted separately
- reserve transfers are not expenses unless they leave the financial system
- VAT reserve should not reduce revenue twice
- imported duplicates are ignored or reviewed, not counted twice

### 5. Add calculation explainers

Each important metric should expose explainable parts.

Example return object:

```ts
type ExplainedMetric = {
  value: number;
  label: string;
  parts: Array<{
    label: string;
    value: number;
    operation?: 'add' | 'subtract' | 'multiply' | 'divide';
  }>;
  warnings?: string[];
};
```

Use explainers for:

- actual cash
- protected cash
- available cash
- burn rate
- runway
- forecast confidence
- reserve coverage
- debt burden

---

## Tests required

Add unit tests for:

- monthly burn rate with monthly costs
- quarterly/yearly/weekly/biweekly normalization
- debt payment plan included in burn rate
- debt payment not double-counted if linked to fixed cost/obligation
- transfers excluded from income/expense
- invoice payment matching does not double-count income
- reserve bucket reduces available cash but not actual cash
- runway based on available cash
- forecast confidence changes when overdue/open/unreviewed data changes

---

## Acceptance criteria

Phase 2 is complete when:

- all key metrics come from a central financial engine
- debt plans are included in monthly burn rate
- recurrence normalization is shared across the app
- double-counting protections exist
- metric explanations are available to the UI
- tests cover calculation edge cases
- all existing tests pass

---

# Phase 3 — Information Architecture & UX Simplification

## Objective

Make the app feel like a calm financial operating system instead of a collection of widgets and overloaded modals.

---

## Product structure

Use this conceptual hierarchy:

### Layer 1 — Calm answer

```txt
What is my financial situation right now?
```

This is the Overview.

### Layer 2 — Operating workflows

```txt
What do I need to update, review, import, or resolve?
```

This includes transactions, income, obligations, reserves, cashflow, monthly review.

### Layer 3 — System and safety

```txt
How is my data stored, backed up, configured, and protected?
```

This includes Import & Backup and Settings.

---

## Recommended navigation

Use or evolve toward this structure:

```txt
Overview
Cashflow
Transactions
Income
Obligations
Reserves
Monthly Review
Reports
Import & Backup
Settings
```

If current names differ, keep compatibility but improve clarity.

---

## Settings cleanup

Settings should only contain true app-level settings.

Settings may include:

- currency
- appearance
- reduced motion
- default forecast horizon
- default scope filter
- demo data toggle
- external price source preference
- data display preferences

Settings must not include:

- fixed cost editing
- debt editing
- reserve bucket editing
- income pipeline setup
- import mapping
- monthly review tasks
- duplicate workflows that exist elsewhere

Move those to their real product sections.

---

## Modal rules

A modal should do one thing.

Allowed modal examples:

- add transaction
- add expected income
- add fixed cost
- add debt payment plan
- add reserve bucket
- confirm restore
- confirm reset
- import CSV

Avoid:

- full settings in a modal
- mixed system and finance setup modals
- huge multi-purpose modals
- repeated controls already available on dashboards
- modals with too much explanatory text

Use side panels or dedicated pages for complex editing.

---

## Quick Add redesign

The floating “New entry” action should behave like a focused command menu.

Options:

```txt
Add transaction
Add expected income
Add fixed cost
Add debt payment plan
Add reserve bucket
Import CSV
```

Each option should open a dedicated focused flow.

---

## Overview redesign

Overview should answer questions in this order:

### 1. Current status

Show:

- available cash
- protected cash
- runway
- 30-day outlook
- forecast confidence

### 2. Attention queue

Only show items requiring a decision or review.

Examples:

- uncategorized transactions
- overdue invoices
- VAT reserve below target
- debt payment due soon
- missing debt payment plan
- no backup in many days
- monthly review overdue

### 3. Near future

Show:

- next 7 days
- next 30 days
- expected income
- confirmed obligations
- net position

### 4. Strategic picture

Show:

- burn rate
- revenue confidence
- reserve coverage
- debt pressure

---

## UX copy rules

Use calm, plain language.

Good:

```txt
Available cash after protected reserves and confirmed obligations.
```

Bad:

```txt
Liquidity availability score based on multi-factor treasury abstraction.
```

---

## Tests required

Add or update Playwright tests for:

- settings only contains true app settings
- Quick Add opens focused choices
- each Quick Add option opens the correct focused flow
- Overview contains current status, attention queue, near future, strategic picture
- no overloaded settings modal remains
- mobile navigation still works
- no horizontal overflow

---

## Acceptance criteria

Phase 3 is complete when:

- navigation has a clear mental model
- settings is not a junk drawer
- finance entities are edited in their own sections
- Quick Add is focused
- Overview shows fewer but stronger cards
- complex workflows are not hidden in overloaded modals
- mobile UX remains intact
- all tests pass

---

# Phase 4 — First-Run Setup & Onboarding

## Objective

Make the product understandable and useful for a new user without requiring them to understand the whole system first.

---

## First-run entry choices

On first launch, ask:

```txt
How do you want to start?
```

Options:

```txt
Explore with demo data
Start with my real numbers
Import from CSV
Restore backup
```

User must be able to skip onboarding and restart it later.

---

## Setup wizard

Keep the wizard short and calm.

### Step 1 — Choose profile

Options:

- Freelancer / solo creative
- Small studio
- Personal finance
- Mixed personal + business

This should influence suggested categories and reserve buckets.

### Step 2 — Base currency

Default:

```txt
EUR
```

Editable.

### Step 3 — Add current cash

Ask for account balances.

Suggested account examples:

- main business account
- personal account
- cash
- PayPal
- Wise
- crypto wallet optional

### Step 4 — Add protected reserves

Suggest reserve buckets:

- VAT
- income tax
- health insurance
- debt repayment
- emergency buffer

### Step 5 — Add monthly obligations

Examples:

- rent
- health insurance
- software
- studio
- phone
- transport
- debt payment plan

Important:

```txt
Debt payment plans added here must be included in monthly burn rate.
```

### Step 6 — Add expected income

Ask for:

- open invoices
- expected project payments
- retainers
- recurring clients

### Step 7 — Finish with first overview

After setup, show:

- available cash
- monthly burn rate
- runway
- reserve coverage
- first recommended action

---

## Demo data behavior

Demo data must be clearly labeled.

The user should always know:

```txt
You are viewing demo data.
```

Provide actions:

- replace demo with real data
- reset demo data
- start fresh
- restore backup

Do not silently mix demo and real data.

---

## Empty states

Every major section needs a useful empty state.

Examples:

### Fixed costs empty state

```txt
Add rent, health insurance, subscriptions, studio costs, or debt payment plans to calculate your real monthly burn rate.
```

### Reserve buckets empty state

```txt
Reserve buckets separate money that exists from money that is actually available.
```

### Expected income empty state

```txt
Add open invoices, retainers, or likely project payments to improve your forecast.
```

### Transactions empty state

```txt
Add a transaction manually or import a CSV to begin reviewing your cash movement.
```

---

## Tests required

Add tests for:

- first-run choices appear on clean state
- demo data is clearly labeled
- start with real numbers creates accounts/reserves/obligations correctly
- debt payment plan from onboarding affects burn rate
- import route from onboarding opens CSV import
- restore route from onboarding opens restore flow
- onboarding can be skipped
- onboarding can be restarted later
- empty states appear in empty sections

---

## Acceptance criteria

Phase 4 is complete when:

- a new user can start with demo, manual setup, CSV import, or restore
- empty states explain the product concepts
- debt setup is included in onboarding
- reserve buckets are introduced clearly
- demo data cannot be confused with real data
- onboarding is skippable and restartable
- all tests pass

---

# Phase 5 — Import, Ledger & Transaction Workflow Upgrade

## Objective

Make Transactions a reliable raw data workspace without making it the emotional center of the app.

Transactions support clarity. They are not the core product experience.

---

## CSV import improvements

### 1. Column mapping

Support mapping for:

- date
- amount
- description
- counterparty
- category
- account
- currency
- type
- reference
- balance optional

### 2. Bank/profile presets

Add import profiles such as:

- Generic CSV
- N26
- Wise
- PayPal
- Revolut
- Sparkasse manual export
- Custom saved profile

Do not overpromise perfect bank support. Saved mappings are enough.

### 3. Import preview

Before committing import, show:

- accepted rows
- duplicate rows
- rejected rows
- rows with warnings
- total income
- total expenses
- date range
- affected account

### 4. Duplicate detection

Detect duplicates using:

- date
- amount
- description
- counterparty
- account
- import source
- reference ID if available

Allow:

- skip duplicates
- import anyway
- review manually

### 5. Reversible import batches

Every import should create an `importBatchId`.

User can:

- view import batch
- undo entire import
- see summary
- inspect rejected rows

---

## Transaction workspace requirements

Transactions section should support:

- search
- date range filter
- category filter
- account filter
- scope filter
- type filter
- import batch filter
- unreviewed filter
- uncategorized filter
- linked/unlinked filter

---

## Transaction detail panel

Use a side panel or focused detail view instead of crowded row editing.

Fields:

- date
- amount
- type
- account
- category
- counterparty
- note
- tags
- linked invoice
- linked debt
- linked fixed cost / obligation
- linked reserve bucket
- source/import batch
- review status

---

## Rule-based categorization

Implement transparent rules, not AI.

Examples:

```txt
Description contains "TK" -> Health insurance
Counterparty contains "Adobe" -> Software
Amount/date matches fixed cost -> Suggest obligation match
Incoming amount matches open invoice -> Suggest invoice payment match
```

User should approve suggestions.

---

## Tests required

Add tests for:

- CSV column mapping
- saved import profile
- import preview summary
- duplicate detection
- skip duplicates
- import anyway
- undo import batch
- rejected rows handling
- transaction filters
- transaction detail editing
- invoice linking
- debt linking
- fixed cost/obligation linking
- reserve linking
- categorization suggestion approval

---

## Acceptance criteria

Phase 5 is complete when:

- CSV import is safe, previewed, and reversible
- saved import mappings work
- duplicates are handled safely
- transaction filters support review workflows
- transaction detail view is not overloaded
- transactions can link to invoices, debts, obligations, and reserves
- import batch undo works
- all tests pass

---

# Phase 6 — Income Pipeline, Invoices & Revenue Confidence

## Objective

Make income reality visible.

For freelancers and small studios, financial stress often comes from uncertain, late, or lumpy income. This phase should make Finance Master excellent at answering:

```txt
What money is coming, how reliable is it, and when does it actually matter?
```

---

## Scope decision

Do not build full invoice generation yet.

Finance Master can track invoices and expected income, but it should not replace invoicing software in this phase.

---

## Income item types

Support:

- confirmed invoice
- open invoice
- expected project payment
- retainer
- verbal commitment
- proposal sent
- lead/opportunity
- recurring income
- manual expected income

---

## Income fields

Each income item should include:

- client
- project
- amount net
- VAT amount
- gross amount
- expected payment date
- invoice date
- due date
- status
- probability
- confidence level
- notes
- linked transaction
- scope
- tags

---

## Status model

Recommended statuses:

```txt
lead
proposal
expected
confirmed
invoiced
due
overdue
paid
cancelled
lost
```

---

## Probability defaults

Suggested defaults:

```txt
paid: 100
invoiced: 95
confirmed: 90
retainer: 90
verbal commitment: 70
expected: 60
proposal: 40
lead: 15
lost/cancelled: 0
```

User can override probabilities.

---

## Forecast inclusion

### Conservative forecast

Include:

- paid
- confirmed
- invoiced with high probability

### Expected forecast

Include:

- conservative items
- expected income above threshold
- recurring income

### Optimistic forecast

Include:

- expected items
- proposals
- likely leads
- user-selected upside items

---

## Overdue logic

Flag:

- due soon
- due today
- overdue
- severely overdue
- payment received but not matched
- partially paid invoice

---

## Income dashboard requirements

Show:

- open income
- expected next 30 days
- overdue amount
- weighted expected income
- confirmed income
- income by client
- income by confidence
- retainer vs project income

---

## Tests required

Add tests for:

- status transitions
- probability defaults
- user probability override
- conservative/expected/optimistic forecast inclusion
- overdue detection
- severe overdue detection
- transaction matching to invoice
- partial payment
- retainer recurrence
- VAT separation
- income dashboard summary

---

## Acceptance criteria

Phase 6 is complete when:

- income pipeline has clear statuses
- expected income affects forecasts based on probability
- invoices can be matched to transactions
- overdue income appears in attention queue
- retainers can recur
- VAT can be separated from gross income
- income reliability is visible
- all tests pass

---

# Phase 7 — Cashflow Forecasting & Scenario Engine

## Objective

Make Finance Master the place where the user can see enough of the future to make decisions.

---

## Forecast horizons

Support:

- 7 days
- 30 days
- 60 days
- 90 days
- 180 days
- custom horizon

Default can be 90 days unless current settings indicate otherwise.

---

## Forecast scenarios

### Conservative

Includes:

- actual cash
- confirmed obligations
- fixed costs
- debt payment plans
- confirmed income only
- high-probability invoices

### Expected

Includes:

- conservative items
- expected income above probability threshold
- recurring income
- normal reserve contributions

### Optimistic

Includes:

- expected items
- proposals
- likely leads
- user-selected upside items

---

## Forecast output

Forecast engine should output:

- starting cash
- incoming cash
- outgoing cash
- reserve movements
- debt payments
- ending cash
- lowest cash point
- date where available cash becomes risky
- runway estimate
- confidence score
- warnings
- event list by date

---

## Cash danger detection

Flag:

- negative available cash
- protected cash being used unintentionally
- reserve below target
- debt payment due with insufficient available cash
- burn rate too high for current runway
- overdue income needed to stay safe
- forecast confidence too low
- unreviewed data affecting forecast

---

## Decision prompts

Prompts should be deterministic and explainable.

Examples:

```txt
If this invoice is paid on time, runway extends from 1.8 to 3.1 months.
Without expected income, available cash drops below zero on 2026-07-12.
Debt payment plans add €220/month to burn rate.
VAT reserve is €480 below target.
```

Avoid generic advice.

---

## Scenario editing

Allow temporary scenario changes:

- delay income by 14 days
- mark proposal as lost
- add one-off expense
- add project payment
- increase fixed cost
- pause reserve contribution
- increase debt payment

Important:

```txt
Scenario changes must not mutate real data unless explicitly saved.
```

Create a scenario object model if needed:

```ts
type ScenarioOverride = {
  id: string;
  type: 'delay-income' | 'cancel-income' | 'add-expense' | 'add-income' | 'change-obligation' | 'pause-reserve' | 'change-debt-payment';
  targetId?: string;
  value: unknown;
  description: string;
};
```

---

## Tests required

Add tests for:

- each forecast horizon
- conservative forecast inclusion rules
- expected forecast inclusion rules
- optimistic forecast inclusion rules
- recurring costs appear on correct dates
- debt payments appear on correct dates
- reserve movements affect available cash
- lowest cash point calculation
- danger warnings
- scenario override does not mutate real data
- saved scenario intentionally mutates or persists only when confirmed

---

## Acceptance criteria

Phase 7 is complete when:

- forecast supports multiple horizons
- scenarios are distinct and explainable
- debt plans affect future cashflow
- recurring obligations appear correctly
- danger warnings feed the attention queue
- temporary scenario edits do not corrupt real data
- all tests pass

---

# Phase 8 — Monthly Review Ritual & Financial Operating System

## Objective

Turn Finance Master from a dashboard into a repeatable monthly operating ritual.

This is one of the most important product phases.

---

## Monthly Review purpose

The review should help the user:

- clean up transactions
- match income
- check obligations
- review reserves
- update debts
- close the month mentally
- understand what changed
- decide next actions

---

## Monthly Review structure

### 1. Review status

Show:

- month being reviewed
- last review date
- review completeness
- unresolved items
- data confidence
- backup status

### 2. Unresolved transactions

Tasks:

- categorize
- link to income
- link to debt
- link to fixed cost
- mark as transfer
- assign scope
- add note
- mark reviewed

### 3. Income reconciliation

Tasks:

- match paid invoices
- mark overdue invoices
- update expected income
- adjust probability
- cancel lost income
- confirm retainers

### 4. Obligation check

Tasks:

- confirm fixed costs paid
- check upcoming costs
- update recurring amounts
- add missing fixed costs
- add debt payment plans
- verify debt payments are included in burn rate

### 5. Reserve review

Tasks:

- VAT reserve sufficient?
- tax reserve sufficient?
- health insurance reserve sufficient?
- debt reserve sufficient?
- emergency buffer status?

### 6. Month close

Checklist:

- transactions reviewed
- income updated
- obligations updated
- reserves checked
- debts updated
- backup created or intentionally skipped
- notes added

Then:

```txt
Mark month complete
```

---

## Automatic review queue generation

Generate review items for:

- uncategorized transaction
- imported but unreviewed transaction
- incoming payment may match invoice
- debt exists without payment plan
- fixed cost due but no matching payment
- reserve below target
- no backup after major changes
- expected income date passed
- monthly review overdue
- forecast confidence low due to stale data

---

## Monthly summary

After review, generate a plain-language deterministic summary:

- starting cash
- ending cash
- net movement
- income received
- expenses paid
- debt paid
- reserves increased/decreased
- runway changed
- main risk next month
- main action next month

Do not use AI. Generate from data.

---

## Tests required

Add tests for:

- review queue generation
- categorization task completion
- invoice matching task completion
- debt without payment plan task
- reserve below target task
- fixed cost matching task
- backup prompt during review
- closing month
- reopening closed month with warning
- monthly summary generation
- review status updates on Overview

---

## Acceptance criteria

Phase 8 is complete when:

- Monthly Review guides the user step by step
- review queue is generated from real data
- user can close a month
- closed months create snapshots
- closed months can be reopened with warning
- Overview reflects review status
- reports can use closed-month snapshots
- all tests pass

---

# Phase 9 — Reports, Insights & Decision Layer

## Objective

Give meaningful financial understanding without becoming full accounting software.

Reports should reveal patterns that affect survival, confidence, and decisions.

---

## Reports to build

### 1. Monthly Cash Summary

Show:

- starting cash
- ending cash
- net cash movement
- income received
- expenses paid
- debt paid
- reserve movement
- available cash movement

### 2. Burn Rate Report

Show:

- current monthly burn
- fixed costs
- debt plans
- subscriptions
- rent/studio
- health insurance
- tools/software
- personal/business/studio split
- change from last month

### 3. Runway Report

Show:

- current runway
- runway trend
- conservative runway
- expected runway
- protected-cash-adjusted runway
- lowest projected cash point

### 4. Reserve Coverage Report

Show:

- VAT reserve target vs current
- tax reserve target vs current
- health reserve target vs current
- debt reserve target vs current
- emergency buffer progress

### 5. Income Reliability Report

Show:

- paid income
- open invoices
- overdue invoices
- expected income
- weighted expected income
- client concentration
- retainer vs project ratio

### 6. Debt Pressure Report

Show:

- total debt
- monthly debt payment burden
- debt payments as percentage of burn rate
- upcoming payments
- debt runway impact
- debts without payment plan

### 7. Attention History

Show repeated issues:

- recurring overdue invoices
- repeated reserve shortages
- missing categories
- late reviews
- backup gaps
- repeated debt pressure warnings

---

## Insight rules

Insights must be deterministic and explainable.

Good examples:

```txt
Debt payment plans make up 18% of monthly burn.
Your available runway is shorter than your actual-cash runway because €3,200 is protected.
Two clients represent 74% of expected income.
Your VAT reserve is below target by €620.
You have not closed a monthly review in 41 days.
```

Avoid:

```txt
You should probably change your business model.
You are doing great.
AI thinks your finances are risky.
```

---

## Export reports

Support at least:

- copy as Markdown/text
- export JSON snapshot
- CSV summary export where useful

PDF can wait unless already easy.

---

## Tests required

Add tests for:

- each report calculation
- reports use closed-month snapshots when available
- reports distinguish actual cash from expected income
- debt burden report includes debt payment plans
- reserve coverage report is accurate
- income reliability report uses probabilities
- deterministic insight generation
- Markdown/text export
- JSON snapshot export

---

## Acceptance criteria

Phase 9 is complete when:

- reports are not generic chart filler
- reports explain runway, reserves, income reliability, burn, debt pressure
- insights are deterministic
- reports can be copied/exported
- closed-month snapshots are used where possible
- all tests pass

---

# Phase 10 — Product Polish, Accessibility, Performance, SEO & Release Readiness

## Objective

Prepare Finance Master to feel like a polished, trustworthy product rather than a prototype.

---

## Visual design direction

The interface should feel like:

```txt
high-end private cockpit
premium local-first finance console
calm editorial dashboard
```

It should not feel like:

```txt
generic office SaaS
spreadsheet clone
corporate admin panel
crypto trading dashboard
```

---

## UI polish tasks

### Layout

Improve:

- spacing rhythm
- hierarchy
- section intros
- empty states
- mobile hierarchy
- transaction rows
- side panels
- modal simplicity
- attention queue clarity

### Typography

Use:

- clear number hierarchy
- tabular numerals for financial values
- readable labels
- strong contrast
- less tiny grey text

### Components

Standardize:

- cards
- metric cards
- buttons
- inputs
- selects
- tags
- status pills
- alerts
- review items
- side panels
- modals
- toasts
- empty states

### Design tokens

Create or refine tokens for:

- spacing
- radius
- font sizes
- borders
- shadows
- semantic colors
- status colors
- motion rules

---

## Accessibility requirements

Minimum requirements:

- keyboard navigation
- visible focus states
- skip link
- proper heading order
- dialog focus trap
- escape closes modal
- screen reader labels
- sufficient color contrast
- reduced motion support
- no horizontal mobile overflow
- form validation announced accessibly
- buttons have accessible names
- nav state is announced correctly

Add automated accessibility checks if possible.

Suggested tool if compatible:

```txt
@axe-core/playwright
```

---

## Performance requirements

Check and improve:

- bundle size
- unnecessary rerenders
- large CSV import performance
- import progress for big files
- non-blocking backup restore
- lazy-load heavy reports if needed
- fast local calculations
- no UI freeze during import/migration

---

## SEO and share polish

Even though this is an app, it needs credible presentation.

Add:

- real favicon
- canonical tag
- Open Graph title
- Open Graph description
- Open Graph image
- Twitter card metadata
- better meta description
- minimal static intro content
- privacy statement page or section
- data safety page or section
- product explanation page or section

---

## Documentation

Create or update user docs:

- what Finance Master is
- what it is not
- how local-first storage works
- how to back up data
- how to restore data
- how reserves work
- how debt payment plans affect burn rate
- how runway is calculated
- how forecasts work
- how to run monthly review

Create or update developer docs:

- architecture overview
- data model
- calculation engine
- migration system
- testing strategy
- release checklist

---

## Release checklist

Before calling it stable:

- no known data-loss bugs
- backup restore tested
- migration tested
- accessibility baseline passed
- mobile baseline passed
- private/incognito warning works
- large CSV import tested
- core calculations tested
- destructive actions confirmed
- README updated
- version bumped
- changelog added

---

## Tests required

Add tests for:

- keyboard navigation
- modal focus trap
- escape closes modal
- mobile nav
- reduced motion
- no horizontal overflow
- accessible form labels
- SEO metadata exists
- import large CSV does not crash
- backup restore with large data does not crash
- release build passes

---

## Acceptance criteria

Phase 10 is complete when:

- product feels coherent and premium
- accessibility tests exist
- performance is acceptable with large local datasets
- SEO/share metadata is complete
- documentation explains the product clearly
- the app can be confidently used with real financial data
- all tests pass

---

# Cross-phase priority order

Implement in this order unless there is a strong technical reason to split differently:

1. Data safety and destructive reset removal
2. Financial calculation engine and debt/burn-rate correctness
3. IA cleanup and modal simplification
4. Onboarding and empty states
5. CSV import and transaction workflow hardening
6. Income pipeline and forecast confidence
7. Cashflow forecasting and scenarios
8. Monthly review ritual
9. Reports and deterministic insights
10. Polish, accessibility, performance, SEO, docs, release readiness

Do not start major UI polish before data safety and calculation correctness are done.

---

# Most important implementation details

## Debt payment plans are first-class

Debt is not just a note.

A debt should have:

- creditor
- current balance
- payment plan
- recurrence
- monthly equivalent
- next due date
- burn rate impact
- runway impact
- review status

Debt payment plans must be included in recurring costs and monthly burn rate.

## Available cash is the hero metric

Available cash should be more important than total cash.

The app should teach the user:

```txt
Money can exist but still not be available.
```

## Protected cash must be visually and logically separate

Reserve buckets should protect money from being mentally spent.

Examples:

- VAT
- income tax
- health insurance
- emergency buffer
- debt repayment

## Forecasts must separate certainty levels

Always distinguish:

- confirmed
- expected
- optimistic
- scenario-only

Do not blur open invoices, proposals, and real cash.

## The attention queue should drive action

The Overview should not just show static cards. It should surface what needs action.

Examples:

- categorize 4 imported transactions
- match incoming payment to invoice
- create payment plan for debt
- check VAT reserve
- close monthly review
- export backup

## Every warning must be actionable

Bad warning:

```txt
Your finances are risky.
```

Good warning:

```txt
Debt payment due in 5 days is not covered by available cash. Add expected income, reduce obligations, or mark reserve usage intentionally.
```

---

# Suggested internal architecture direction

Adapt to actual repo structure, but aim for this separation:

```txt
src/domain/
  cash-position.ts
  burn-rate.ts
  recurrence.ts
  runway.ts
  reserves.ts
  debts.ts
  income.ts
  cashflow-forecast.ts
  forecast-confidence.ts
  monthly-review.ts
  reports.ts

src/persistence/
  repositories.ts
  store.ts
  migrations.ts
  backup.ts
  validators.ts

src/ui/
  components/
  sections/
  modals/
  panels/
  empty-states/

src/import/
  csv-parser.ts
  import-mapping.ts
  import-profiles.ts
  duplicate-detection.ts
  import-batches.ts

src/tests/
  domain/
  persistence/
  import/
  e2e/
```

If the current app does not use this structure, refactor gradually.

Do not rewrite the entire app unless absolutely necessary.

---

# Suggested test strategy

Use unit tests for:

- calculations
- recurrence
- debt plans
- forecast inclusion
- duplicate detection
- backup validation
- migration validation

Use Playwright/e2e tests for:

- navigation
- onboarding
- Quick Add
- import flow
- restore flow
- monthly review
- mobile nav
- modals
- accessibility basics

Use fixture data for:

- empty user
- demo user
- freelancer with debts
- studio with multiple scopes
- user with overdue invoices
- user with protected reserves
- imported CSV with duplicates
- old schema backup
- malformed backup

---

# Definition of done for every phase

A phase is not done unless:

- implementation is complete
- existing behavior still works
- new behavior is tested
- edge cases are handled
- UI copy is clear
- no silent data mutation happens
- local-first behavior is preserved
- all tests pass
- README or docs are updated if behavior changed

---

# Final product standard

Finance Master should become the tool a creative founder opens when they feel financially unclear and need one calm answer:

```txt
What money do I really have, what is already spoken for, what is coming next, and what do I need to do now?
```

Build toward that standard in every phase.

---

# Extended Roadmap — Phases 11–30

The first ten phases establish the safe, trustworthy local-first core: data safety, calculation correctness, coherent UX, onboarding, imports, income, forecasts, monthly review, reports, and release polish.

Phases 11–30 define the product's long-term maturity path. Treat these as future implementation waves, not immediate MVP scope. Do **not** implement these before phases 1–10 are stable unless the product owner explicitly reprioritizes.

For every phase below, follow the same engineering rules as above:

1. Preserve local-first behavior.
2. Keep calculations deterministic and explainable.
3. Avoid silent data mutation.
4. Add tests before relying on new financial logic.
5. Keep advanced features modular and optional.
6. Do not turn Finance Master into accounting, tax filing, banking, or legal-advice software.

---

## Phase 11 — Rule Engine & Automation Layer

### Goal

Reduce repetitive manual work with transparent, deterministic rules.

This phase should not introduce AI magic. Rules must be editable, previewable, reversible, and explainable.

### Product requirement

Users should be able to define patterns such as:

```txt
When a transaction matches this condition, apply this action.
```

Examples:

- If description contains `Adobe`, categorize as `Software`.
- If counterparty contains `TK`, categorize as `Health Insurance`.
- If incoming amount matches an open invoice within a configurable tolerance, suggest an invoice match.
- If payment goes to a known creditor, suggest linking it to a debt.
- If income is marked paid, suggest allocating VAT/tax/health reserves.
- If money moves between owned accounts, suggest marking it as a transfer.
- If a similar expense appears three times, suggest creating a recurring obligation.

### Implementation tasks

Create a rules domain layer.

Suggested modules:

- `rules/types.ts`
- `rules/rule-engine.ts`
- `rules/rule-preview.ts`
- `rules/rule-actions.ts`
- `rules/rule-audit.ts`
- `rules/rule-tests.ts`

Support rule types:

- categorization rule
- counterparty normalization rule
- invoice matching rule
- debt matching rule
- transfer detection rule
- reserve allocation rule
- review queue rule
- forecast inclusion rule

Each rule should include:

- id
- name
- active/inactive state
- trigger conditions
- action
- scope filter
- created date
- last applied date
- number of affected records
- audit history

### UX requirements

Add a Rules section. It can live under Settings or Transactions, but avoid hiding it in a crowded modal.

Required UI flows:

- create rule
- edit rule
- disable rule
- delete rule
- preview matches
- apply rule
- undo last application
- view rule history

Rules must show what they will change before changing data.

### Data safety requirements

Rule application must create an audit record.

Rule application must be reversible at least per batch.

Rules must not mutate closed-month snapshots.

### Tests

Add tests for:

- condition matching
- compound conditions
- category assignment
- invoice match suggestion
- debt match suggestion
- transfer detection
- preview mode
- batch apply
- undo
- inactive rules not running

### Acceptance criteria

Phase 11 is complete when:

- Users can create, edit, disable, delete, preview, and apply rules.
- Rule changes are reversible.
- Rules do not silently mutate historical closed snapshots.
- Automatic changes are explainable.
- Tests cover the rule engine and common rule actions.

---

## Phase 12 — Advanced Reserves & Allocation System

### Goal

Turn protected cash from a passive concept into an active allocation system.

### Product requirement

When income arrives, Finance Master should suggest how to split that money into protected reserve buckets and available cash.

Example:

```txt
Client payment received: €5,950 gross
Suggested allocation:
- VAT reserve: €950
- Income tax reserve: €1,250
- Health insurance reserve: €450
- Debt repayment reserve: €500
- Emergency buffer: €500
- Remaining available cash: €2,300
```

### Implementation tasks

Extend reserve bucket model with allocation rules.

Support allocation types:

- percentage of gross income
- percentage of net income
- fixed amount per income event
- fixed monthly contribution
- target-based allocation
- priority waterfall allocation
- manual allocation only

Suggested modules:

- `reserves/allocation-rules.ts`
- `reserves/allocation-engine.ts`
- `reserves/waterfall.ts`
- `reserves/reserve-health.ts`

### Waterfall allocation

Support ordered reserve priorities:

1. VAT reserve
2. Health insurance reserve
3. Income tax reserve
4. Debt repayment reserve
5. Emergency buffer
6. Investment/project reserve
7. Available cash

The user must be able to reorder priorities.

### Reserve health states

Each reserve should expose:

- healthy
- under target
- critically low
- overfunded
- needs review
- rule missing
- insufficient data

### UX requirements

Add reserve allocation suggestions to:

- income payment match flow
- transaction detail panel
- reserve dashboard
- monthly review

The user should be able to:

- accept allocation
- edit allocation
- reject allocation
- save allocation rule
- apply once only

### Tests

Add tests for:

- percentage allocation
- waterfall priority
- reserve target caps
- partial allocations
- overfunded buckets
- protected cash update
- available cash update
- rejected suggestions not mutating data

### Acceptance criteria

Phase 12 is complete when:

- Income can trigger reserve allocation suggestions.
- Allocation rules are transparent and editable.
- Protected cash and available cash update correctly.
- Reserve health states are visible.
- Tests cover reserve allocation and target behavior.

---

## Phase 13 — Tax, VAT & Health Insurance Planning Layer

### Goal

Help German freelancers and small studios plan for tax, VAT, and health insurance obligations without pretending to provide official tax advice.

### Product requirement

Finance Master should prevent the common freelancer problem where gross money appears available even though parts of it belong to VAT, income tax, health insurance, or old obligations.

### Strict language rule

The app must not say:

```txt
You owe exactly €X tax.
```

The app may say:

```txt
Planning estimate based on your settings.
```

### Implementation tasks

Create planning modules:

- `planning/vat-planning.ts`
- `planning/income-tax-planning.ts`
- `planning/health-insurance-planning.ts`
- `planning/german-freelancer-mode.ts`

Support settings:

- VAT mode: none / Kleinunternehmer / monthly VAT / quarterly VAT
- VAT rate default
- estimated income tax reserve percentage
- health insurance monthly amount
- health insurance back-payment plan
- payment due dates
- reserve targets

### VAT planning features

Track:

- VAT collected
- deductible VAT if expense data supports it
- estimated VAT liability
- VAT reserve target
- quarterly/monthly due dates
- VAT reserve gap

### Income tax planning features

Track:

- estimated taxable profit
- conservative tax reserve percentage
- year-to-date reserve target
- reserve gap
- manual tax prepayment dates

### Health insurance planning features

Track:

- monthly contribution
- back payments
- payment plans
- reserve target
- annual income estimate impact, if manually configured

### UX requirements

All numbers must be labelled as planning estimates.

Show explainers:

- how VAT reserve is estimated
- how tax reserve is estimated
- how health insurance reserve is calculated
- why this reduces available cash

### Tests

Add tests for:

- VAT reserve estimation
- Kleinunternehmer mode excluding VAT reserve
- quarterly VAT due dates
- income tax reserve percentage
- health insurance fixed monthly plan
- back-payment inclusion in burn rate
- planning estimates affecting protected cash

### Acceptance criteria

Phase 13 is complete when:

- Tax/VAT/health planning works as estimates.
- Planning outputs update protected cash.
- Warnings are clear but not alarmist.
- The app never presents estimates as official tax/legal truth.
- Tests cover major planning modes.

---

## Phase 14 — Bank Sync & External Data Integrations

### Goal

Prepare Finance Master for external data sources while preserving privacy and local-first trust.

### Product requirement

Do not bolt integrations directly onto the UI. Create a connector abstraction first.

### Integration architecture

Create an integration layer:

- `integrations/types.ts`
- `integrations/connector-registry.ts`
- `integrations/sync-state.ts`
- `integrations/normalizers.ts`
- `integrations/import-source.ts`
- `integrations/errors.ts`

Each connector should define:

- connector id
- display name
- auth method
- supported data types
- sync method
- normalization function
- duplicate detection strategy
- disconnect method
- delete imported data method
- privacy description

### Candidate integrations

Future candidates:

- GoCardless/Nordigen bank data
- Wise
- PayPal
- Stripe
- Accountable
- Lexoffice
- SevDesk
- Notion
- Google Sheets
- local CSV folder watcher in desktop version

Do not implement all at once. Implement the architecture first and one simple connector if requested.

### Privacy requirements

The UI must explain:

- what is connected
- what is imported
- where data is stored
- whether data leaves the device
- how to disconnect
- how to delete imported data

### Sync requirements

Imported records must include:

- source connector
- source account
- external id if available
- sync batch id
- imported timestamp
- normalized fields

### Tests

Add tests for:

- connector registration
- sync state persistence
- normalization
- duplicate detection across CSV and connector imports
- disconnect behavior
- deleting imported connector data

### Acceptance criteria

Phase 14 is complete when:

- Integration abstraction exists.
- At least one connector can be implemented cleanly.
- Imported external data is tagged by source.
- User can disconnect and remove imported data.
- Duplicate detection works across CSV and integration imports.

---

## Phase 15 — AI Assistant Grounded in the Calculation Engine

### Goal

Add an assistant that explains, summarizes, drafts, and helps prioritize without inventing numbers.

### Core rule

The assistant must never calculate financial truth from free text.

The calculation engine remains the source of truth.

The assistant may only reason from structured app-generated summaries.

### Implementation tasks

Create structured summaries for AI context:

- current cash summary
- available cash breakdown
- protected cash breakdown
- burn rate summary
- debt summary
- reserve summary
- income summary
- forecast summary
- review queue summary
- monthly review summary

Suggested modules:

- `assistant/context-builder.ts`
- `assistant/allowed-actions.ts`
- `assistant/finance-summary-schema.ts`
- `assistant/prompt-templates.ts`
- `assistant/safety-guardrails.ts`

### Assistant modes

Support future modes:

- Explain my dashboard
- Find financial risks
- Prepare monthly review
- Draft payment reminder email
- Scenario coach
- Debt planning coach
- Cashflow stress test
- Ask Finance Master

### Guardrails

The assistant must:

- cite internal data sections
- distinguish actual from expected income
- distinguish estimates from official tax/legal facts
- ask for confirmation before mutating data
- never call a situation “safe” without qualification
- avoid investment, legal, or tax advice as certainty

### UX requirements

Assistant answers should include links back to source cards or objects where possible.

Example:

```txt
Based on 4 open income items and current fixed obligations, your conservative 30-day forecast drops below zero on July 12 if no overdue invoices are paid.
```

### Tests

Add tests for:

- context generation
- missing data handling
- assistant not receiving raw hidden data unnecessarily
- assistant not mutating data without confirmation
- source summary consistency

### Acceptance criteria

Phase 15 is complete when:

- AI uses structured financial summaries.
- AI output links back to app data.
- AI cannot mutate data silently.
- AI can be disabled.
- Calculation engine remains authoritative.

---

## Phase 16 — Strategic Planning, Goals & Capital Decisions

### Goal

Help the user make grounded financial decisions instead of only observing dashboards.

### Product requirement

The app should support goals such as:

- pay down debt
- build emergency buffer
- save for equipment
- reduce burn rate
- reach six months runway
- fund a studio project
- prepare for a low-income period
- clean up tax/health-insurance backlog

### Implementation tasks

Add goal entities:

- id
- name
- type
- target amount
- deadline
- priority
- current amount
- monthly contribution
- linked reserve/debt/project
- forecast impact
- status

Suggested modules:

- `goals/types.ts`
- `goals/goal-engine.ts`
- `goals/progress.ts`
- `decisions/capital-decision.ts`

### Goal types

Support:

- debt payoff goal
- reserve goal
- runway goal
- income goal
- cost reduction goal
- investment/purchase goal
- project funding goal
- tax cleanup goal

### Capital decision tool

Implement a simulator for:

```txt
Can I afford this purchase or commitment?
```

Inputs:

- amount
- one-time or recurring
- payment date
- payment plan
- category
- business-critical vs optional
- expected return optional

Outputs:

- available cash after decision
- runway impact
- reserve impact
- debt pressure impact
- forecast risk
- what would need to be true for it to work

### Acceptance criteria

Phase 16 is complete when:

- Users can create and track goals.
- Goals affect forecast and reserve planning.
- Capital decisions can be simulated without mutating real data.
- Goal progress appears in Overview and Monthly Review.
- Tests cover goal progress and purchase simulation.

---

## Phase 17 — Multi-Scope Finance

### Goal

Support the reality of creative entrepreneurs who have personal finances, freelance work, studios, collaborations, and shared projects.

### Product requirement

Finance Master should support multiple optional scopes without overwhelming simple users.

Example scopes:

- Personal
- Freelance
- Studio
- Magnificent Matter
- Catatumbo Lab
- Shared household
- Project budget
- Event budget

### Implementation tasks

Add scope support to financial objects:

- account
- transaction
- income
- fixed cost
- debt
- reserve
- goal
- report
- forecast item
- project

Suggested modules:

- `scopes/types.ts`
- `scopes/scope-filter.ts`
- `scopes/cross-scope-transfer.ts`
- `scopes/scope-summary.ts`

### UX requirements

Keep single-scope mode as default.

Only show scope complexity when enabled.

Add scope filter to:

- Overview
- Transactions
- Income
- Obligations
- Reserves
- Cashflow
- Reports

### Cross-scope transfer rules

Support cases such as:

- personal account paying business cost
- business reimbursing personal account
- studio cost paid from freelance account
- project advance allocated into a reserve

Do not double-count cross-scope transfers as income.

### Acceptance criteria

Phase 17 is complete when:

- User can enable multi-scope mode.
- Financial objects can be tagged by scope.
- Reports and forecasts can filter by scope.
- Cross-scope transfers do not distort income/expense totals.
- Simple single-scope users are not exposed to unnecessary complexity.

---

## Phase 18 — Collaboration, Sharing & Advisor Mode

### Goal

Allow controlled sharing with trusted people without exposing the full private finance system.

### Product requirement

Default sharing model should be snapshot/export first, not full live multi-user collaboration.

### Shareable outputs

Support exports for:

- monthly summary
- VAT/tax reserve summary
- open invoice report
- debt payment plan overview
- project budget report
- runway report
- accountant export
- business partner summary

### Redaction options

User should be able to:

- hide personal transactions
- hide counterparty names
- hide notes
- hide account names
- export only selected scope
- export only selected date range
- show only summaries

### Future advisor mode

Future read-only mode may include:

- selected data only
- comments
- review requests
- approval workflow
- accountant access
- partner access

Do not implement live collaboration until export and privacy boundaries are reliable.

### Tests

Add tests for:

- scoped export
- redacted export
- date-limited export
- personal data exclusion
- no accidental full-data export

### Acceptance criteria

Phase 18 is complete when:

- Users can export selected financial views.
- Sensitive data can be redacted.
- Exports clearly state what is included.
- Accountant/partner snapshots are possible without exposing everything.

---

## Phase 19 — Local-First Desktop App & Advanced Privacy Architecture

### Goal

Move Finance Master toward a serious private desktop finance tool.

### Product requirement

The browser version should remain usable, but a future desktop app can provide stronger privacy, local files, encrypted storage, and automatic backups.

### Possible stack

Evaluate:

- Tauri
- Electron
- local SQLite
- encrypted local database
- encrypted local backups
- optional self-hosted sync later

### Desktop features

Possible features:

- local encrypted storage
- real file backups
- auto-backup folder
- local CSV folder watcher
- app lock
- local notifications
- offline-first behavior
- keyboard shortcuts
- menu bar quick add
- better large dataset performance

### Security requirements

Add:

- app lock PIN/password
- encrypted backup option
- recovery key
- export all data
- delete all local data
- backup verification
- local audit log

### Migration requirement

Browser backup must import into desktop app.

Desktop backup must export back to portable JSON/CSV.

No lock-in.

### Acceptance criteria

Phase 19 is complete when:

- Desktop prototype loads existing backup data.
- Local encrypted storage works.
- Auto-backup works.
- Browser version remains supported.
- User can always export data in open formats.

---

## Phase 20 — Commercial Productization & Ecosystem

### Goal

Prepare Finance Master to become a real product for freelancers and small creative studios.

### Product positioning

Finance Master is:

```txt
A private financial clarity system for freelancers, artists, and small creative studios who need to understand cash reality, runway, reserves, debt, and upcoming obligations without becoming accountants.
```

Finance Master is not:

- accounting software
- tax filing software
- banking software
- generic budget tracking
- ERP

### Commercial options

Possible models:

- free local version
- one-time desktop license
- paid Pro version
- paid AI assistant
- paid bank sync
- studio edition
- advisor/accountant export pack
- German freelancer template pack
- creative studio template pack

### Website requirements

Build public product materials:

- landing page
- product explanation
- screenshots
- privacy-first positioning
- local-first explanation
- use cases
- comparison with spreadsheets
- docs
- changelog
- roadmap
- privacy policy
- terms

### Analytics principle

Because this is privacy-sensitive, use either no analytics or explicit opt-in privacy-first telemetry.

If implemented, track only:

- onboarding completion
- import errors
- backup frequency
- feature usage aggregates
- crash logs

Never track financial values unless explicitly opted in and anonymized.

### Acceptance criteria

Phase 20 is complete when:

- Product positioning is clear.
- Website explains what the app does and does not do.
- Privacy model is clear.
- Beta onboarding exists.
- Versioning, changelog, and release notes exist.

---

## Phase 21 — Financial Memory & Historical Intelligence

### Goal

Give the product long-term memory so it can understand patterns across months and years.

### Product requirement

Finance Master should detect and explain patterns such as:

- burn rate increasing for multiple months
- income arriving later than expected
- recurring VAT reserve underfunding
- seasonal cash dips
- client payment delays
- growing studio costs
- declining runway

### Implementation tasks

Create immutable historical snapshots.

Snapshot triggers:

- month close
- quarter close
- year close
- before major restore
- before migration
- before major scenario decision

Snapshot contents:

- cash position
- available cash
- protected cash
- burn rate
- runway
- reserve status
- debt status
- open income
- overdue income
- forecast confidence
- user notes

Suggested modules:

- `history/snapshots.ts`
- `history/trends.ts`
- `history/pattern-detection.ts`
- `history/comparisons.ts`

### Pattern detection

Detect:

- recurring late payments
- increasing burn rate
- declining runway
- reserve underfunding
- income concentration
- seasonal dips
- debt pressure changes
- review discipline changes

### Acceptance criteria

Phase 21 is complete when:

- Closed-month snapshots are immutable.
- Historical trends appear in reports.
- Current metrics can be compared to prior snapshots.
- Pattern insights link back to source snapshots.
- Tests cover snapshot immutability and trend detection.

---

## Phase 22 — Year Planning & Annual Financial Strategy

### Goal

Move from monthly survival planning to annual strategy.

### Product requirement

The app should answer:

- How much revenue is needed this year?
- How much revenue has been earned so far?
- What is the minimum survival target?
- What is the healthy target?
- What months are risky?
- What large obligations are coming?

### Implementation tasks

Create annual planning entities:

- year
- survival target
- stable target
- growth target
- expected revenue
- planned expenses
- tax reserve target
- debt repayment target
- investment budget
- seasonal notes

Suggested modules:

- `annual-plan/types.ts`
- `annual-plan/target-engine.ts`
- `annual-plan/seasonality.ts`
- `annual-plan/year-review.ts`

### Target models

Support:

- survival target
- stable target
- growth target
- ambitious target

Survival target covers fixed costs, debt plans, and minimum reserves.

Stable target adds buffer and reserve health.

Growth target adds investment, project development, and stronger runway.

### Seasonal planning

Allow marking:

- high-income months
- low-income months
- travel periods
- festival periods
- production-heavy periods
- tax-heavy months
- low-capacity months

### Acceptance criteria

Phase 22 is complete when:

- User can create annual targets.
- Year-to-date progress is visible.
- Annual plan influences monthly forecast.
- Seasonal risks are visible.
- Year-end review can be generated.

---

## Phase 23 — Project-Based Finance & Budget Control

### Goal

Track money by project, not only by account/category.

### Product requirement

Creative businesses think in projects. Finance Master should support project budgets, income, costs, margin, and cash timing.

Examples:

- website project
- retainer
- content production
- event production
- installation
- performance
- workshop
- internal R&D

### Implementation tasks

Create project finance entities:

- project name
- client or internal owner
- scope
- budget
- expected income
- confirmed income
- paid income
- direct expenses
- contractor costs
- material/equipment costs
- travel costs
- payment milestones
- margin estimate
- cashflow timeline
- risk level
- notes

Suggested modules:

- `projects/types.ts`
- `projects/project-budget.ts`
- `projects/project-margin.ts`
- `projects/project-cashflow.ts`
- `projects/project-templates.ts`

### UX requirements

Add project dashboard showing:

- budget vs actual
- expected margin
- cash received
- open payments
- expenses paid
- expected expenses
- payment status
- cashflow impact

### Acceptance criteria

Phase 23 is complete when:

- Transactions and income can link to projects.
- Projects show budget, margin, and cash timing.
- Project cashflow contributes to global forecast.
- Project reports can be exported.
- App clearly distinguishes cashflow from profitability.

---

## Phase 24 — Retainer & Recurring Client Management

### Goal

Make Finance Master excellent for recurring client income.

### Product requirement

The app should answer:

- Which retainers are active?
- How much monthly base income is reliable?
- Which retainers are at risk?
- Which retainers are overdue?
- How much burn rate is covered by retainers?
- What happens if a retainer ends?

### Implementation tasks

Create retainer entity:

- client
- monthly amount
- billing cycle
- start date
- end date optional
- notice period
- included hours/days optional
- effective hourly/day rate optional
- payment due day
- status
- renewal date
- confidence
- linked project
- scope

Suggested modules:

- `retainers/types.ts`
- `retainers/retainer-income-generator.ts`
- `retainers/risk.ts`
- `retainers/stress-test.ts`

### Required calculations

Show:

- monthly recurring revenue
- confirmed recurring revenue
- at-risk recurring revenue
- retainer coverage of burn rate
- retainer concentration
- renewal risk
- late payment history

### Acceptance criteria

Phase 24 is complete when:

- Retainers generate expected income automatically.
- Retainers appear in forecasts.
- Losing a retainer can be simulated.
- Retainer coverage of burn rate is visible.
- Tests cover recurring income generation and retainer stress tests.

---

## Phase 25 — Pricing, Rate & Profitability Advisor

### Goal

Help users price work based on real financial requirements.

### Product requirement

The app should calculate what the user needs to charge considering fixed costs, debt plans, tax reserves, health insurance, unpaid admin time, low-capacity periods, desired runway, and investment needs.

### Implementation tasks

Create pricing modules:

- `pricing/required-revenue.ts`
- `pricing/rate-calculator.ts`
- `pricing/project-pricing.ts`
- `pricing/underpricing-detector.ts`

### Required monthly revenue calculator

Inputs:

- monthly burn
- debt payment plans
- reserve targets
- tax reserve percentage
- health insurance
- desired savings
- investment budget
- workable days per month
- billable percentage
- target profit

Outputs:

- survival monthly revenue
- healthy monthly revenue
- required day rate
- required hourly rate
- required retainer base

### Project pricing calculator

Inputs:

- estimated hours/days
- contractor costs
- materials
- travel
- risk buffer
- margin target
- payment terms

Outputs:

- minimum price
- healthy price
- premium price
- cashflow risk
- payment milestone suggestion

### Acceptance criteria

Phase 25 is complete when:

- Required rates are calculated from real financial data.
- Pricing distinguishes survival, sustainable, and premium pricing.
- Retainer effective rates can be analyzed.
- Underpricing warnings are explainable.
- Tests cover pricing formulas and edge cases.

---

## Phase 26 — Contract, Payment Terms & Risk Layer

### Goal

Connect cashflow health with contract and payment-term quality.

### Product requirement

Finance Master should warn when the user is effectively financing a client project through weak payment terms.

### Implementation tasks

Create payment terms model:

- upfront payment
- milestone payments
- final payment
- payment due days
- cancellation fee
- kill fee
- expense prepayment
- contractor prepayment
- late fee note
- signed contract flag

Suggested modules:

- `contracts/payment-terms.ts`
- `contracts/project-risk-score.ts`
- `contracts/cashflow-risk.ts`
- `contracts/recommendations.ts`

### Risk scoring factors

Score risk based on:

- no upfront payment
- long payment terms
- high contractor costs before payment
- high material costs
- new client
- late payment history
- large scope uncertainty
- unsigned contract
- low margin
- high dependency on one payer

### Output recommendations

Examples:

- Ask for deposit.
- Split into milestones.
- Require expenses to be prepaid.
- Do not start before upfront payment.
- Add a risk buffer.
- Reduce scope.

Always frame as business planning support, not legal advice.

### Acceptance criteria

Phase 26 is complete when:

- Projects can include payment terms.
- Forecast reflects milestone timing.
- Risk score is explainable.
- App warns when user is financing client work.
- Tests cover milestone cashflow and risk scoring.

---

## Phase 27 — Scenario Library & Decision Archive

### Goal

Save financial scenarios and compare predicted vs actual outcomes.

### Product requirement

The user should be able to save major financial decisions and learn from them later.

Examples:

- equipment purchase
- client payment delay
- retainer loss
- new retainer
- debt payoff acceleration
- low-income month
- travel period
- studio investment
- project budget risk
- tax payment shock

### Implementation tasks

Create scenario archive entities:

- scenario id
- name
- date created
- baseline financial state
- assumptions
- forecast result
- decision made
- expected impact
- actual outcome
- linked goals/projects
- user notes

Suggested modules:

- `scenarios/library.ts`
- `scenarios/templates.ts`
- `scenarios/predicted-vs-actual.ts`
- `scenarios/archive-search.ts`

### Acceptance criteria

Phase 27 is complete when:

- Scenarios can be saved.
- Saved scenarios do not mutate real data.
- User can compare prediction with actual outcome.
- Scenario archive is searchable.
- Scenarios can link to goals and projects.

---

## Phase 28 — Personal Finance Behavior & Stress Signals

### Goal

Make the product more emotionally sustainable without becoming therapy software.

### Product requirement

Finance Master should detect avoidance and overwhelm patterns and offer small next actions.

### Behavioral signals

Detect:

- long time since last review
- many uncategorized transactions
- repeated ignored overdue invoices
- no recent backup
- repeatedly underfunded reserves
- dropping forecast confidence
- user opening app but not completing review
- large unexplained expenses
- debt plans not updated

### Focus Mode

Create a simplified mode for overwhelmed users.

It should show:

- one task at a time
- clear next action
- no dense dashboard
- no shame language
- progress indicator
- exit anytime

Example messages:

```txt
Start with three uncategorized transactions.
```

```txt
The most useful next step is to confirm whether this invoice was paid.
```

```txt
Adding your debt payment plan will make the runway more realistic.
```

### Acceptance criteria

Phase 28 is complete when:

- App can detect review avoidance signals.
- Focus Mode exists.
- Focus Mode presents one action at a time.
- Language is calm and non-shaming.
- App makes no medical/psychological claims.

---

## Phase 29 — Ecosystem Maps & Financial Operating Architecture

### Goal

Represent the user’s full financial ecosystem structurally and visually.

### Product requirement

Finance Master should show relationships between:

- accounts
- scopes
- clients
- projects
- reserves
- debts
- income streams
- fixed costs
- goals
- legal entities
- collaborators

### Implementation tasks

Create a graph model:

- nodes
- edges
- node types
- edge types
- source object references
- warnings

Suggested modules:

- `ecosystem/graph.ts`
- `ecosystem/node-builder.ts`
- `ecosystem/edge-builder.ts`
- `ecosystem/warnings.ts`
- `ecosystem/layout.ts`

### Edge types

Support:

- pays into
- paid from
- reserved for
- owed to
- linked to
- funds
- depends on
- reimburses
- belongs to

### Warnings

Detect:

- personal account paying business expenses
- studio costs mixed into personal scope
- debt reserve not linked to debt
- project with expenses but no income source
- client concentration funding fixed costs
- reserve not connected to obligation

### Acceptance criteria

Phase 29 is complete when:

- App can generate a financial ecosystem graph from existing data.
- User can filter graph by scope.
- Nodes link back to source objects.
- Warnings are explainable.
- Map is optional and does not replace the normal dashboard.

---

## Phase 30 — Finance Master OS: Modular Platform & Extension System

### Goal

Turn Finance Master into a modular operating system that can grow without becoming bloated.

### Product requirement

Advanced capabilities should become optional modules, not permanent clutter in the core UI.

### Core modules

- Cash
- Transactions
- Income
- Obligations
- Debt
- Reserves
- Forecast
- Monthly Review
- Reports

### Advanced modules

- Tax Planning
- Project Budgets
- Retainers
- Pricing Advisor
- Contract Risk
- AI Assistant
- Bank Sync
- Desktop Vault
- Collaboration
- Ecosystem Map
- Goals
- Scenario Archive

### Implementation tasks

Create internal module architecture:

- module registry
- route registration
- navigation contribution
- schema extension
- calculation contribution
- review queue contribution
- report widget contribution
- settings contribution
- import/export contribution
- migration contribution

Suggested modules:

- `modules/types.ts`
- `modules/registry.ts`
- `modules/navigation.ts`
- `modules/settings.ts`
- `modules/migrations.ts`
- `modules/export.ts`

### User-facing modes

Support optional modes:

- simple personal mode
- freelancer mode
- studio mode
- advanced finance OS mode
- custom mode

### Acceptance criteria

Phase 30 is complete when:

- Modules can be enabled and disabled.
- Core app remains usable with minimal modules.
- Advanced features do not clutter simple mode.
- Navigation adapts to enabled modules.
- Data export includes module data clearly.
- Documentation explains module boundaries.

---

# Long-Term Strategic Summary

## Phases 1–10

Build the reliable local-first core:

- data safety
- correct calculations
- clean information architecture
- onboarding
- imports
- income pipeline
- cashflow forecasts
- monthly review
- reports
- release polish

## Phases 11–20

Build mature product capabilities:

- rules
- automation
- advanced reserves
- tax/VAT/health planning
- integrations
- AI assistant
- goals
- multi-scope finance
- sharing
- desktop privacy
- commercial readiness

## Phases 21–30

Build the broader financial operating system:

- financial memory
- annual strategy
- project budgets
- retainer management
- pricing advisor
- contract/payment risk
- scenario archive
- focus mode
- ecosystem maps
- modular extension architecture

## Final product vision

Finance Master should become:

```txt
A private financial operating system for independent creative businesses that connects cash reality, obligations, debt, tax reserves, income uncertainty, project budgets, pricing, decisions, and long-term strategy into one coherent system.
```

The long-term promise:

```txt
Understand your money as a living system — not just a balance.
```
