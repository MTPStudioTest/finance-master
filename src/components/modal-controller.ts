import { Store } from '../persistence/store';
import { validateFinanceBackup } from '../persistence/backup-validation.js';
import { applyAppearance } from '../settings/apply-appearance';
import {
  buildCsvImportPreview,
  csvDelimiterLabel,
  inferCsvColumnMapping,
  parseCsvDocument,
} from '../finance/csv-import.js';
import type { CsvDocument } from '../finance/csv-import.js';
import type {
  CsvColumnMapping,
  CsvImportPreview,
  FinanceBackupPreview,
  FinanceScope,
} from '../types/finance';

const overlay = document.querySelector<HTMLDivElement>('#modal-overlay');
const body = document.querySelector<HTMLDivElement>('#modal-body');
let csvRaw = '';
let csvSummary = '';
let csvAccountId = '';
let csvSourceFile = 'pasted-transactions.csv';
let csvDocument: CsvDocument | null = null;
let csvMapping: CsvColumnMapping = { date: '', description: '' };
let csvPreview: CsvImportPreview | null = null;
let csvDefaultCategory = 'uncategorized';
let csvDefaultScope: FinanceScope = 'business';
let pendingBackup: unknown = null;
let backupPreview: FinanceBackupPreview | null = null;
let modalReturnFocus: HTMLElement | null = null;
const transactionFilters = {
  accountId: '',
  scope: 'all',
  categoryId: '',
  direction: 'all',
  period: 'all',
};

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function value(id: string): string {
  return document.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)?.value.trim() || '';
}

function checked(id: string): boolean {
  return document.querySelector<HTMLInputElement>(`#${id}`)?.checked === true;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function toIso(date = today()): string {
  const parsed = Date.parse(`${date}T12:00:00`);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : new Date().toISOString();
}

function financeId(prefix: string): string {
  return `${prefix}-${window.FinanceEvents?.createId?.() || Date.now().toString(36)}`;
}

function money(amount: unknown): string {
  const settings = Store.getFinanceSettings();
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: settings.baseCurrency,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function scopeOptions(selected = 'shared'): string {
  return [
    ['business', 'Business'],
    ['personal', 'Personal'],
    ['shared', 'Shared'],
  ].map(([entry, label]) => `<option value="${entry}"${selected === entry ? ' selected' : ''}>${label}</option>`).join('');
}

function scopeFilterOptions(selected = 'all'): string {
  return `<option value="all"${selected === 'all' ? ' selected' : ''}>All scopes</option>${scopeOptions(selected)}`;
}

function formatDate(value: unknown): string {
  const parsed = Date.parse(String(value || ''));
  if (!Number.isFinite(parsed)) return 'Unknown date';
  return new Date(parsed).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function optionList(selected = '', emptyLabel = 'Not mapped'): string {
  const headers = csvDocument?.headers || [];
  return `<option value="">${emptyLabel}</option>${headers.map((header) => (
    `<option value="${escapeHtml(header)}"${header === selected ? ' selected' : ''}>${escapeHtml(header)}</option>`
  )).join('')}`;
}

function showModalError(message: string): void {
  if (!body) return;
  let error = body.querySelector<HTMLDivElement>('.modal-error');
  if (!error) {
    error = document.createElement('div');
    error.className = 'modal-error';
    error.setAttribute('role', 'alert');
    error.tabIndex = -1;
    body.querySelector('h2')?.insertAdjacentElement('afterend', error);
  }
  error.textContent = message;
  error.focus();
}

function formActions(type: string, edit = false): string {
  return `
    <div class="modal-actions">
      <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Cancel</button>
      <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="saveFinanceModal" data-action-args="'${type}'">${edit ? 'Save' : 'Create'}</button>
    </div>
  `;
}

function deactivateButton(action: string, edit: boolean): string {
  return edit
    ? `<button class="btn-danger ui-btn" type="button" data-action="${action}">Deactivate</button>`
    : '';
}

function renderOverview(): string {
  const snapshot = Store.getFinancialSnapshot();
  const readModel = Store.getFinancialReadModel();
  const cutoff = transactionFilters.period === 'all'
    ? 0
    : Date.now() - (Number(transactionFilters.period) * 24 * 60 * 60 * 1000);
  const active = (readModel.transactions || [])
    .filter((event: Record<string, unknown>) => !transactionFilters.accountId || String(event.accountId) === transactionFilters.accountId)
    .filter((event: Record<string, unknown>) => transactionFilters.scope === 'all' || String(event.scope) === transactionFilters.scope)
    .filter((event: Record<string, unknown>) => !transactionFilters.categoryId || String(event.categoryId).toLowerCase().includes(transactionFilters.categoryId.toLowerCase()))
    .filter((event: Record<string, unknown>) => transactionFilters.direction === 'all' || String(event.type) === transactionFilters.direction)
    .filter((event: Record<string, unknown>) => !cutoff || Date.parse(String(event.timestamp || '')) >= cutoff);
  return `
    <div class="modal-form">
      <h2 id="modal-title">Transactions</h2>
      <div class="modal-grid-two">
        ${[
          ['Real balance', money(snapshot.realBalance)],
          ['Projected balance', money(snapshot.projectedBalance)],
          ['Weighted pipeline', money(snapshot.weightedPipeline)],
          ['Monthly burn', money(snapshot.monthlyBurn)],
          ['Runway', snapshot.runwayMonths == null ? 'Unknown' : `${Number(snapshot.runwayMonths).toFixed(1)} months`],
          ['Confidence', `${Math.round((Number(snapshot.confidenceScore) || 0) * 100)}%`],
        ].map(([label, fieldValue]) => `
          <div class="form-group"><label>${label}</label><input aria-label="${label}" value="${escapeHtml(fieldValue)}" readonly /></div>
        `).join('')}
      </div>
      <div class="modal-section">
        <div class="ui-title">Filter ledger</div>
        <div class="modal-grid-three">
          <select id="modal-filter-account" aria-label="Filter by account">${accountOptions(transactionFilters.accountId)}</select>
          <select id="modal-filter-scope" aria-label="Filter by scope">${scopeFilterOptions(transactionFilters.scope)}</select>
          <input id="modal-filter-category" aria-label="Filter by category" value="${escapeHtml(transactionFilters.categoryId)}" placeholder="Category" />
          <select id="modal-filter-direction" aria-label="Filter by direction">
            <option value="all"${transactionFilters.direction === 'all' ? ' selected' : ''}>Income and expenses</option>
            <option value="income.received"${transactionFilters.direction === 'income.received' ? ' selected' : ''}>Income only</option>
            <option value="expense.recorded"${transactionFilters.direction === 'expense.recorded' ? ' selected' : ''}>Expenses only</option>
          </select>
          <select id="modal-filter-period" aria-label="Filter by period">
            <option value="all"${transactionFilters.period === 'all' ? ' selected' : ''}>All dates</option>
            <option value="30"${transactionFilters.period === '30' ? ' selected' : ''}>Past 30 days</option>
            <option value="90"${transactionFilters.period === '90' ? ' selected' : ''}>Past 90 days</option>
          </select>
          <button class="ui-btn ui-btn--secondary" type="button" data-action="refreshTransactionsModal">Apply filters</button>
        </div>
      </div>
      <div class="modal-section">
        <div class="ui-title">Ledger entries</div>
        ${active.length ? active.map((event: Record<string, unknown>) => `
          <div class="modal-list-row">
            <span><strong>${escapeHtml(event.description || event.type)}</strong><br><small>${escapeHtml(event.accountName || 'Unassigned')} · ${escapeHtml(event.categoryId || 'uncategorized')} · ${formatDate(event.timestamp)}</small></span>
            <span class="${event.type === 'income.received' ? 'fin-val-pos' : 'fin-val-neg'}">${event.type === 'income.received' ? '+' : '-'}${money(event.amount)}</span>
            <button class="fin-mini-btn" type="button" data-action="deleteTransaction" data-action-args="'${escapeHtml(event.id)}'" aria-label="Reverse transaction">&times;</button>
          </div>
        `).join('') : '<div class="fin-compact-empty">No transactions yet.</div>'}
      </div>
      <div class="modal-section">
        <div class="ui-title">Add transaction</div>
        <div class="modal-grid-three">
          <input id="modal-txn-desc" aria-label="Transaction note" placeholder="Note" />
          <input id="modal-txn-amount" aria-label="Transaction amount" type="number" step="0.01" placeholder="-20 or 500" />
          <input id="modal-txn-date" aria-label="Transaction date" type="date" value="${today()}" />
          <select id="modal-txn-account" aria-label="Transaction account">${accountOptions('', false)}</select>
          <input id="modal-txn-category" aria-label="Transaction category" placeholder="Category" value="uncategorized" />
          <select id="modal-txn-scope" aria-label="Transaction scope">${scopeOptions('business')}</select>
        </div>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="addTransaction">Add transaction</button>
      </div>
    </div>
  `;
}

function renderQuickAdd(): string {
  return `
    <div class="modal-form">
      <h2 id="modal-title">Add to Finance Master</h2>
      <p class="modal-copy">Capture today quickly or add a planning input.</p>
      <div class="quick-add-grid">
        <button class="quick-add-card" type="button" data-action="openEditModal" data-action-args="'transaction'"><strong>Transaction</strong><span>Record income or an expense</span></button>
        <button class="quick-add-card" type="button" data-action="openEditModal" data-action-args="'fiatAccount'"><strong>Cash account</strong><span>Add an account balance</span></button>
        <button class="quick-add-card" type="button" data-action="openEditModal" data-action-args="'expense'"><strong>Recurring cost</strong><span>Improve runway accuracy</span></button>
        <button class="quick-add-card" type="button" data-action="openEditModal" data-action-args="'income'"><strong>Pipeline item</strong><span>Add expected income</span></button>
        <button class="quick-add-card" type="button" data-action="openEditModal" data-action-args="'goal'"><strong>Savings goal</strong><span>Track a buffer or target</span></button>
        <button class="quick-add-card" type="button" data-action="openEditModal" data-action-args="'csvImport'"><strong>Import CSV</strong><span>Map a bank statement</span></button>
      </div>
    </div>
  `;
}

function renderTransaction(): string {
  return `
    <div class="modal-form">
      <h2 id="modal-title">Add transaction</h2>
      <p class="modal-copy">Use a positive amount for income and a negative amount for an expense.</p>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-fast-txn-desc">Note</label><input id="modal-fast-txn-desc" placeholder="Client payment or studio rent" /></div>
        <div class="form-group"><label for="modal-fast-txn-amount">Amount</label><input id="modal-fast-txn-amount" type="number" step="0.01" placeholder="-20 or 500" /></div>
        <div class="form-group"><label for="modal-fast-txn-date">Date</label><input id="modal-fast-txn-date" type="date" value="${today()}" /></div>
        <div class="form-group"><label for="modal-fast-txn-account">Account</label><select id="modal-fast-txn-account">${accountOptions('', false)}</select></div>
        <div class="form-group"><label for="modal-fast-txn-category">Category</label><input id="modal-fast-txn-category" placeholder="uncategorized" /></div>
        <div class="form-group"><label for="modal-fast-txn-scope">Scope</label><select id="modal-fast-txn-scope">${scopeOptions('business')}</select></div>
      </div>
      ${formActions('transaction')}
    </div>
  `;
}

function renderSettings(): string {
  const settings = Store.getFinanceSettings();
  const ui = Store.getUiSettings();
  const latestImport = Store.getImportState().batches.slice(-1)[0];
  return `
    <div class="modal-form">
      <h2 id="modal-title">Finance Master settings</h2>
      <div class="modal-grid-two">
        <div class="form-group">
          <label for="modal-settings-currency">Base currency</label>
          <select id="modal-settings-currency">
            ${['EUR', 'USD', 'GBP', 'CHF'].map((currency) => `<option${settings.baseCurrency === currency ? ' selected' : ''}>${currency}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="modal-settings-forecast">Projection horizon</label>
          <select id="modal-settings-forecast">
            ${[30, 60, 90, 180].map((days) => `<option value="${days}"${settings.forecastDays === days ? ' selected' : ''}>${days} days</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="modal-settings-appearance">Appearance</label>
          <select id="modal-settings-appearance">
            <option value="aurora"${ui.appearance === 'aurora' ? ' selected' : ''}>Aurora</option>
            <option value="midnight"${ui.appearance === 'midnight' ? ' selected' : ''}>Midnight</option>
            <option value="bright"${ui.appearance === 'bright' ? ' selected' : ''}>Bright</option>
          </select>
        </div>
        <label class="settings-check">
          <input id="modal-settings-motion" type="checkbox"${ui.reducedMotion ? ' checked' : ''} />
          <span>Reduce motion</span>
        </label>
      </div>
      <div class="modal-section">
        <div class="ui-title">Scenario assumptions</div>
        <div class="modal-grid-three">
          <div class="form-group"><label for="modal-settings-market">Market shift %</label><input id="modal-settings-market" type="number" min="-50" max="50" value="${ui.scenario.marketMajors}" /></div>
          <div class="form-group"><label for="modal-settings-burn">Burn delta %</label><input id="modal-settings-burn" type="number" min="-30" max="30" value="${ui.scenario.burnDelta}" /></div>
          <div class="form-group"><label for="modal-settings-floor">Probability floor %</label><input id="modal-settings-floor" type="number" min="0" max="100" value="${ui.scenario.probFloor}" /></div>
        </div>
      </div>
      <div class="modal-section settings-reset-panel">
        <div>
          <div class="ui-title">Wallet valuations</div>
          <p>Keep wallet pricing manual or opt into a read-only CoinGecko refresh. Manual overrides are never replaced.</p>
        </div>
        <div class="settings-reset-actions">
          <select id="modal-settings-wallet-prices" aria-label="Wallet valuation source">
            <option value="manual"${ui.walletPriceSource === 'manual' ? ' selected' : ''}>Manual only</option>
            <option value="coingecko"${ui.walletPriceSource === 'coingecko' ? ' selected' : ''}>CoinGecko read-only</option>
          </select>
          <button class="ui-btn ui-btn--secondary" type="button" data-action="refreshCryptoPrices">Refresh wallet prices</button>
        </div>
      </div>
      <div class="modal-section settings-reset-panel">
        <div>
          <div class="ui-title">Data portability</div>
          <p>Download a complete local backup or restore one after previewing its contents.</p>
          ${latestImport ? `<p>Latest CSV batch: ${escapeHtml(latestImport.sourceFile)} · ${latestImport.fingerprints.length} row${latestImport.fingerprints.length === 1 ? '' : 's'} · ${formatDate(latestImport.importedAt)}</p>` : ''}
        </div>
        <div class="settings-reset-actions">
          <button class="ui-btn ui-btn--secondary" type="button" data-action="exportFinanceBackup">Export JSON backup</button>
          <button class="ui-btn ui-btn--secondary" type="button" data-action="chooseFinanceBackup">Restore JSON backup</button>
          ${latestImport ? `<button class="ui-btn ui-btn--secondary" type="button" data-action="undoImportBatch" data-action-args="'${escapeHtml(latestImport.id)}'">Undo latest CSV import</button>` : ''}
          <input id="modal-backup-file" type="file" accept="application/json,.json" hidden />
        </div>
      </div>
      <div class="modal-section settings-reset-panel">
        <div>
          <div class="ui-title">Sample data</div>
          <p>Restore the original demo ledger or clear it for an empty dashboard. Your appearance, layout, and finance settings stay untouched.</p>
        </div>
        <div class="settings-reset-actions">
          <button class="ui-btn ui-btn--secondary" type="button" data-action="resetDemoData">Restore sample data</button>
          <button class="btn-danger ui-btn" type="button" data-action="deleteDemoData">Delete sample data</button>
        </div>
      </div>
      <div class="modal-actions modal-actions--split">
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Cancel</button>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="saveFinanceModal" data-action-args="'settings'">Save</button>
      </div>
    </div>
  `;
}

function renderSettleIncome(id = ''): string {
  const item = (Store.getFinancialReadModel().pipelineDeals || []).find((entry: Record<string, unknown>) => String(entry.id) === id);
  return `
    <div class="modal-form">
      <h2 id="modal-title">Mark pipeline item as paid</h2>
      <p class="modal-copy">${escapeHtml(item?.title || 'Pipeline item')} · ${money(item?.value)}</p>
      <input id="modal-settle-id" type="hidden" value="${escapeHtml(id)}" />
      <div class="form-group"><label for="modal-settle-account">Settlement account</label><select id="modal-settle-account">${accountOptions(String(item?.destinationAccountId || ''), false)}</select></div>
      ${formActions('settleIncome')}
    </div>
  `;
}

function renderWeeklyReview(): string {
  const readModel = Store.getFinancialReadModel();
  const snapshot = Store.getFinancialSnapshot();
  const review = Store.getReviewState();
  const accounts = readModel.fiatAccounts || [];
  const checks = [
    ['recurring-costs', 'Recurring costs', (readModel.recurringExpenses || []).length > 0, 'Check recurring costs and confirm they still reflect your month.'],
    ['pipeline', 'Pipeline', (readModel.pipelineDeals || []).some((entry: Record<string, unknown>) => window.FinanceLedger?.isPipelineActive?.(entry.status)), 'Review expected income and timing.'],
    ['signals', 'Signals', Number(snapshot.confidenceScore) >= 0.75, 'Inspect runway, low points, and missing inputs.'],
  ];
  return `
    <div class="modal-form">
      <h2 id="modal-title">Weekly review</h2>
      <p class="modal-copy">A short ritual for checking the ground beneath the next week.</p>
      <div class="modal-section">
        <div class="ui-title">Reconcile account balances</div>
        <div class="review-grid">
          ${accounts.length ? accounts.map((account: Record<string, unknown>, index: number) => `
            <label class="review-row">
              <input id="modal-review-account-${index}" class="review-account-check" type="checkbox" data-account-id="${escapeHtml(account.id)}" />
              <span><strong>${escapeHtml(account.name)}</strong><small>${escapeHtml(account.scope || 'shared')} · Confirm the live balance</small></span>
              <input id="modal-review-balance-${index}" class="review-balance-input" aria-label="${escapeHtml(account.name)} reconciled balance" type="number" step="0.01" value="${escapeHtml(account.balance)}" />
            </label>
          `).join('') : '<div class="fin-compact-empty">Add a cash account before completing a review.</div>'}
        </div>
      </div>
      <div class="modal-section">
        <div class="ui-title">Operating checks</div>
        <div class="review-grid">
        ${checks.map(([id, label, ready, note]) => `
          <label class="review-row ${ready ? 'is-complete' : ''}">
            <input id="modal-review-${id}" type="checkbox" />
            <span><strong>${label}</strong><small>${note}</small></span>
          </label>
        `).join('')}
        </div>
      </div>
      <div class="form-group"><label for="modal-review-notes">Review notes</label><textarea id="modal-review-notes" rows="3" placeholder="What changed, what needs attention?">${escapeHtml(review.notes)}</textarea></div>
      <p class="modal-copy">Last reviewed: ${review.lastReviewedAt ? formatDate(review.lastReviewedAt) : 'Not reviewed yet'}</p>
      <div class="modal-actions">
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Later</button>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="completeWeeklyReview">Mark review complete</button>
      </div>
    </div>
  `;
}

function renderGoals(): string {
  const goals = Store.getGoalProgress();
  return `
    <div class="modal-form">
      <h2 id="modal-title">Savings and buffer goals</h2>
      <p class="modal-copy">Progress is derived from the current balances of linked cash accounts.</p>
      <div class="modal-section">
        ${goals.length ? goals.map((goal) => `
          <div class="modal-list-row">
            <span><strong>${escapeHtml(goal.name)}</strong><br><small>${escapeHtml(goal.type)} · ${Math.round(goal.progressPercent)}% · ${money(goal.currentAmount)} of ${money(goal.targetAmount)}</small></span>
            <span class="goal-modal-actions">
              <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'goal', '${escapeHtml(goal.id)}'">Edit</button>
              <button class="fin-mini-btn" type="button" data-action="deleteGoal" data-action-args="'${escapeHtml(goal.id)}'">Delete</button>
            </span>
          </div>
        `).join('') : '<div class="fin-compact-empty">No goals yet. Add a safety buffer or a savings target.</div>'}
      </div>
      <div class="modal-actions">
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Close</button>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="openEditModal" data-action-args="'goal'">Add goal</button>
      </div>
    </div>
  `;
}

function renderGoal(id = ''): string {
  const goal = Store.getGoals().goals.find((entry) => entry.id === id);
  const accounts = Store.getFinancialReadModel().fiatAccounts || [];
  return `
    <div class="modal-form">
      <h2 id="modal-title">${goal ? 'Edit goal' : 'Add savings goal'}</h2>
      <p class="modal-copy">Link one or more cash accounts. Their balances become this goal's live progress.</p>
      <input id="modal-goal-id" type="hidden" value="${escapeHtml(goal?.id || '')}" />
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-goal-name">Goal name</label><input id="modal-goal-name" value="${escapeHtml(goal?.name || '')}" placeholder="Emergency buffer" /></div>
        <div class="form-group"><label for="modal-goal-type">Goal type</label><select id="modal-goal-type"><option value="buffer"${goal?.type === 'buffer' ? ' selected' : ''}>Buffer</option><option value="savings"${goal?.type === 'savings' ? ' selected' : ''}>Savings</option></select></div>
        <div class="form-group"><label for="modal-goal-target">Target amount</label><input id="modal-goal-target" type="number" step="0.01" min="0.01" value="${escapeHtml(goal?.targetAmount || '')}" /></div>
        <div class="form-group"><label for="modal-goal-date">Target date</label><input id="modal-goal-date" type="date" value="${escapeHtml(goal?.targetDate || '')}" /></div>
        <div class="form-group"><label for="modal-goal-scope">Scope</label><select id="modal-goal-scope">${scopeOptions(goal?.scope || 'shared')}</select></div>
      </div>
      <div class="modal-section">
        <div class="ui-title">Linked cash accounts</div>
        <div class="goal-account-grid">
          ${accounts.length ? accounts.map((account: Record<string, unknown>, index: number) => `
            <label class="settings-check goal-account-check">
              <input id="modal-goal-account-${index}" type="checkbox" value="${escapeHtml(account.id)}"${goal?.linkedAccountIds.includes(String(account.id)) ? ' checked' : ''} />
              <span>${escapeHtml(account.name)} · ${money(account.balance)}</span>
            </label>
          `).join('') : '<div class="fin-compact-empty">Add a cash account before linking progress.</div>'}
        </div>
      </div>
      ${formActions('goal', Boolean(goal))}
    </div>
  `;
}

function renderCsvImport(): string {
  const hasDocument = Boolean(csvDocument);
  const hasPreview = Boolean(csvPreview);
  const previewRows = csvPreview?.rows || [];
  const rejected = csvPreview?.rejected || [];
  const duplicates = csvPreview?.duplicates || [];
  return `
    <div class="modal-form">
      <h2 id="modal-title">Import transactions from CSV</h2>
      <p class="modal-copy">Choose a bank export or paste CSV data. Map a signed amount column, or separate debit and credit columns, before importing.</p>
      <div class="csv-source-grid">
        <div class="form-group">
          <label for="modal-csv-file">CSV file</label>
          <div class="csv-file-actions">
            <button class="ui-btn ui-btn--secondary" type="button" data-action="chooseCsvImport">Choose CSV file</button>
            <span>${escapeHtml(csvSourceFile)}</span>
          </div>
          <input id="modal-csv-file" type="file" accept=".csv,text/csv,text/plain" hidden />
        </div>
        <div class="form-group">
          <label for="modal-csv-account">Destination account</label>
          <select id="modal-csv-account">${accountOptions(csvAccountId, false)}</select>
        </div>
      </div>
      <div class="form-group">
        <label for="modal-csv-text">CSV data</label>
        <textarea id="modal-csv-text" rows="7" placeholder="date,description,amount,category,scope">${escapeHtml(csvRaw)}</textarea>
      </div>
      ${hasDocument ? `
        <div class="modal-section">
          <div class="ui-title">Detected columns · ${csvDelimiterLabel(csvDocument?.delimiter || ',')} separated</div>
          <div class="csv-columns">${csvDocument?.headers.map((header) => `<code>${escapeHtml(header)}</code>`).join('')}</div>
          <div class="csv-mapping-grid">
            <div class="form-group"><label for="modal-csv-map-date">Date *</label><select id="modal-csv-map-date">${optionList(csvMapping.date, 'Choose date column')}</select></div>
            <div class="form-group"><label for="modal-csv-map-description">Description *</label><select id="modal-csv-map-description">${optionList(csvMapping.description, 'Choose description column')}</select></div>
            <div class="form-group"><label for="modal-csv-map-amount">Signed amount</label><select id="modal-csv-map-amount">${optionList(csvMapping.amount)}</select></div>
            <div class="form-group"><label for="modal-csv-map-debit">Debit</label><select id="modal-csv-map-debit">${optionList(csvMapping.debit)}</select></div>
            <div class="form-group"><label for="modal-csv-map-credit">Credit</label><select id="modal-csv-map-credit">${optionList(csvMapping.credit)}</select></div>
            <div class="form-group"><label for="modal-csv-map-category">Category</label><select id="modal-csv-map-category">${optionList(csvMapping.category)}</select></div>
            <div class="form-group"><label for="modal-csv-map-scope">Scope</label><select id="modal-csv-map-scope">${optionList(csvMapping.scope)}</select></div>
            <div class="form-group"><label for="modal-csv-default-category">Default category</label><input id="modal-csv-default-category" value="${escapeHtml(csvDefaultCategory)}" /></div>
            <div class="form-group"><label for="modal-csv-default-scope">Default scope</label><select id="modal-csv-default-scope">${scopeOptions(csvDefaultScope)}</select></div>
          </div>
        </div>
      ` : ''}
      ${csvSummary ? `<div class="fin-compact-empty">${escapeHtml(csvSummary)}</div>` : ''}
      ${hasPreview ? `
        <div class="modal-section">
          <div class="ui-title">Import preview</div>
          <div class="csv-preview-counts">
            <span>${previewRows.length} accepted</span>
            <span>${duplicates.length} duplicate${duplicates.length === 1 ? '' : 's'}</span>
            <span>${rejected.length} rejected</span>
          </div>
          ${previewRows.slice(0, 6).map((row) => `<div class="modal-list-row"><span>${escapeHtml(row.description)}<br><small>${escapeHtml(row.date)} · ${escapeHtml(row.categoryId)} · ${escapeHtml(row.scope)}</small></span><span class="${row.amount >= 0 ? 'fin-val-pos' : 'fin-val-neg'}">${money(row.amount)}</span></div>`).join('')}
          ${duplicates.length ? `<div class="csv-validation-list"><strong>Duplicates skipped</strong>${duplicates.slice(0, 4).map((row) => `<span>${escapeHtml(row.date)} · ${escapeHtml(row.description)}</span>`).join('')}</div>` : ''}
          ${rejected.length ? `<div class="csv-validation-list csv-validation-list--error"><strong>Rejected rows</strong>${rejected.slice(0, 6).map((row) => `<span>Row ${row.rowNumber}: ${escapeHtml(row.reason)}</span>`).join('')}</div>` : ''}
        </div>
      ` : ''}
      <div class="modal-actions">
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Cancel</button>
        <button class="ui-btn ui-btn--secondary" type="button" data-action="analyzeCsvImport">Analyze CSV</button>
        <button class="ui-btn ui-btn--secondary" type="button" data-action="previewCsvImport"${hasDocument ? '' : ' disabled'}>Preview import</button>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="importCsvData"${previewRows.length ? '' : ' disabled'}>Import valid rows</button>
      </div>
    </div>
  `;
}

function renderBackupRestore(): string {
  const preview = backupPreview;
  const counts = preview?.counts || {};
  return `
    <div class="modal-form">
      <h2 id="modal-title">Restore Finance Master backup</h2>
      <p class="modal-copy">Review this backup before replacement. Restoring replaces your current finance data, goals, settings, review state, import history, and cached prices.</p>
      ${preview?.valid ? `
        <div class="backup-preview-card">
          <div><span>Exported</span><strong>${formatDate(preview.exportedAt)}</strong></div>
          <div><span>Ledger events</span><strong>${counts.ledgerEvents || 0}</strong></div>
          <div><span>Accounts</span><strong>${counts.accounts || 0}</strong></div>
          <div><span>Recurring costs</span><strong>${counts.recurringCosts || 0}</strong></div>
          <div><span>Pipeline items</span><strong>${counts.pipelineItems || 0}</strong></div>
          <div><span>Goals</span><strong>${counts.goals || 0}</strong></div>
          <div><span>CSV batches</span><strong>${counts.importBatches || 0}</strong></div>
          <div><span>Cached quotes</span><strong>${counts.cachedQuotes || 0}</strong></div>
          <div><span>Appearance</span><strong>${escapeHtml((pendingBackup as Record<string, any>)?.uiSettings?.appearance || 'aurora')}</strong></div>
          <div><span>Scope filter</span><strong>${escapeHtml((pendingBackup as Record<string, any>)?.uiSettings?.scopeFilter || 'all')}</strong></div>
        </div>
      ` : `
        <div class="csv-validation-list csv-validation-list--error" role="alert">
          <strong>This backup cannot be restored</strong>
          ${(preview?.errors || ['Choose a Finance Master backup file.']).map((error) => `<span>${escapeHtml(error)}</span>`).join('')}
        </div>
      `}
      <div class="modal-actions">
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Cancel</button>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="applyBackupRestore"${preview?.valid ? '' : ' disabled'}>Replace current data</button>
      </div>
    </div>
  `;
}

function accountOptions(selected = '', allowEmpty = true): string {
  const accounts = Store.getFinancialReadModel().fiatAccounts || [];
  const empty = allowEmpty
    ? '<option value="">All accounts</option>'
    : '<option value="">Choose an account</option>';
  return `${empty}${accounts.map((account: Record<string, unknown>) => `
    <option value="${escapeHtml(account.id)}"${String(account.id) === selected ? ' selected' : ''}>${escapeHtml(account.name)} · ${escapeHtml(account.scope || 'shared')}</option>
  `).join('')}`;
}

function renderIncome(id = ''): string {
  const item = (Store.getFinancialReadModel().pipelineDeals || []).find((entry: Record<string, unknown>) => String(entry.id) === id);
  return `
    <div class="modal-form">
      <h2 id="modal-title">${item ? 'Edit pipeline item' : 'Add pipeline item'}</h2>
      <input id="modal-income-id" type="hidden" value="${escapeHtml(item?.id || '')}" />
      <div class="form-group"><label for="modal-income-title">Source</label><input id="modal-income-title" value="${escapeHtml(item?.title || '')}" placeholder="Client or opportunity" /></div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-income-amount">Amount</label><input id="modal-income-amount" type="number" step="0.01" value="${escapeHtml(item?.value || '')}" /></div>
        <div class="form-group"><label for="modal-income-probability">Probability</label><input id="modal-income-probability" type="number" min="0" max="1" step="0.05" value="${escapeHtml(item?.probability ?? 0.5)}" /></div>
        <div class="form-group"><label for="modal-income-date">Expected date</label><input id="modal-income-date" type="date" value="${escapeHtml(item?.expectedDateISO || today())}" /></div>
        <div class="form-group"><label for="modal-income-status">Stage</label><select id="modal-income-status">${['open', 'proposal', 'signed'].map((status) => `<option${item?.status === status ? ' selected' : ''}>${status}</option>`).join('')}</select></div>
        <div class="form-group"><label for="modal-income-scope">Scope</label><select id="modal-income-scope">${scopeOptions(String(item?.scope || 'business'))}</select></div>
      </div>
      <div class="form-group"><label for="modal-income-account">Settlement account</label><select id="modal-income-account">${accountOptions(String(item?.destinationAccountId || ''))}</select></div>
      ${formActions('income', Boolean(item))}
    </div>
  `;
}

function renderFiatAccount(id = ''): string {
  const item = (Store.getFinancialReadModel().fiatAccounts || []).find((entry: Record<string, unknown>) => String(entry.id) === id);
  return `
    <div class="modal-form">
      <h2 id="modal-title">${item ? 'Edit cash account' : 'Add cash account'}</h2>
      <input id="modal-fiat-id" type="hidden" value="${escapeHtml(item?.id || '')}" />
      <div class="form-group"><label for="modal-fiat-name">Name</label><input id="modal-fiat-name" value="${escapeHtml(item?.name || '')}" placeholder="Operating cash" /></div>
      <div class="form-group"><label for="modal-fiat-balance">Balance</label><input id="modal-fiat-balance" type="number" step="0.01" value="${escapeHtml(item?.balance || '')}" /></div>
      <div class="form-group"><label for="modal-fiat-scope">Scope</label><select id="modal-fiat-scope">${scopeOptions(String(item?.scope || 'business'))}</select></div>
      <div class="modal-actions">
        ${deactivateButton('deactivateFiatAccount', Boolean(item))}
        <span class="modal-actions-spacer"></span>
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Cancel</button>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="saveFinanceModal" data-action-args="'fiatAccount'">${item ? 'Save' : 'Create'}</button>
      </div>
    </div>
  `;
}

function renderWeb3(id = ''): string {
  const item = (Store.getFinancialReadModel().web3Positions || []).find((entry: Record<string, unknown>) => String(entry.id) === id);
  return `
    <div class="modal-form">
      <h2 id="modal-title">${item ? 'Edit Web3 position' : 'Add Web3 position'}</h2>
      <input id="modal-web3-id" type="hidden" value="${escapeHtml(item?.id || '')}" />
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-web3-symbol">Asset</label><input id="modal-web3-symbol" value="${escapeHtml(item?.symbolOrName || '')}" placeholder="ETH" /></div>
        <div class="form-group"><label for="modal-web3-chain">Chain</label><input id="modal-web3-chain" value="${escapeHtml(item?.chain || '')}" placeholder="Ethereum" /></div>
        <div class="form-group"><label for="modal-web3-amount">Units</label><input id="modal-web3-amount" type="number" step="0.0001" value="${escapeHtml(item?.amount || '')}" /></div>
        <div class="form-group"><label for="modal-web3-price">Price</label><input id="modal-web3-price" type="number" step="0.01" value="${escapeHtml(item?.price || '')}" /></div>
        <div class="form-group"><label for="modal-web3-liquidity">Liquidity</label><select id="modal-web3-liquidity">${['high', 'med', 'low'].map((liquidity) => `<option${item?.liquidity === liquidity ? ' selected' : ''}>${liquidity}</option>`).join('')}</select></div>
        <div class="form-group"><label for="modal-web3-scope">Scope</label><select id="modal-web3-scope">${scopeOptions(String(item?.scope || 'shared'))}</select></div>
      </div>
      <label class="settings-check"><input id="modal-web3-manual" type="checkbox"${item?.manualPriceOverride !== false ? ' checked' : ''} /><span>Keep this position on a manual price override</span></label>
      <div class="modal-actions">${deactivateButton('deactivateWeb3Position', Boolean(item))}<span class="modal-actions-spacer"></span>${formActions('web3Position', Boolean(item)).replace('<div class="modal-actions">', '').replace('</div>', '')}</div>
    </div>
  `;
}

function renderDefi(id = ''): string {
  const item = (Store.getFinancialReadModel().defiPositions || []).find((entry: Record<string, unknown>) => String(entry.id) === id);
  return `
    <div class="modal-form">
      <h2 id="modal-title">${item ? 'Edit DeFi strategy' : 'Add DeFi strategy'}</h2>
      <input id="modal-defi-id" type="hidden" value="${escapeHtml(item?.id || '')}" />
      <div class="form-group"><label for="modal-defi-protocol">Protocol</label><input id="modal-defi-protocol" value="${escapeHtml(item?.protocol || '')}" placeholder="Aave" /></div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-defi-collateral">Collateral value</label><input id="modal-defi-collateral" type="number" step="0.01" value="${escapeHtml(item?.collateralValue || '')}" /></div>
        <div class="form-group"><label for="modal-defi-debt">Debt value</label><input id="modal-defi-debt" type="number" step="0.01" value="${escapeHtml(item?.debtValue || '')}" /></div>
        <div class="form-group"><label for="modal-defi-risk">Risk</label><select id="modal-defi-risk">${['Low', 'Medium', 'High'].map((risk) => `<option${item?.riskScore === risk ? ' selected' : ''}>${risk}</option>`).join('')}</select></div>
        <div class="form-group"><label for="modal-defi-scope">Scope</label><select id="modal-defi-scope">${scopeOptions(String(item?.scope || 'shared'))}</select></div>
      </div>
      <div class="modal-actions">${deactivateButton('deactivateDefiPosition', Boolean(item))}<span class="modal-actions-spacer"></span>${formActions('defiPosition', Boolean(item)).replace('<div class="modal-actions">', '').replace('</div>', '')}</div>
    </div>
  `;
}

function renderExpense(id = ''): string {
  const item = (Store.getFinancialReadModel().recurringExpenses || []).find((entry: Record<string, unknown>) => String(entry.id) === id);
  return `
    <div class="modal-form">
      <h2 id="modal-title">${item ? 'Edit recurring expense' : 'Add recurring expense'}</h2>
      <input id="modal-expense-id" type="hidden" value="${escapeHtml(item?.id || '')}" />
      <div class="form-group"><label for="modal-expense-category">Category</label><input id="modal-expense-category" value="${escapeHtml(item?.category || '')}" placeholder="Housing" /></div>
      <div class="form-group"><label for="modal-expense-amount">Monthly amount</label><input id="modal-expense-amount" type="number" step="0.01" value="${escapeHtml(item?.monthlyAmount || '')}" /></div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-expense-due-day">Due day</label><input id="modal-expense-due-day" type="number" min="1" max="28" value="${escapeHtml(item?.dueDay || 1)}" /></div>
        <div class="form-group"><label for="modal-expense-scope">Scope</label><select id="modal-expense-scope">${scopeOptions(String(item?.scope || 'personal'))}</select></div>
      </div>
      <label class="settings-check"><input id="modal-expense-essential" type="checkbox"${item?.essential ? ' checked' : ''} /><span>Essential expense</span></label>
      <div class="modal-actions">${deactivateButton('deactivateRecurringExpense', Boolean(item))}<span class="modal-actions-spacer"></span>${formActions('expense', Boolean(item)).replace('<div class="modal-actions">', '').replace('</div>', '')}</div>
    </div>
  `;
}

function renderDebt(type: 'debtAdd' | 'debtPayment', id = ''): string {
  const debts = Store.getFinancialReadModel().debtAccounts || [];
  if (type === 'debtPayment') {
    return `
      <div class="modal-form">
        <h2 id="modal-title">Record debt payment</h2>
        <div class="form-group"><label for="modal-debt-payment-id">Debt</label><select id="modal-debt-payment-id">${debts.map((debt: Record<string, unknown>) => `<option value="${escapeHtml(debt.id)}">${escapeHtml(debt.name)} (${money(debt.outstanding)})</option>`).join('')}</select></div>
        <div class="form-group"><label for="modal-debt-payment-amount">Payment</label><input id="modal-debt-payment-amount" type="number" step="0.01" /></div>
        ${formActions('debtPayment')}
      </div>
    `;
  }
  const item = debts.find((entry: Record<string, unknown>) => String(entry.id) === id);
  return `
    <div class="modal-form">
      <h2 id="modal-title">${item ? 'Add to debt' : 'Add debt'}</h2>
      <input id="modal-debt-id" type="hidden" value="${escapeHtml(item?.id || '')}" />
      <div class="form-group"><label for="modal-debt-name">Name</label><input id="modal-debt-name" value="${escapeHtml(item?.name || '')}" placeholder="Credit line" /></div>
      <div class="form-group"><label for="modal-debt-amount">${item ? 'Additional amount' : 'Amount'}</label><input id="modal-debt-amount" type="number" step="0.01" /></div>
      <div class="form-group"><label for="modal-debt-scope">Scope</label><select id="modal-debt-scope">${scopeOptions(String(item?.scope || 'business'))}</select></div>
      <div class="modal-actions">${deactivateButton('deactivateDebtAccount', Boolean(item))}<span class="modal-actions-spacer"></span>${formActions('debtAdd', Boolean(item)).replace('<div class="modal-actions">', '').replace('</div>', '')}</div>
    </div>
  `;
}

function renderModal(type: string, id = ''): string {
  if (type === 'quickAdd') return renderQuickAdd();
  if (type === 'transaction') return renderTransaction();
  if (type === 'financeOverview') return renderOverview();
  if (type === 'settings') return renderSettings();
  if (type === 'weeklyReview') return renderWeeklyReview();
  if (type === 'goals') return renderGoals();
  if (type === 'goal') return renderGoal(id);
  if (type === 'csvImport') return renderCsvImport();
  if (type === 'backupRestore') return renderBackupRestore();
  if (type === 'settleIncome') return renderSettleIncome(id);
  if (type === 'income') return renderIncome(id);
  if (type === 'fiatAccount') return renderFiatAccount(id);
  if (type === 'web3Position') return renderWeb3(id);
  if (type === 'defiPosition') return renderDefi(id);
  if (type === 'expense') return renderExpense(id);
  if (type === 'debtAdd' || type === 'debtPayment') return renderDebt(type, id);
  return '<div class="modal-form"><h2 id="modal-title">Nothing to edit</h2></div>';
}

function openEditModal(type: string, options: { id?: string } | string = {}): void {
  if (!overlay || !body) return;
  if (!overlay.classList.contains('active') && document.activeElement instanceof HTMLElement) {
    modalReturnFocus = document.activeElement;
  }
  overlay.dataset.type = type;
  overlay.classList.add('active');
  overlay.setAttribute('aria-hidden', 'false');
  body.innerHTML = renderModal(type, typeof options === 'string' ? options : String(options.id || ''));
  window.requestAnimationFrame(() => {
    const first = body.querySelector<HTMLElement>('[data-autofocus], input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])');
    first?.focus();
  });
}

function closeModal(): void {
  if (!overlay || !body) return;
  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
  body.innerHTML = '';
  modalReturnFocus?.focus();
  modalReturnFocus = null;
}

function append(draft: FinanceEventDraft, source: string): void {
  Store.appendFinanceEvent(draft, { source });
  closeModal();
}

function addTransactionFromFields(prefix: string): boolean {
  const description = value(`${prefix}-desc`);
  const amount = Number(value(`${prefix}-amount`));
  const accountId = value(`${prefix}-account`);
  if (!description || !Number.isFinite(amount) || amount === 0 || !accountId) {
    showModalError('Add a note, a non-zero amount, and a destination account.');
    return false;
  }
  Store.recordTransaction({
    description,
    amount,
    timestamp: toIso(value(`${prefix}-date`)),
    accountId,
    categoryId: value(`${prefix}-category`) || 'uncategorized',
    scope: value(`${prefix}-scope`) as FinanceScope,
    source: 'manual',
  });
  closeModal();
  return true;
}

function captureCsvFields(): void {
  csvRaw = value('modal-csv-text') || csvRaw;
  csvAccountId = value('modal-csv-account') || csvAccountId;
  csvDefaultCategory = value('modal-csv-default-category') || csvDefaultCategory;
  csvDefaultScope = (value('modal-csv-default-scope') || csvDefaultScope) as FinanceScope;
  if (!csvDocument) return;
  csvMapping = {
    date: value('modal-csv-map-date'),
    description: value('modal-csv-map-description'),
    amount: value('modal-csv-map-amount'),
    debit: value('modal-csv-map-debit'),
    credit: value('modal-csv-map-credit'),
    category: value('modal-csv-map-category'),
    scope: value('modal-csv-map-scope'),
  };
}

function downloadBackup(): void {
  const backup = Store.exportBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `finance-master-backup-${today()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function saveFinanceModal(type: string): void {
  const currency = Store.getFinanceSettings().baseCurrency;
  const timestamp = new Date().toISOString();
  if (type === 'settings') {
    Store.saveFinanceSettings({ baseCurrency: value('modal-settings-currency'), forecastDays: Number(value('modal-settings-forecast')) });
    Store.saveUiSettings({
      appearance: value('modal-settings-appearance') as FinanceUiSettings['appearance'],
      reducedMotion: checked('modal-settings-motion'),
      walletPriceSource: value('modal-settings-wallet-prices') as FinanceUiSettings['walletPriceSource'],
      scenario: {
        marketMajors: Number(value('modal-settings-market')),
        burnDelta: Number(value('modal-settings-burn')),
        probFloor: Number(value('modal-settings-floor')),
      },
    });
    applyAppearance(Store);
    closeModal();
    return;
  }
  if (type === 'income') {
    const amount = Number(value('modal-income-amount'));
    const probability = Number(value('modal-income-probability'));
    if (!value('modal-income-title') || !Number.isFinite(amount) || !Number.isFinite(probability)) return;
    append({
      type: 'pipeline.created',
      amount: Math.abs(amount),
      currency,
      timestamp,
      related_entity_id: value('modal-income-id') || financeId('pipeline'),
      metadata: {
        title: value('modal-income-title'),
        value: Math.abs(amount),
        probability,
        status: value('modal-income-status'),
        stage: value('modal-income-status'),
        expectedDateISO: value('modal-income-date'),
        destinationAccountId: value('modal-income-account'),
        scope: value('modal-income-scope'),
      },
    }, 'modal.income');
    return;
  }
  if (type === 'fiatAccount') {
    const balance = Number(value('modal-fiat-balance'));
    if (!value('modal-fiat-name') || !Number.isFinite(balance)) return;
    append({ type: 'asset.account_set', amount: balance, currency, timestamp, related_entity_id: value('modal-fiat-id') || financeId('cash'), metadata: { name: value('modal-fiat-name'), balance, active: true, scope: value('modal-fiat-scope') } }, 'modal.fiatAccount');
    return;
  }
  if (type === 'web3Position') {
    append({ type: 'asset.position_set', amount: 0, currency, timestamp, related_entity_id: value('modal-web3-id') || financeId('web3'), metadata: { symbolOrName: value('modal-web3-symbol'), chain: value('modal-web3-chain'), amount: Number(value('modal-web3-amount')), price: Number(value('modal-web3-price')), liquidity: value('modal-web3-liquidity'), scope: value('modal-web3-scope'), priceSource: 'manual', priceUpdatedAt: timestamp, manualPriceOverride: checked('modal-web3-manual') } }, 'modal.web3Position');
    return;
  }
  if (type === 'defiPosition') {
    append({ type: 'asset.defi_set', amount: 0, currency, timestamp, related_entity_id: value('modal-defi-id') || financeId('defi'), metadata: { protocol: value('modal-defi-protocol'), collateralValue: Number(value('modal-defi-collateral')), debtValue: Number(value('modal-defi-debt')), riskScore: value('modal-defi-risk'), scope: value('modal-defi-scope') } }, 'modal.defiPosition');
    return;
  }
  if (type === 'expense') {
    const amount = Math.abs(Number(value('modal-expense-amount')));
    if (!value('modal-expense-category') || !Number.isFinite(amount)) return;
    append({ type: 'expense.recurring_set', amount, currency, timestamp, related_entity_id: value('modal-expense-id') || financeId('expense'), metadata: { category: value('modal-expense-category'), monthlyAmount: amount, essential: checked('modal-expense-essential'), active: true, dueDay: Number(value('modal-expense-due-day')) || 1, frequency: 'monthly', scope: value('modal-expense-scope') } }, 'modal.expense');
    return;
  }
  if (type === 'debtAdd') {
    const amount = Math.abs(Number(value('modal-debt-amount')));
    if (!value('modal-debt-name') || !Number.isFinite(amount) || amount <= 0) return;
    append({ type: 'debt.added', amount, currency, timestamp, related_entity_id: value('modal-debt-id') || financeId('debt'), metadata: { name: value('modal-debt-name'), scope: value('modal-debt-scope') } }, 'modal.debtAdd');
    return;
  }
  if (type === 'debtPayment') {
    const amount = Math.abs(Number(value('modal-debt-payment-amount')));
    if (!value('modal-debt-payment-id') || !Number.isFinite(amount) || amount <= 0) return;
    append({ type: 'debt.payment_made', amount, currency, timestamp, related_entity_id: value('modal-debt-payment-id'), metadata: {} }, 'modal.debtPayment');
    return;
  }
  if (type === 'transaction') {
    addTransactionFromFields('modal-fast-txn');
    return;
  }
  if (type === 'goal') {
    try {
      Store.saveGoal({
        id: value('modal-goal-id') || undefined,
        name: value('modal-goal-name'),
        type: value('modal-goal-type') === 'savings' ? 'savings' : 'buffer',
        targetAmount: Number(value('modal-goal-target')),
        targetDate: value('modal-goal-date') || undefined,
        scope: value('modal-goal-scope') as FinanceScope,
        linkedAccountIds: [...document.querySelectorAll<HTMLInputElement>('[id^="modal-goal-account-"]:checked')].map((input) => input.value),
      });
      openEditModal('goals');
    } catch (error) {
      showModalError(error instanceof Error ? error.message : 'Could not save this goal.');
    }
    return;
  }
  if (type === 'settleIncome') {
    if (!value('modal-settle-account')) {
      showModalError('Choose a settlement account before marking this item as paid.');
      return;
    }
    Store.markPipelineItemPaid(value('modal-settle-id'), { destinationAccountId: value('modal-settle-account') });
    closeModal();
  }
}

function parseArgs(raw: string): string[] {
  const args: string[] = [];
  raw.replace(/'((?:\\.|[^'])*)'/g, (_, arg: string) => {
    args.push(arg.replace(/\\'/g, "'").replace(/\\\\/g, '\\'));
    return '';
  });
  return args;
}

function resolveAction(path: string): ((...args: string[]) => unknown) | null {
  const target = path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') return null;
    return (current as Record<string, unknown>)[key];
  }, window);
  return typeof target === 'function' ? target as (...args: string[]) => unknown : null;
}

function confirmDeactivate(method: keyof typeof Store, idField: string): void {
  const id = value(idField);
  if (!id || !window.confirm('Deactivate this item?')) return;
  (Store[method] as (id: string) => FinanceEvent[])(id);
  closeModal();
}

Object.assign(window, {
  openEditModal,
  closeModal,
  saveFinanceModal,
  addTransaction: () => {
    if (addTransactionFromFields('modal-txn')) openEditModal('financeOverview');
  },
  refreshTransactionsModal: () => {
    transactionFilters.accountId = value('modal-filter-account');
    transactionFilters.scope = value('modal-filter-scope') || 'all';
    transactionFilters.categoryId = value('modal-filter-category');
    transactionFilters.direction = value('modal-filter-direction') || 'all';
    transactionFilters.period = value('modal-filter-period') || 'all';
    openEditModal('financeOverview');
  },
  deleteTransaction: (id: string) => {
    if (window.confirm('Reverse this transaction?')) Store.reverseFinanceEvent(id, 'modal.transaction.reverse');
    openEditModal('financeOverview');
  },
  markAsPaid: (id: string) => {
    openEditModal('settleIncome', { id });
  },
  deleteInvoice: (id: string) => {
    if (!window.confirm('Archive this pipeline or settlement entry?')) return;
    const invoice = (Store.getFinancialReadModel().invoices || []).find((entry: Record<string, unknown>) => String(entry.id) === id);
    Store.deleteInvoice(id, { reverseSettlement: String(invoice?.status || '').toLowerCase() === 'paid' });
  },
  deactivateFiatAccount: () => confirmDeactivate('deactivateFiatAccount', 'modal-fiat-id'),
  deactivateRecurringExpense: () => confirmDeactivate('deactivateRecurringExpense', 'modal-expense-id'),
  deactivateWeb3Position: () => confirmDeactivate('deactivateWeb3Position', 'modal-web3-id'),
  deactivateDefiPosition: () => confirmDeactivate('deactivateDefiPosition', 'modal-defi-id'),
  deactivateDebtAccount: () => confirmDeactivate('deactivateDebtAccount', 'modal-debt-id'),
  resetDemoData: () => {
    if (!window.confirm('Restore the original Finance Master sample data? Your finance entries will be replaced.')) return;
    Store.clearAndReseedDemo();
    applyAppearance(Store);
    closeModal();
  },
  deleteDemoData: () => {
    if (!window.confirm('Delete the Finance Master sample data? The dashboard ledger will be empty until you add entries or restore the sample data.')) return;
    Store.deleteSampleData();
    closeModal();
  },
  completeWeeklyReview: () => {
    const accountChecks = [...document.querySelectorAll<HTMLInputElement>('.review-account-check')];
    const reviewChecks = ['modal-review-recurring-costs', 'modal-review-pipeline', 'modal-review-signals'];
    if (!accountChecks.length || accountChecks.some((input) => !input.checked) || reviewChecks.some((id) => !checked(id))) {
      showModalError('Confirm every account balance and complete each operating check before finishing the review.');
      return;
    }
    const accounts = accountChecks.map((input, index) => ({
        accountId: input.dataset.accountId || '',
        rawBalance: value(`modal-review-balance-${index}`),
      }));
    if (accounts.some((account) => !account.rawBalance || !Number.isFinite(Number(account.rawBalance)))) {
      showModalError('Add a valid balance for every reconciled account.');
      return;
    }
    try {
      Store.completeWeeklyReview({
        accounts: accounts.map((account) => ({ accountId: account.accountId, balance: Number(account.rawBalance) })),
        recurringCosts: true,
        pipeline: true,
        signals: true,
        notes: value('modal-review-notes'),
      });
      closeModal();
    } catch (error) {
      showModalError(error instanceof Error ? error.message : 'Could not complete this review.');
    }
  },
  deleteGoal: (id: string) => {
    if (!id || !window.confirm('Delete this savings goal?')) return;
    Store.deleteGoal(id);
    openEditModal('goals');
  },
  refreshCryptoPrices: async () => {
    try {
      const result = await Store.refreshCryptoPrices();
      const message = result.source === 'manual'
        ? 'Wallet pricing is set to manual only. Choose CoinGecko read-only and save settings to enable refreshes.'
        : `Refreshed ${result.updated} wallet position${result.updated === 1 ? '' : 's'} from ${result.source}.`;
      window.alert(message);
      openEditModal('settings');
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not refresh wallet prices.');
    }
  },
  exportFinanceBackup: () => downloadBackup(),
  chooseFinanceBackup: () => document.querySelector<HTMLInputElement>('#modal-backup-file')?.click(),
  undoImportBatch: (batchId: string) => {
    if (!batchId || !window.confirm('Reverse the transactions imported in this CSV batch?')) return;
    Store.undoImportBatch(batchId);
    openEditModal('settings');
  },
  chooseCsvImport: () => document.querySelector<HTMLInputElement>('#modal-csv-file')?.click(),
  analyzeCsvImport: () => {
    try {
      captureCsvFields();
      csvDocument = parseCsvDocument(csvRaw);
      csvMapping = inferCsvColumnMapping(csvDocument.headers);
      csvPreview = null;
      csvSummary = '';
      openEditModal('csvImport');
    } catch (error) {
      csvDocument = null;
      csvPreview = null;
      csvSummary = error instanceof Error ? error.message : 'Could not parse this CSV.';
      openEditModal('csvImport');
    }
  },
  previewCsvImport: () => {
    try {
      captureCsvFields();
      if (!csvDocument) csvDocument = parseCsvDocument(csvRaw);
      const fingerprints = Store.getActiveFinanceEvents()
        .map((event) => String(event.metadata?.fingerprint || ''))
        .filter(Boolean);
      csvPreview = buildCsvImportPreview(csvDocument, csvMapping, {
        existingFingerprints: fingerprints,
        defaultCategory: csvDefaultCategory,
        defaultScope: csvDefaultScope,
        sourceFile: csvSourceFile,
      });
      csvSummary = '';
      openEditModal('csvImport');
    } catch (error) {
      csvPreview = null;
      csvSummary = error instanceof Error ? error.message : 'Could not preview this CSV.';
      openEditModal('csvImport');
    }
  },
  importCsvData: () => {
    captureCsvFields();
    if (!csvAccountId) {
      showModalError('Choose a destination account before importing.');
      return;
    }
    if (!csvPreview?.rows.length) {
      showModalError('Preview at least one valid, non-duplicate row before importing.');
      return;
    }
    const summary = Store.importCsvTransactions(csvPreview.rows, { accountId: csvAccountId, sourceFile: csvPreview.sourceFile });
    csvSummary = `Imported ${summary.imported} row${summary.imported === 1 ? '' : 's'}${summary.duplicates ? ` · skipped ${summary.duplicates} duplicate${summary.duplicates === 1 ? '' : 's'}` : ''}.`;
    csvPreview = null;
    openEditModal('csvImport');
  },
  applyBackupRestore: () => {
    if (!backupPreview?.valid || !pendingBackup) {
      showModalError('Choose a valid Finance Master backup before restoring.');
      return;
    }
    Store.restoreBackup(pendingBackup);
    applyAppearance(Store);
    pendingBackup = null;
    backupPreview = null;
    closeModal();
  },
});

document.addEventListener('click', (event) => {
  const button = (event.target as Element | null)?.closest<HTMLElement>('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (!action) return;
  event.preventDefault();
  resolveAction(action)?.(...parseArgs(button.dataset.actionArgs || ''));
});

overlay?.addEventListener('click', (event) => {
  if (event.target === overlay) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (!overlay?.classList.contains('active')) return;
  if (event.key === 'Escape') {
    closeModal();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = [...overlay.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

document.addEventListener('change', (event) => {
  const input = event.target as HTMLInputElement | null;
  if (!input?.files?.[0]) return;
  const reader = new FileReader();
  if (input.id === 'modal-csv-file') {
    reader.onload = () => {
      try {
        csvRaw = String(reader.result || '');
        csvSourceFile = input.files?.[0]?.name || 'imported-transactions.csv';
        csvDocument = parseCsvDocument(csvRaw);
        csvMapping = inferCsvColumnMapping(csvDocument.headers);
        csvPreview = null;
        csvSummary = '';
        openEditModal('csvImport');
      } catch (error) {
        csvDocument = null;
        csvPreview = null;
        csvSummary = error instanceof Error ? error.message : 'Could not parse this CSV file.';
        openEditModal('csvImport');
      }
    };
    reader.readAsText(input.files[0]);
    return;
  }
  if (input.id !== 'modal-backup-file') return;
  reader.onload = () => {
    try {
      pendingBackup = JSON.parse(String(reader.result || ''));
      backupPreview = validateFinanceBackup(pendingBackup);
    } catch (error) {
      pendingBackup = null;
      backupPreview = {
        valid: false,
        counts: {},
        errors: [error instanceof Error ? error.message : 'Could not read this backup.'],
      };
    }
    openEditModal('backupRestore');
  };
  reader.readAsText(input.files[0]);
});
