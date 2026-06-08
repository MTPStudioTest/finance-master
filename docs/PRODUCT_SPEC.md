# Finance Master Product Spec

Finance Master is a local-first treasury cockpit for freelancers, creative entrepreneurs, and small studios. It helps the user understand what money is real, what is protected, what is coming, what is risky, and what decision is safe next.

It is not a bookkeeping suite, tax filing tool, bank-sync product, invoice generator, or accounting replacement.

## Product Promise

Help the user answer:

- How much cash actually exists?
- How much of that cash is protected for taxes, VAT, health insurance, debt, buffer, or specific purposes?
- What is safely usable after near-term obligations and payment-plan pressure?
- What income is real, confirmed, expected, or optimistic?
- What needs review before a money decision?

## Primary Boards

- Money Status: daily cockpit for Safe-to-Spend, current cash, runway, sample-data status, first-run setup, weather, next move, and compact trends.
- Decision Lab: ranked planning guidance and scenario previews that do not mutate finance data until the user chooses a concrete action.
- Cash Timeline: actual cash, available cash, expected landing, incoming money, obligations, and scenario pressure.
- Money Plan: structural inputs such as cash accounts, protected allocations, reserve buckets, recurring costs, debt accounts, and savings goals.
- Risk Radar: actionable risks, reserve health, income dependency, debt burden, and pattern memory.
- Reality Check: lightweight review queue, obligation/payment matching, weekly reconciliation, and checkpoint history.
- Records: raw transaction log, CSV import, import batches, filters, transaction review, and CSV export.
- Settings: app-level preferences, backup/restore, local data health, sample data controls, and reset actions.

## First-Run And Sample Data

The first-run experience stays lightweight. The app may seed fictional sample data on true first run so the cockpit is understandable immediately.

The sample ledger must be visibly labeled as fictional. Users can start empty through a confirmation-gated action. Once the user deletes sample data, restores a backup, resets local data, or already has a ledger, `Store.seedDemoIfNeeded()` must not silently repopulate the sample ledger on reload.

The empty Money Status screen shows a minimum useful setup checklist:

- Add cash account
- Add recurring costs
- Add upcoming obligations
- Add expected income
- Add reserve protection

## Financial Vocabulary

- Actual Cash: liquid account balances only.
- Protected Cash: cash reserved for a purpose.
- Available Cash: actual cash minus protected cash and committed near-term obligations.
- Safe-to-Spend: available cash after short-term obligations, debt due soon, and minimum buffer.
- Monthly Burn: normalized recurring costs plus active debt payment-plan pressure.
- Runway: available cash divided by monthly burn.
- Expected Income: forecast input only, never actual cash.

## Data Safety Requirements

- User data is local-first and must not be silently wiped or overwritten.
- Backup export and restore are core product features.
- Restore must validate and preview data before replacement.
- Destructive actions require typed confirmation.
- Repair/debug query parameters must not delete local data.
- Demo/sample replacement must be explicit and confirmation-gated.

## Tone And UX

The product should feel calm, private, premium, clear, and operational. It should avoid alarmist language and generic corporate dashboard patterns.

Prefer language such as:

- Needs review
- Below target
- Forecast confidence is low
- This money is protected
- This payment plan adds X/month to burn rate

Avoid shame, certainty where only estimates exist, and tax/legal advice framing.

## Current Non-Goals

- Bank sync
- AI assistant
- Cloud sync
- Multi-user collaboration
- Tax filing
- Full double-entry accounting
- DATEV export
- Invoice generation
- Commercial billing
- Desktop app packaging
