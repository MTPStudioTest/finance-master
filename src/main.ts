import './styles/base.css';
import './styles/finance-dashboard.css';
import './components/sag-icons';
import './components/core-dashboard-hero';
import './finance/date-utils.js';
import './finance/events.js';
import './finance/ledger.js';
import './finance/invariants.js';
import './finance/confidence.js';
import './finance/compute.js';
import { formatCurrencyAmount, resolveCurrencyCode } from './finance/formatting.js';
import './finance/modal-events.js';
import './finance/commands.js';
import './dashboard/financial-engine.js';
import { Store } from './persistence/store';
import { applyAppearance } from './settings/apply-appearance';
import './components/modal-controller';
import './dashboard/financial-mode.js';

window.Store = Store;
(window as unknown as { FinanceFormatting: { formatCurrencyAmount: typeof formatCurrencyAmount; resolveCurrencyCode: typeof resolveCurrencyCode } }).FinanceFormatting = {
  formatCurrencyAmount,
  resolveCurrencyCode,
};
await Store.initialize();
Store.seedDemoIfNeeded();
applyAppearance(Store);
window.FinancialMode?.init();

window.addEventListener('finance:ui-updated', () => {
  applyAppearance(Store);
  window.FinancialMode?.render();
});
