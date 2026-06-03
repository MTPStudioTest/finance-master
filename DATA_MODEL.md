# Finance Master Data Model

Finance Master is local-first and event-sourced. The durable ledger is an ordered list of finance events stored in the local repository layer. Read models such as accounts, transactions, obligations, pipeline, debts, and treasury metrics are derived from active events.

## Storage And Compatibility

- Raw finance events live under `finance-master.ledger.v1`.
- Settings, UI preferences, review state, goals, CSV import history, cached optional prices, layout preferences, and the demo seed flag live under `finance-master.*` local keys.
- Backups export the full operational local state as JSON. Layout-only keys are not part of backup restore.
- A `finance.event_reversed` event disables a prior event without deleting it.
- Old event shapes remain readable; new phases add events instead of rewriting existing data.

Current storage keys:

| Purpose | Key |
| --- | --- |
| Event ledger | `finance-master.ledger.v1` |
| Finance settings | `finance-master.settings.v1` |
| UI settings | `finance-master.ui.v1` |
| Weekly review state | `finance-master.review.v1` |
| Goals | `finance-master.goals.v1` |
| CSV import history | `finance-master.imports.v1` |
| Optional quote cache | `finance-master.prices.v1` |
| Layout/focus preferences | `finance-master.layout.*` |
| Demo seed flag | `finance-master.demo-seeded.v1` |

## Core Event Families

- `asset.account_set`: sets a cash/reserve account balance and metadata.
- `income.received`: records received income and increases a selected account when paired with an account update.
- `expense.recorded`: records an actual paid cost and decreases a selected account when paired with an account update.
- `transfer.recorded`: records movement between two local cash/reserve accounts. It is paired with two account updates and does not count as income or expense.
- `cash.adjusted`: records a balance correction. It is paired with one account update.
- `expense.recurring_set`: defines a recurring fixed cost that generates forecast obligations.
- `obligation.reviewed`: stores paid, deferred, or needs-review decisions for obligation instances.
- `transaction.reviewed`: stores category/scope/review metadata for a transaction without mutating the original event.
- `pipeline.*`: stores expected income state, value, probability, settlement, and cancellation.
- `debt.*`: stores debt balance movements and minimal payment plan metadata.

## Transaction Semantics

Ledger entry forms use an explicit movement type and a positive amount:

- Income increases the selected account and creates `income.received`.
- Expense decreases the selected account and creates `expense.recorded`.
- Transfer decreases the source account, increases the destination account, and creates `transfer.recorded`.
- Adjustment increases or decreases one selected account and creates `cash.adjusted`.

Corrections are append-only: reverse the incorrect transaction and add a replacement entry. Finance Master does not edit historical cash movement in place.

## Read Models

The ledger read model exposes active transactions with:

- `ledgerType`: income, expense, transfer, or adjustment.
- `signedAmount`: display-safe signed amount.
- account/category/scope metadata.
- `reviewStatus`: clear, needs_review, or reviewed.
- linked obligation/income ids where available.

Treasury calculations use account balances, recurring costs, income pipeline, obligation reviews, transaction reviews, and debt plans. Transfers do not affect total cash; they only move cash between buckets/accounts.

## Dashboard Formulas

The Finance Observatory uses derived treasury fields, not separate persisted dashboard state.

- Actually available = total active cash accounts - reserved cash buckets.
- Reserved cash = cash accounts marked reserved or assigned to a non-available bucket such as tax, VAT, health insurance, debt repayment, or buffer.
- Monthly burn = active recurring monthly costs split by personal, business, and shared scope.
- Runway = actually available / monthly burn. If monthly burn is missing or zero, runway is shown as unknown.
- Action This Week = unresolved review items from overdue/due-soon obligations, unmatched payments, uncategorized transactions, risky or overdue pipeline items, debt plan gaps, setup gaps, and weekly review due state.
- Next 30 Days = confirmed pipeline income due in 30 days + expected pipeline income weighted by probability - unpaid obligations due in 30 days. Risky income is excluded from this net movement.

## CSV Import And Export

CSV import creates local transaction events and marks ambiguous rows as review material through category/review state.

CSV export emits active read-model transactions only, not raw event history. Exported columns are:

`date`, `description`, `amount`, `direction`, `type`, `account`, `accountId`, `category`, `scope`, `reviewStatus`, `linkedObligationId`, `linkedIncomeId`, `source`.

## Backup Behavior

JSON backup/restore is the source of portability. Restore validates the backup before replacing local state. Invalid backups must not mutate current data.

Current backup version is `2`. Version `1` backups are accepted and migrated to version `2` by adding the stricter weekly-review shape and an empty goals container. Version `2` backups may include optional metadata:

- app name
- schema label
- backup version
- export timestamp
- event count
- latest event timestamp

Restore is preview-first and then confirmation-gated. The preview shows event counts and warns if the selected backup is older than the newest local finance event. Restoring replaces the current ledger, finance settings, UI settings, review state, goals, import history, and optional price cache in this browser.

## Local Data Safety

The Data and Settings surfaces expose local data health. The health check verifies that the known Finance Master storage keys are readable and shaped like the expected local state. It reports corrupt ledger/settings/import/goal/cache shapes without blank-screening the app.

Recovery paths are deliberately manual:

- Export JSON backup before risky changes.
- Restore a validated JSON backup when moving devices or recovering data.
- Use safe reset only when the local data should be cleared. Reset removes Finance Master storage keys in this browser and sets the demo seed flag to `deleted`, so sample data does not silently repopulate on reload.
