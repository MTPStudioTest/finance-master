# Finance Master QA Checklist

Use this checklist before handing off roadmap chunks that affect data safety, financial calculations, persistence, or visible dashboard workflows.

## Automated Checks

Run the smallest relevant checks while developing, then run the full set before handoff when shared logic or global UI changed.

```bash
npm test
npm run test:e2e
npm run typecheck
npm run build
```

Notes:

- `npm run build` currently emits a Vite chunk-size warning when the bundle exceeds 500 kB. Treat new build errors as blockers; the chunk warning is known.
- Run focused E2E with `npm run test:e2e -- -g "test name"` while iterating on a single workflow.

## Data Safety Smoke

- Export a backup from Settings and confirm it downloads without console errors.
- Restore preview rejects malformed JSON and unsupported backup versions.
- Restore preview summarizes schema, finance events, settings, review state, imports, and goals before replacement.
- Reset local data opens a typed confirmation and recommends backup first.
- Restore sample data opens a typed confirmation and labels the result as fictional sample data.
- Delete sample data opens a typed confirmation and leaves the empty dashboard with first-run guidance after reload.
- `?repair=demo` must not delete existing local finance data.

## Financial Calculation Smoke

- Money Status distinguishes Actual Cash, Protected Cash, Available Cash, Safe-to-Spend, Monthly Burn, and Runway.
- Safe-to-Spend excludes protected cash, confirmed short-term obligations, debt due soon, and the configured buffer.
- Expected income is visible as forecast-only and never counted as actual cash.
- Recurring costs normalize weekly, biweekly, monthly, quarterly, and yearly schedules into monthly burn.
- Debt payment plans affect burn/runway only when their status requires current pressure.
- Debt without a due date or payment plan creates review pressure instead of hidden burn.
- Transfers between own accounts do not appear as income or expense.

## Manual Board Smoke

- Money Status: sample data note is visible only for the seeded fictional ledger; empty setup shows the minimum useful setup checklist.
- Decision Lab: ranked guidance stays readable at desktop and tablet widths; preview/save actions do not mutate finance data.
- Cash Timeline: actual cash, available cash, expected landing, and forecast low points are visibly separate.
- Money Plan: cash accounts, protected account allocations, reserve buckets, recurring costs, and debt plans are editable from focused actions.
- Risk Radar: rows explain source, impact, and route back to the relevant board.
- Reality Check: queue actions can categorize, match payments, update income, add debt plans, and save a checkpoint.
- Records: search stays visible, advanced filters collapse, CSV import previews accepted/duplicate/rejected rows, and imports are reversible.
- Settings: app preferences persist; backup/restore and destructive sample/reset actions remain separated from transaction/import work.

## Responsive And Accessibility Smoke

- Desktop, tablet, and mobile layouts must avoid horizontal overflow.
- Mobile navigation opens from the hamburger button and closes after selecting a board.
- Major metric help buttons open explainers and close cleanly.
- Dark visual modes keep ledger and review surfaces readable.
- Reduced-motion preference persists and applies the expected document classes.

## Documentation Handoff

- Update `docs/CODEBASE_AUDIT.md` for any new architecture, data model, storage, destructive-action, or calculation behavior.
- Update `docs/FINANCE_MASTER_ROADMAP.md` only when roadmap meaning changes, not for every implementation detail.
- Keep README commands accurate when package scripts change.
