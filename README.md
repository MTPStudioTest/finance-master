# Finance Master

Finance Master is a local-first financial clarity cockpit for a creative entrepreneur or small creative studio ecosystem. Its job is not bookkeeping completeness. Its job is to reduce financial anxiety by showing what cash is real, what is already reserved, what obligations are coming, what income is reliable, and how much runway remains.

The app opens directly into the Finance Observatory. It has no authentication layer, backend, bank sync, automatic account linking, invoice generation, receipt scanning, tax filing logic, AI insights, or collaboration system.

## Run Locally

Requirements:

- Node.js 20+
- npm

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, usually `http://127.0.0.1:5173/finance-master/`.

Verification commands:

```bash
npm test
npm run test:e2e
npm run typecheck
npm run build
```

## Core Workflow

- Start in the Finance Observatory.
- Check truly available cash before making decisions.
- Compare total cash against reserved cash for taxes, VAT, health insurance, debt repayment, and buffer.
- Scan overdue, due-soon, and upcoming obligations.
- Classify future income as confirmed, expected, or risky.
- Use Conservative, Expected, and Optimistic scenarios to understand the next 90 days.
- Use Transactions as a searchable raw log, not the emotional center of the app.
- Use Review to resolve unclear, overdue, risky, or uncategorized items.
- Use Settings only for currency, forecast horizon, entities by scope, cash accounts, reserve buckets, recurring costs, debt, local import/export, and reset.

## Included

- Treasury Snapshot: total cash, reserved cash, truly available cash, monthly burn, runway
- Reserves: tax reserve, VAT reserve, health insurance, debt repayment, buffer
- Income Pipeline: confirmed, expected, risky
- Obligations: overdue, due soon, upcoming
- Review Queue for unclear, risky, overdue, or uncategorized items
- Scenario outcomes: Conservative, Expected, Optimistic
- Local-first IndexedDB persistence
- Local CSV transaction import with duplicate/rejected row preview
- Versioned JSON backup export/restore with validation
- Fictional sample data that demonstrates reserves, obligations, debt, and unstable project income
- Pure calculation tests for treasury separation and income scenarios

## Persistence

Finance Master uses IndexedDB database `finance-master` as its primary data store. On first load after an upgrade, it reads existing `finance-master.*` localStorage values once and migrates them into IndexedDB. Layout preferences remain lightweight localStorage values.

| Key | Purpose |
| --- | --- |
| `finance-master.ledger.v1` | Local ledger events, cash accounts, obligations, income, debt, and transaction records |
| `finance-master.settings.v1` | Base currency and forecast horizon |
| `finance-master.ui.v1` | Scope filter and legacy UI preferences |
| `finance-master.review.v1` | Review reconciliation, checklist state, notes, and completion timestamp |
| `finance-master.goals.v1` | Legacy buffer/savings targets, retained for backup compatibility |
| `finance-master.imports.v1` | Reversible CSV import batch metadata |
| `finance-master.prices.v1` | Legacy cached local values, retained for backup compatibility |
| `finance-master.layout.hero-details` | Hero detail expansion |
| `finance-master.demo-seeded.v1` | First-run demo seed marker |

New backups use the versioned `FinanceBackupV2` shape and include ledger events, finance settings, UI preferences, review state, import metadata, and compatibility fields. Existing `FinanceBackupV1` files remain restorable through a V1-to-V2 migration reader.

## Structure

```text
src/
  components/    Dashboard shell and modal workflows
  dashboard/     Finance Observatory renderer and compatibility engine
  data/          Fictional demo ledger data
  finance/       Ledger, treasury compute, CSV mapping, commands, invariants, and event helpers
  persistence/   IndexedDB repositories, backup validation, and namespaced store
  settings/      Storage-key and legacy appearance helpers
  styles/        Shared tokens and Observatory styles
  types/         Standalone TypeScript interfaces
tests/
  finance-ledger.test.mjs
  trust-hardening.test.mjs
  e2e/
```

## Intentionally Excluded

Bank sync, PSD2 integration, automatic account linking, double-entry accounting, balance sheets, full P&L reports, DATEV export, tax filing, invoice generation, receipt upload, OCR, document archive, multi-user collaboration, permissions, comments, approvals, gamified budgeting, daily spending limits, complex category budgeting, advanced chart dashboards, AI insights, notifications, and overbuilt profile/theme settings are outside this MVP.

## Future Decisions

- Whether reserve rules should become explicit percentage/fixed-amount objects or remain account bucket based.
- Whether debt items need due dates and minimum monthly payment fields in the add flow.
- Whether entities need a first-class editor beyond the current Personal / Business / Shared scope model.
