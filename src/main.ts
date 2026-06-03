import './styles/base.css';
import './styles/finance-dashboard.css';
import './components/sag-icons';
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
import { FINANCE_STORAGE_KEYS } from './settings/storage-keys';
import './components/modal-controller';
import './dashboard/financial-mode.js';

async function repairLocalFinanceDataFromUrl(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  if (params.get('repair') !== 'demo') return;
  FINANCE_STORAGE_KEYS.forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage may be unavailable in private or embedded contexts.
    }
  });
  if ('indexedDB' in window) {
    await new Promise<void>((resolve) => {
      const request = window.indexedDB.deleteDatabase('finance-master');
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    });
  }
  params.delete('repair');
  const nextSearch = params.toString();
  window.history.replaceState({}, '', `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`);
}

window.Store = Store;
(window as unknown as { FinanceFormatting: { formatCurrencyAmount: typeof formatCurrencyAmount; resolveCurrencyCode: typeof resolveCurrencyCode } }).FinanceFormatting = {
  formatCurrencyAmount,
  resolveCurrencyCode,
};
await repairLocalFinanceDataFromUrl();
await Store.initialize();
Store.seedDemoIfNeeded();
applyAppearance(Store);
window.FinancialMode?.init();

window.addEventListener('finance:ui-updated', () => {
  applyAppearance(Store);
  window.FinancialMode?.render();
});
