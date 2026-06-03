# Finance Master Data Model

Finance Master is local-first and event-sourced. The durable ledger is an ordered list of finance events stored in the local repository layer. Read models such as accounts, transactions, obligations, pipeline, debts, and treasury metrics are derived from active events.

## Storage And Compatibility

- Raw finance events live under the ledger storage key.
- Settings, UI preferences, review state, goals, CSV import history, and cached optional prices live in separate local keys.
- Backups export the full local state as JSON.
- A `finance.event_reversed` event disables a prior event without deleting it.
- Old event shapes remain readable; new phases add events instead of rewriting existing data.

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

## CSV Import And Export

CSV import creates local transaction events and marks ambiguous rows as review material through category/review state.

CSV export emits active read-model transactions only, not raw event history. Exported columns are:

`date`, `description`, `amount`, `direction`, `type`, `account`, `accountId`, `category`, `scope`, `reviewStatus`, `linkedObligationId`, `linkedIncomeId`, `source`.

## Backup Behavior

JSON backup/restore is the source of portability. Restore validates the backup before replacing local state. Invalid backups must not mutate current data.
