# Finance Master Feature Audit

## Existing Visible Features

- Finance Observatory landing dashboard: treasury snapshot, reserves, income, obligations, review queue, scenarios (`src/dashboard/financial-mode.js`).
- Global Add flow for income, transactions, recurring costs, cash accounts, debt, CSV import (`src/components/modal-controller.ts`).
- Transactions ledger modal with filtering, manual transaction entry, and reversal (`src/components/modal-controller.ts`).
- Review queue and weekly review modal (`src/dashboard/financial-mode.js`, `src/components/modal-controller.ts`).
- Settings modal for base currency, forecast horizon, accounts, recurring costs, debt, local data, and sample data (`src/components/modal-controller.ts`).
- Local-first persistence through repository-backed Store plus JSON backup/export/import (`src/persistence/store.ts`, `src/persistence/repositories.ts`).
- CSV import preview/import/undo (`src/finance/csv-import.js`, `src/components/modal-controller.ts`, `src/persistence/store.ts`).

## Existing Hidden Or Dormant Features

- Setup checklist, quiet/focus mode, collapsible sections, and pipeline tabs were implemented but not consistently visible in the primary route (`src/dashboard/financial-mode.js`).
- Cashflow rhythm, cash calendar, goals, projection chart, scenario lab, tension signals, operational ledger, and hybrid treasury summary existed as render helpers but were mostly dormant (`src/dashboard/financial-mode.js`).
- Goals modal and goal edit flow existed but were reachable only through hidden/secondary paths (`src/components/modal-controller.ts`, `src/finance/goals.js`).
- Backup restore modal existed but lacked a direct file chooser when opened outside Settings (`src/components/modal-controller.ts`).
- Debt payment modal existed but had weak reachability and no helpful empty state (`src/components/modal-controller.ts`).
- Web3/DeFi data model and crypto quote provider exist as compatibility surfaces, but they are not production-ready treasury flows (`src/types/finance.ts`, `src/integrations/crypto-prices.ts`, `src/persistence/store.ts`).

## Broken Or Partially Wired Features

- Appearance settings persisted `aurora`, `midnight`, and `bright`, while the Settings UI exposed only a dark/bright abstraction (`src/persistence/store.ts`, `src/components/modal-controller.ts`, `src/settings/apply-appearance.ts`).
- Several modal save paths silently returned on invalid required data: income, cash account, recurring cost, debt add, debt payment, transaction Store failures, settlement, CSV import, and backup restore (`src/components/modal-controller.ts`).
- Mixed-currency formatting ignored explicit currency arguments because dashboard formatting always preferred base currency when Store was available (`src/dashboard/financial-mode.js`).
- `confirmedIncome90d` summed all paid invoices instead of filtering to a 90-day window (`src/dashboard/financial-engine.js`).
- Treasury scenario variables named `confirmed90`, `expected90`, and `risky90` were not forecast-window scoped (`src/finance/compute.js`).
- CoinGecko fetching had no timeout and could make optional market refresh feel broken (`src/integrations/crypto-prices.ts`, `src/persistence/store.ts`).
- Existing E2E selectors were stale against the focused MVP labels and need to follow the grouped hierarchy (`tests/e2e`).

## Reactivated Now

- Grouped top-level shell: Dashboard, Ledger, Planning, Review, Data, Settings (`index.html`, `src/dashboard/financial-mode.js`).
- Persisted active section in `localStorage` through `FinancialMode.setSection(section)` (`src/dashboard/financial-mode.js`).
- Dashboard keeps the Observatory as the default emotional center (`src/dashboard/financial-mode.js`).
- Ledger surfaces a page-native transaction workspace with filtering, work actions, audit evidence, account cards, and recurring/debt cards (`src/dashboard/financial-mode.js`).
- Planning surfaces pipeline tabs, goals, cash calendar, account/debt planning, projection, and scenario lab (`src/dashboard/financial-mode.js`).
- Review surfaces queue, signals, and weekly review status (`src/dashboard/financial-mode.js`).
- Data surfaces CSV import, backup export/restore, latest import undo, and sample data controls (`src/dashboard/financial-mode.js`).
- Settings surfaces persisted currency, horizon, scope, reduced motion, and all appearance modes (`src/dashboard/financial-mode.js`, `src/components/modal-controller.ts`).

## Hardening Slice: Page-Native Ledger

- Transactions is now treated as a first-class ledger workspace, not a preview plus a large modal.
- The Transactions page exposes full ledger filtering, Clean / Work / Audit views, CSV import/export, and inline Categorize, Match, and Reverse actions (`src/dashboard/financial-mode.js`).
- The old full-ledger modal remains available as compatibility code, but normal ledger browsing no longer depends on it.
- Invoice view tabs now have persisted page state and a wired click handler (`src/dashboard/financial-mode.js`).
- Monthly Review completion now validates the current five-step checklist instead of stale legacy checklist ids (`src/components/modal-controller.ts`).
- E2E coverage has been refreshed around the current grouped IA, floating quick-add button, page-native ledger, invoices, local data controls, and review workflows (`tests/e2e/finance-master.spec.ts`).

## Hardening Slice: Structure And System Boundaries

- Shared dashboard UI helpers moved out of the main renderer (`src/dashboard/finance-ui.js`).
- Section composition moved into a registry so the `FinancialMode` controller no longer owns the page-routing table (`src/dashboard/section-registry.js`).
- Shared modal UI helpers moved out of the modal controller (`src/components/modal-ui.ts`).
- Quick-add and transaction modal renderers moved into a focused workflow module (`src/components/modal-workflows/core.ts`).
- Settings is now focused on preferences and system boundaries; data export, restore, reset, CSV import, and sample data remain in Import & Backup (`src/dashboard/financial-mode.js`).
- Undoing a CSV import now closes any modal and re-renders the current page instead of opening a removed Settings modal (`src/components/modal-controller.ts`).
- Dashboard CSS has a lightweight organization header and reusable primitive classes for future cleanup (`src/styles/finance-dashboard.css`).

## Postponed

- Web3 position UI and DeFi position UI remain out of production flows. The compatibility modals now state that market portfolio tracking is postponed (`src/components/modal-controller.ts`).
- CoinGecko quote refresh remains optional and non-blocking. Timeout/error handling was added, but no main navigation entry exposes it (`src/integrations/crypto-prices.ts`, `src/persistence/store.ts`).
- Bank sync, PSD2, automatic account linking, double-entry accounting, invoices, receipt scanning/OCR, AI insights, notification systems, and multi-user flows remain intentionally absent.

## Remove Only If Clearly Obsolete

- Legacy Web3/DeFi event and type support should stay for backup compatibility unless a dedicated migration removes it safely (`src/types/finance.ts`, `src/finance/ledger.js`).
- Existing modal aliases such as `financeOverview` should stay while tests and old internal calls still use them (`src/components/modal-controller.ts`).

## Source Map

- App shell and dashboard IA: `index.html`, `src/dashboard/financial-mode.js`, `src/dashboard/section-registry.js`, `src/dashboard/finance-ui.js`, `src/styles/base.css`, `src/styles/finance-dashboard.css`.
- Modal reachability and validation: `src/components/modal-controller.ts`, `src/components/modal-ui.ts`, `src/components/modal-workflows/core.ts`.
- Store/settings/persistence: `src/persistence/store.ts`, `src/settings/apply-appearance.ts`, `src/settings/storage-keys.ts`.
- Core finance calculations: `src/finance/compute.js`, `src/dashboard/financial-engine.js`.
- Import/backup: `src/finance/csv-import.js`, `src/persistence/backup-validation.js`, `src/persistence/store.ts`.
- Optional crypto pricing: `src/integrations/crypto-prices.ts`.
- Tests to update/extend: `src/**/*.test.*`, `tests/e2e`.
