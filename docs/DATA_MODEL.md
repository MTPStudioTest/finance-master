# Finance Master Data Model

Finance Master is local-first. The canonical finance state is an append-only event ledger stored under `finance-master.ledger.v1`, with derived read models and treasury calculations built from active events.

## Storage

Primary storage is IndexedDB database `finance-master`. The repository layer mirrors and migrates legacy `finance-master.*` localStorage entries for compatibility.

Important keys:

| Key | Purpose |
| --- | --- |
| `finance-master.ledger.v1` | Finance event ledger |
| `finance-master.settings.v1` | Base currency and forecast horizon |
| `finance-master.ui.v1` | UI preferences such as scope and appearance |
| `finance-master.review.v1` | Review/checkpoint state and history |
| `finance-master.goals.v1` | Savings and buffer goals |
| `finance-master.imports.v1` | CSV import batches and saved mappings |
| `finance-master.scenarios.v1` | Saved scenario previews |
| `finance-master.prices.v1` | Local price quote cache |
| `finance-master.backup-meta.v1` | Last backup metadata |
| `finance-master.demo-seeded.v1` | Sample data seed state |

## Event Ledger

Events are normalized by `src/finance/events.js` and read by `src/finance/ledger.js`.

Core event groups:

- Income: `income.received`, `invoice.sent`, `invoice.paid`, `pipeline.created`, `pipeline.stage_changed`, `pipeline.value_changed`, `pipeline.probability_changed`
- Expense and obligations: `expense.recorded`, `expense.recurring_set`, `obligation.reviewed`
- Debt: `debt.added`, `debt.payment_made`, `debt.plan_updated`
- Assets and reserves: `asset.account_set`, `asset.position_set`, `asset.defi_set`, `asset.reserve_set`, `asset.reserve_allocated`
- Transactions and review: `transaction.reviewed`, `transfer.recorded`, `cash.adjusted`
- Projects and maintenance: `project.profile_set`, `finance.event_reversed`

An event has:

- `id`
- `type`
- `amount`
- `currency`
- `timestamp`
- `created_at`
- optional `related_entity_id`
- `metadata`

Reversals use `finance.event_reversed` and point to the target event. Active read models exclude reversed targets.

## Derived Read Model

`FinanceLedger.buildReadModel()` derives:

- `fiatAccounts`
- `reserveBuckets`
- `recurringExpenses`
- `debtAccounts`
- `pipelineDeals`
- `invoices`
- `transactions`
- `projectProfiles`
- `obligationReviews`
- import/scenario/review-adjacent metadata

The read model preserves explicit IDs and links where possible:

- transactions to obligations
- transactions to expected income
- transactions to reserves
- transactions to debt
- accounts and reserves to project profiles
- recurring costs to debt accounts through `linkedDebtId`

## Treasury Calculations

`src/finance/compute.js` builds the canonical treasury snapshot.

Important rules:

- Actual Cash is the sum of active liquid fiat account balances.
- Protected Cash comes from protected/reserved account allocations.
- Available Cash is Actual Cash minus Protected Cash and committed short-term obligations.
- Safe-to-Spend additionally considers debt due soon and the configured minimum buffer.
- Monthly Burn is recurring expenses plus active debt payment-plan pressure.
- Runway uses Available Cash divided by recurring/debt runway burn.
- Expected income stays forecast-only and must not be counted as Actual Cash.

Debt plan statuses:

- `active`
- `on_hold`
- `starts_later`
- `irregular`
- `completed`
- `archived`
- `missing`

Recurring and debt payment frequencies normalize weekly, biweekly, monthly, quarterly, and yearly schedules into monthly equivalents.

## Backups

Current backups use `FinanceBackupV2`.

A backup includes:

- ledger events
- finance settings
- UI settings
- review state
- goals
- imports
- scenarios
- price cache
- metadata with schema and event counts

Backup restore validates and migrates input before replacing local state. Restoring sets the sample seed state to `restored-backup`, which prevents silent sample reseeding if the restored backup is intentionally empty.

## Repository Schema Migration

Current repository schema label: `finance-master.local-first.v1`.

`src/persistence/schema-migration.js` keeps a small migration registry:

- `finance-master.local-first.v0` normalizes older local snapshots by adding missing `scenarios`, `priceCache`, and `backupMeta` buckets.
- `finance-master.local-first.v1` validates and clones the current shape.

Future schema changes should add a named schema label, migration function, before/after validation, and a fixture in `tests/trust-hardening.test.mjs`.

## Sample Data Seed State

`finance-master.demo-seeded.v1` controls sample ledger behavior:

- empty value: true first run can seed fictional sample data
- `1`: seeded fictional sample data is active
- `deleted`: user chose empty setup
- `restored-backup`: local state came from a backup
- `existing-ledger`: local events existed before sample seeding
- `empty-setup`: reserved state for explicit empty onboarding

Only true first run and explicit sample restore should seed sample data. Empty setup, restored backup, reset, and existing-ledger states must not be silently overwritten.

## Testing Focus

Prefer pure tests for:

- backup validation and migration
- storage health and data health
- event reversal behavior
- actual/protected/available cash
- safe-to-spend
- expected income separation
- recurring normalization
- debt payment-plan pressure
- double-counting prevention

Use E2E tests for:

- destructive confirmation flows
- backup restore preview
- sample data labeling and empty setup
- CSV import/reversal
- transaction review and matching
- board boundaries and responsive behavior
