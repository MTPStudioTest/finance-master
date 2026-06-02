# Finance Master

Finance Master is a focused standalone extraction of the Finance Board from Life-OS / Dashi. It keeps the calm Aurora-inspired visual language while turning the dashboard into a local-first operating cockpit for solo operators, freelancers, founders, and independent creatives.

The app opens directly into the finance dashboard. It has no authentication layer, bank credential integration, or backend.

## Run Locally

Requirements:

- Node.js 20+
- npm

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

Verification commands:

```bash
npm test
npm run test:e2e
npm run typecheck
npm run build
```

## Core Workflow

- Record account-aware income and expenses from the global `+ Add` action.
- Organize accounts, transactions, recurring costs, and pipeline items as Personal, Business, or Shared.
- Use the setup checklist until accounts, recurring costs, and pipeline inputs are complete.
- Scan liquidity, runway, the 30/60/90-day low point, and the next three material cash events.
- Track savings and emergency-buffer goals from linked cash-account balances.
- Run a weekly review from the top bar, reconcile each cash account, confirm operating checks, and leave a short note.
- Choose a CSV file or paste transactions, map common bank-export columns, preview accepted, duplicate, and rejected rows, import as a batch, and reverse the latest batch from Settings.
- Export or restore a versioned JSON backup with a validated in-app preview before replacement.

## Included

- Liquidity, runway, monthly cash flow, allocation, debt, investment, Web3, and DeFi views
- Pipeline history, expected dates, confidence states, and cash-flow projections
- Baseline, Conservative, and Stretch scenario presets
- Currency, projection horizon, scope filter, and Aurora / Midnight / Bright appearance settings
- Finance ledger events, reversals, invariant checks, confidence helpers, and focused regression tests
- Local demo data with independent Restore sample data and Delete sample data controls
- Optional read-only CoinGecko wallet valuation refresh with local cache, timestamps, and per-position manual overrides
- Accessible modal focus handling, visible focus states, keyboard navigation, and responsive capture layouts
- Playwright browser regressions for the core local-first workflows
- Savings and buffer goals with live linked-account progress and scope filtering
- Weekly account reconciliation with review timestamps, checklist state, notes, and dashboard due prompts

## Persistence

Finance Master uses IndexedDB database `finance-master` as its primary data store. On first load after an upgrade, it reads existing `finance-master.*` localStorage values once and migrates them into IndexedDB. Layout preferences remain lightweight localStorage values.

| Key | Purpose |
| --- | --- |
| `finance-master.ledger.v1` | Finance ledger events, transactions, and demo records |
| `finance-master.settings.v1` | Base currency and projection horizon |
| `finance-master.ui.v1` | Appearance, motion, scope filter, scenarios, and wallet price source |
| `finance-master.review.v1` | Weekly review reconciliation, checklist state, notes, and completion timestamp |
| `finance-master.goals.v1` | Savings and buffer goals linked to cash accounts |
| `finance-master.imports.v1` | Reversible CSV import batch metadata |
| `finance-master.prices.v1` | Cached opt-in wallet price quotes |
| `finance-master.layout.focus-mode` | Quiet-view preference |
| `finance-master.layout.pipeline-tab` | Selected pipeline tab |
| `finance-master.layout.collapsed.*` | Collapsed dashboard section state |
| `finance-master.layout.hero-details` | Liquidity-card detail expansion |
| `finance-master.demo-seeded.v1` | First-run demo seed marker |

New backups use the versioned `FinanceBackupV2` shape and include ledger events, goals, finance settings, UI preferences, review state, CSV import metadata, and cached prices. Existing `FinanceBackupV1` files remain restorable through a V1-to-V2 migration reader.

## Structure

```text
src/
  components/    Dashboard shell, modal workflows, and icon helpers
  dashboard/     Extracted Finance Board renderer and finance engine
  data/          Standalone demo ledger data
  finance/       Ledger, compute, CSV mapping, commands, invariants, and event helpers
  integrations/  Optional read-only price providers
  persistence/   IndexedDB repositories, backup validation, and namespaced store
  settings/      Appearance and storage-key configuration
  styles/        Shared tokens and extracted finance dashboard styles
  types/         Standalone TypeScript interfaces
tests/
  finance-ledger.test.mjs
  trust-hardening.test.mjs
  e2e/
```

## Intentionally Excluded

Vision Mode, Personal Mode, Ritual / Slow Life Mode, Archive, Listening Room, walk and forest logs, gratitude widgets, unrelated dashboards, experiments, authentication, backend services, and bank aggregation are not part of this repository.

## Future Improvements

- Add reusable bank-specific CSV mapping templates if repeated imports justify them.
- Add encrypted multi-device sync only after the local weekly ritual is proven.
- Consider read-only invoice or bank imports after local backup and review habits are established.
- Add functional drag-and-drop widget ordering only when its layout persistence model is ready.
