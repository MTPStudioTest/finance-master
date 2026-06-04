import { Store } from '../persistence/store';
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
  FinanceImportProfile,
  FinanceScope,
  FinanceScopeFilter,
} from '../types/finance';
import {
  deactivateButton,
  escapeHtml,
  formActions,
  formatDate,
  formatTransactionType,
  scopeFilterOptions,
  scopeOptions,
  signedAmount,
} from './modal-ui';
import {
  renderQuickAdd,
  renderTransaction as renderTransactionWorkflow,
} from './modal-workflows/core';

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
let csvDuplicatePolicy: 'skip' | 'import' = 'skip';
let csvAppliedProfileName = '';
let pendingBackup: unknown = null;
let backupPreview: FinanceBackupPreview | null = null;
let modalReturnFocus: HTMLElement | null = null;
const INCOME_STATUSES = ['lead', 'proposal', 'expected', 'confirmed', 'invoiced', 'due', 'overdue', 'paid', 'cancelled', 'lost'];
const INCOME_PROBABILITY_DEFAULTS: Record<string, number> = {
  paid: 1,
  invoiced: 0.95,
  due: 0.95,
  overdue: 0.85,
  confirmed: 0.9,
  retainer: 0.9,
  expected: 0.6,
  proposal: 0.4,
  lead: 0.15,
  cancelled: 0,
  lost: 0,
};
type DestructiveConfirmationAction =
  | 'resetLocalFinanceData'
  | 'restoreBackup'
  | 'resetDemoData'
  | 'deleteDemoData'
  | 'archiveProjectProfile'
  | 'deactivateFiatAccount'
  | 'deactivateReserveBucket'
  | 'deactivateRecurringExpense'
  | 'deactivateDebtAccount'
  | 'deleteDebtAccount'
  | 'completeDebtPlan'
  | 'archiveDebtPlan'
  | 'reverseTransaction'
  | 'deleteInvoice'
  | 'cancelPipelineItem'
  | 'deleteGoal'
  | 'undoImportBatch';
interface DestructiveConfirmation {
  action: DestructiveConfirmationAction;
  title: string;
  copy: string;
  phrase: string;
  buttonLabel: string;
  targetId?: string;
  source?: string;
  reverseSettlement?: boolean;
  reopenModal?: string;
  renderAfter?: boolean;
}
let destructiveConfirmation: DestructiveConfirmation | null = null;
const quickActionMenu = document.getElementById('quick-action-menu');
const quickActionButton = document.querySelector<HTMLButtonElement>('.fin-fab-add');
const transactionFilters = {
  search: '',
  accountId: '',
  scope: 'all',
  categoryId: '',
  type: 'all',
  reviewStatus: 'all',
  dateFrom: '',
  dateTo: '',
};

function value(id: string): string {
  return document.querySelector<HTMLInputElement | HTMLSelectElement>(`#${id}`)?.value.trim() || '';
}

function checked(id: string): boolean {
  return document.querySelector<HTMLInputElement>(`#${id}`)?.checked === true;
}

function today(): string {
  return window.FinanceDates?.todayDateOnly?.() || new Date().toISOString().slice(0, 10);
}

function toIso(date = today()): string {
  return window.FinanceDates?.dateOnlyToNoonIso?.(date) || new Date().toISOString();
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

function renderDataHealthPanel(): string {
  const health = Store.getLocalDataHealth();
  const storageCopy = health.storageStatus === 'healthy'
    ? 'Storage is healthy.'
    : health.storageStatus === 'limited'
      ? 'Storage is limited in this browser session.'
      : 'Storage is unavailable in this browser session.';
  return `
    <div class="modal-section settings-reset-panel">
      <div>
        <div class="ui-title">Local data health</div>
        <p>${health.ok ? 'Local finance data is readable.' : 'Some local Finance Master data needs attention before it can be trusted.'}</p>
        <p>${escapeHtml(storageCopy)} Schema ${escapeHtml(health.schemaLabel)} · Backup version ${health.backupVersion}</p>
        <p>${health.eventCount} finance event${health.eventCount === 1 ? '' : 's'}${health.latestEventAt ? ` · latest event ${formatDate(health.latestEventAt)}` : ''} · last backup ${health.lastBackupAt ? formatDate(health.lastBackupAt) : 'Never'}</p>
        ${health.privateModeWarning ? '<p>Your browser may not keep local data permanently in this mode. Export a backup before closing this window.</p>' : ''}
        ${health.issues.length ? `
          <div class="csv-validation-list csv-validation-list--error" role="alert">
            ${health.issues.map((entry) => `<span><strong>${escapeHtml(entry.label)}:</strong> ${escapeHtml(entry.message)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderDestructiveConfirm(): string {
  const config = destructiveConfirmation;
  if (!config) {
    return '<div class="modal-form"><h2 id="modal-title">Confirmation unavailable</h2><p class="modal-copy">Close this dialog and try the action again.</p></div>';
  }
  return `
    <div class="modal-form">
      <h2 id="modal-title">${escapeHtml(config.title)}</h2>
      <p class="modal-copy">${escapeHtml(config.copy)}</p>
      <p class="modal-copy"><strong>Recommended first:</strong> export a backup from Settings if you may need this data later.</p>
      <div class="form-group">
        <label for="modal-destructive-phrase">Type ${escapeHtml(config.phrase)} to continue</label>
        <input id="modal-destructive-phrase" data-autofocus autocomplete="off" spellcheck="false" />
      </div>
      <div class="modal-actions">
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Cancel</button>
        <button id="modal-destructive-confirm" class="btn-danger ui-btn" type="button" data-action="applyDestructiveConfirmation" disabled>${escapeHtml(config.buttonLabel)}</button>
      </div>
    </div>
  `;
}

function updateDestructiveConfirmButton(): void {
  const input = document.querySelector<HTMLInputElement>('#modal-destructive-phrase');
  const button = document.querySelector<HTMLButtonElement>('#modal-destructive-confirm');
  if (!input || !button || !destructiveConfirmation) return;
  button.disabled = input.value !== destructiveConfirmation.phrase;
}

function setQuickActionMenuOpen(open: boolean): void {
  if (!quickActionMenu || !quickActionButton) return;
  quickActionMenu.classList.toggle('active', open);
  quickActionMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
  quickActionButton.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function toggleQuickActionMenu(): void {
  setQuickActionMenuOpen(!(quickActionMenu?.classList.contains('active') ?? false));
}

function closeQuickActionMenu(): void {
  setQuickActionMenuOpen(false);
}

function optionList(selected = '', emptyLabel = 'Not mapped'): string {
  const headers = csvDocument?.headers || [];
  return `<option value="">${emptyLabel}</option>${headers.map((header) => (
    `<option value="${escapeHtml(header)}"${header === selected ? ' selected' : ''}>${escapeHtml(header)}</option>`
  )).join('')}`;
}

function actionArg(value: unknown): string {
  return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function csvHeaderSignature(headers: string[]): string {
  return headers.map((header) => String(header || '').trim().toLowerCase()).filter(Boolean).join('|');
}

function matchingCsvImportProfiles(): FinanceImportProfile[] {
  if (!csvDocument) return [];
  const signature = csvHeaderSignature(csvDocument.headers);
  if (!signature) return [];
  const imports = Store.getImportState();
  return (imports.profiles || []).filter((profile) => csvHeaderSignature(profile.headers || []) === signature);
}

function applyCsvImportProfile(profile: FinanceImportProfile | undefined): void {
  if (!profile) return;
  csvMapping = { ...profile.mapping };
  csvDefaultCategory = profile.defaultCategory || csvDefaultCategory;
  csvDefaultScope = profile.defaultScope || csvDefaultScope;
  if (profile.accountId) csvAccountId = profile.accountId;
  csvAppliedProfileName = profile.name || 'CSV mapping';
}

function applyBestCsvImportProfile(): void {
  const imports = Store.getImportState();
  const profiles = matchingCsvImportProfiles();
  const preferred = profiles.find((profile) => profile.id === imports.lastProfileId) || profiles[0];
  applyCsvImportProfile(preferred);
}

function saveCurrentCsvImportProfile(): void {
  if (!csvDocument) return;
  try {
    const profile = Store.saveCsvImportProfile({
      name: csvSourceFile,
      sourceFile: csvSourceFile,
      headers: csvDocument.headers,
      mapping: csvMapping,
      accountId: csvAccountId,
      defaultCategory: csvDefaultCategory,
      defaultScope: csvDefaultScope,
    });
    csvAppliedProfileName = profile.name;
  } catch {
    // Profile persistence is helpful, but import preview/import should remain usable without it.
  }
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

function renderOverview(): string {
  const snapshot = Store.getFinancialSnapshot();
  const readModel = Store.getFinancialReadModel();
  const dateFrom = window.FinanceDates?.toDateOnly?.(transactionFilters.dateFrom) || '';
  const dateTo = window.FinanceDates?.toDateOnly?.(transactionFilters.dateTo) || '';
  const search = transactionFilters.search.toLowerCase();
  const active = (readModel.transactions || [])
    .filter((event: Record<string, unknown>) => !transactionFilters.accountId
      || String(event.accountId) === transactionFilters.accountId
      || String(event.fromAccountId) === transactionFilters.accountId
      || String(event.toAccountId) === transactionFilters.accountId)
    .filter((event: Record<string, unknown>) => transactionFilters.scope === 'all' || String(event.scope) === transactionFilters.scope)
    .filter((event: Record<string, unknown>) => !transactionFilters.categoryId || String(event.categoryId).toLowerCase().includes(transactionFilters.categoryId.toLowerCase()))
    .filter((event: Record<string, unknown>) => transactionFilters.type === 'all' || String(event.ledgerType || event.type) === transactionFilters.type || String(event.type) === transactionFilters.type)
    .filter((event: Record<string, unknown>) => transactionFilters.reviewStatus === 'all' || String(event.reviewStatus || 'clear') === transactionFilters.reviewStatus)
    .filter((event: Record<string, unknown>) => {
      if (!search) return true;
      return [event.description, event.accountName, event.fromAccountName, event.toAccountName, event.categoryId]
        .some((part) => String(part || '').toLowerCase().includes(search));
    })
    .filter((event: Record<string, unknown>) => {
      const date = window.FinanceDates?.toDateOnly?.(event.timestamp) || '';
      return (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
    });
  return `
    <div class="modal-form">
      <h2 id="modal-title">Transactions</h2>
      <p class="modal-copy">A searchable raw log. Use it as evidence for the Observatory, not as the center of the product.</p>
      <div class="modal-grid-two">
        ${[
          ['Available cash', money(snapshot.availableCash ?? snapshot.trulyAvailableCash ?? snapshot.realBalance)],
          ['Reserved', money(snapshot.reservedCash ?? 0)],
          ['Total cash', money(snapshot.totalCash ?? snapshot.realBalance)],
          ['Monthly burn', money(snapshot.monthlyBurn)],
          ['Runway', snapshot.runwayMonths == null ? 'Unknown' : `${Number(snapshot.runwayMonths).toFixed(1)} months`],
          ['Debt remaining', money(snapshot.debtRemaining ?? snapshot.totalDebt)],
        ].map(([label, fieldValue]) => `
          <div class="form-group"><label>${label}</label><input aria-label="${label}" value="${escapeHtml(fieldValue)}" readonly /></div>
        `).join('')}
      </div>
      <div class="modal-section">
        <div class="ui-title">Filter ledger</div>
        <div class="modal-grid-three">
          <input id="modal-filter-search" aria-label="Search transactions" value="${escapeHtml(transactionFilters.search)}" placeholder="Search note, account, category" />
          <select id="modal-filter-account" aria-label="Filter by account">${accountOptions(transactionFilters.accountId)}</select>
          <select id="modal-filter-scope" aria-label="Filter by scope">${scopeFilterOptions(transactionFilters.scope)}</select>
          <input id="modal-filter-category" aria-label="Filter by category" value="${escapeHtml(transactionFilters.categoryId)}" placeholder="Category" />
          <select id="modal-filter-type" aria-label="Filter by type">
            <option value="all"${transactionFilters.type === 'all' ? ' selected' : ''}>All types</option>
            <option value="income"${transactionFilters.type === 'income' ? ' selected' : ''}>Income</option>
            <option value="expense"${transactionFilters.type === 'expense' ? ' selected' : ''}>Expense</option>
            <option value="transfer"${transactionFilters.type === 'transfer' ? ' selected' : ''}>Transfer</option>
            <option value="adjustment"${transactionFilters.type === 'adjustment' ? ' selected' : ''}>Adjustment</option>
          </select>
          <select id="modal-filter-review-status" aria-label="Filter by review status">
            <option value="all"${transactionFilters.reviewStatus === 'all' ? ' selected' : ''}>All review states</option>
            <option value="clear"${transactionFilters.reviewStatus === 'clear' ? ' selected' : ''}>Clear</option>
            <option value="needs_review"${transactionFilters.reviewStatus === 'needs_review' ? ' selected' : ''}>Needs review</option>
            <option value="reviewed"${transactionFilters.reviewStatus === 'reviewed' ? ' selected' : ''}>Reviewed</option>
          </select>
          <input id="modal-filter-date-from" aria-label="Date from" type="date" value="${escapeHtml(transactionFilters.dateFrom)}" />
          <input id="modal-filter-date-to" aria-label="Date to" type="date" value="${escapeHtml(transactionFilters.dateTo)}" />
          <button class="ui-btn ui-btn--secondary" type="button" data-action="refreshTransactionsModal">Apply filters</button>
          <button class="ui-btn ui-btn--secondary" type="button" data-action="exportTransactionsCsv">Export CSV</button>
        </div>
      </div>
      <div class="modal-section">
        <div class="ui-title">Ledger entries</div>
        ${active.length ? active.map((event: Record<string, unknown>) => {
          const amount = signedAmount(event);
          const isPositive = amount >= 0;
          const accountLabel = event.ledgerType === 'transfer'
            ? `${escapeHtml(event.fromAccountName || 'From account')} → ${escapeHtml(event.toAccountName || 'To account')}`
            : escapeHtml(event.accountName || 'Unassigned');
          return `
          <div class="modal-list-row">
            <span><strong>${escapeHtml(event.description || event.type)}</strong><br><small>${accountLabel} · ${escapeHtml(event.categoryId || 'uncategorized')} · ${escapeHtml(event.reviewStatus || 'clear')} · ${formatDate(event.timestamp)}</small></span>
            <span>${formatTransactionType(event.ledgerType || event.type)}${event.obligationId ? ` · ${escapeHtml(event.obligationTitle || event.obligationId)}` : ''}</span>
            <span class="${isPositive ? 'fin-val-pos' : 'fin-val-neg'}">${isPositive ? '+' : '-'}${money(Math.abs(amount))}</span>
            <button class="fin-mini-btn" type="button" data-action="openEditModal" data-action-args="'transactionReview', '${escapeHtml(actionArg(event.id))}'">Review</button>
          </div>
        `; }).join('') : `<div class="fin-compact-empty">${(readModel.transactions || []).length ? 'No transactions match these filters.' : 'No transactions yet. Add a cash account, then record one real movement.'}</div>`}
      </div>
      <div class="modal-section">
        <div class="ui-title">Add transaction</div>
        <div class="modal-grid-three">
          <select id="modal-txn-type" aria-label="Transaction type">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="transfer">Transfer</option>
            <option value="adjustment">Adjustment</option>
          </select>
          <input id="modal-txn-desc" aria-label="Transaction note" placeholder="Note" data-autofocus />
          <input id="modal-txn-amount" aria-label="Transaction amount" type="number" min="0" step="0.01" placeholder="Positive amount" />
          <input id="modal-txn-date" aria-label="Transaction date" type="date" value="${today()}" />
          <select id="modal-txn-account" aria-label="Transaction account">${accountOptions('', false)}</select>
          <select id="modal-txn-to-account" aria-label="Transfer destination account">${accountOptions('', false)}</select>
          <select id="modal-txn-direction" aria-label="Adjustment direction"><option value="increase">Increase account</option><option value="decrease">Decrease account</option></select>
          <input id="modal-txn-category" aria-label="Transaction category" placeholder="Category" value="uncategorized" />
          <select id="modal-txn-scope" aria-label="Transaction scope">${scopeOptions('business')}</select>
        </div>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="addTransaction">Add transaction</button>
      </div>
    </div>
  `;
}

function renderTransaction(defaultType = 'expense'): string {
  return renderTransactionWorkflow(defaultType, { accountOptions, projectOptions, today });
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
    ['unresolvedItems', '1. Resolve unclear items', snapshot.attentionQueue ? snapshot.attentionQueue.filter((q: any) => q.type === 'Needs review').length === 0 : true, 'Categorize or clarify any ambiguous transactions.'],
    ['matchPayments', '2. Match payments', true, 'Link incoming cash to expected invoices.'],
    ['confirmObligations', '3. Confirm obligations', snapshot.attentionQueue ? snapshot.attentionQueue.filter((q: any) => q.type === 'Due soon' || q.type === 'Overdue').length === 0 : true, 'Mark due costs as paid or deferred.'],
    ['reviewSignals', '4. Review signals', Number(snapshot.runwayMonths) >= 3, 'Inspect runway, low points, and missing inputs.'],
    ['closeMonth', '5. Save checkpoint', true, 'Save the current review and reset the operating cycle.'],
  ];
  return `
    <div class="modal-form">
      <h2 id="modal-title">Monthly review</h2>
      <p class="modal-copy">A 5-step flow to verify your financial map.</p>
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
  const importableRows = previewRows.length + duplicates.length;
  return `
    <div class="modal-form">
      <h2 id="modal-title">Import transactions from CSV</h2>
      <p class="modal-copy">Choose a local transaction CSV or paste CSV data. Map a signed amount column, or separate debit and credit columns, before importing.</p>
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
          ${csvAppliedProfileName ? `<div class="fin-compact-empty">Saved mapping: ${escapeHtml(csvAppliedProfileName)}</div>` : ''}
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
      ${csvSummary ? `<div class="fin-compact-empty" role="alert">${escapeHtml(csvSummary)}</div>` : ''}
      ${hasPreview ? `
        <div class="modal-section">
          <div class="ui-title">Import preview</div>
          <div class="csv-preview-counts">
            <span>${previewRows.length} accepted</span>
            <span>${duplicates.length} duplicate${duplicates.length === 1 ? '' : 's'}</span>
            <span>${rejected.length} rejected</span>
          </div>
          ${previewRows.slice(0, 6).map((row) => `<div class="modal-list-row"><span>${escapeHtml(row.description)}<br><small>${escapeHtml(row.date)} · ${escapeHtml(row.categoryId)} · ${escapeHtml(row.scope)}</small></span><span class="${row.amount >= 0 ? 'fin-val-pos' : 'fin-val-neg'}">${money(row.amount)}</span></div>`).join('')}
          ${duplicates.length ? `
            <div class="csv-validation-list">
              <strong>Duplicate handling</strong>
              <label><input type="radio" name="modal-csv-duplicate-policy" value="skip"${csvDuplicatePolicy === 'skip' ? ' checked' : ''} /> Skip duplicates</label>
              <label><input type="radio" name="modal-csv-duplicate-policy" value="import"${csvDuplicatePolicy === 'import' ? ' checked' : ''} /> Import duplicates anyway</label>
              ${duplicates.slice(0, 4).map((row) => `<span>${escapeHtml(row.date)} · ${escapeHtml(row.description)}</span>`).join('')}
            </div>
          ` : ''}
          ${rejected.length ? `<div class="csv-validation-list csv-validation-list--error"><strong>Rejected rows</strong>${rejected.slice(0, 6).map((row) => `<span>Row ${row.rowNumber}: ${escapeHtml(row.reason)}</span>`).join('')}</div>` : ''}
        </div>
      ` : ''}
      <div class="modal-actions">
        <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Cancel</button>
        <button class="ui-btn ui-btn--secondary" type="button" data-action="analyzeCsvImport">Analyze CSV</button>
        <button class="ui-btn ui-btn--secondary" type="button" data-action="previewCsvImport"${hasDocument ? '' : ' disabled'}>Preview import</button>
        <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="importCsvData"${importableRows ? '' : ' disabled'}>Import valid rows</button>
      </div>
    </div>
  `;
}

function renderBackupRestore(): string {
  const preview = backupPreview;
  const counts = preview?.counts || {};
  const warnings = preview?.warnings || [];
  return `
    <div class="modal-form">
      <h2 id="modal-title">Restore Finance Master backup</h2>
      <p class="modal-copy">Review this backup before replacement. Restoring replaces your current local finance data, goals, settings, review state, import history, and cached prices.</p>
      <div class="csv-file-actions">
        <button class="ui-btn ui-btn--secondary" type="button" data-action="chooseFinanceBackup">Choose backup file</button>
        <input id="modal-backup-file" type="file" accept="application/json,.json" hidden />
      </div>
      ${preview?.valid ? `
        <div class="backup-preview-card">
          <div><span>App</span><strong>${escapeHtml(preview.appName || 'Finance Master')}</strong></div>
          <div><span>Backup version</span><strong>${escapeHtml(preview.version || 'Unknown')}</strong></div>
          <div><span>Schema</span><strong>${escapeHtml(preview.schemaLabel || 'Unknown')}</strong></div>
          <div><span>Exported</span><strong>${formatDate(preview.exportedAt)}</strong></div>
          <div><span>Latest event</span><strong>${formatDate(preview.latestLocalEventAt)}</strong></div>
          <div><span>Ledger events</span><strong>${counts.ledgerEvents || 0}</strong></div>
          <div><span>Accounts</span><strong>${counts.accounts || 0}</strong></div>
          <div><span>Recurring costs</span><strong>${counts.recurringCosts || 0}</strong></div>
          <div><span>Pipeline items</span><strong>${counts.pipelineItems || 0}</strong></div>
          <div><span>Goals</span><strong>${counts.goals || 0}</strong></div>
          <div><span>CSV batches</span><strong>${counts.importBatches || 0}</strong></div>
          <div><span>Cached local values</span><strong>${counts.cachedQuotes || 0}</strong></div>
        </div>
        ${warnings.length ? `
          <div class="csv-validation-list" role="alert">
            ${warnings.map((warning) => `<span>${escapeHtml(warning)}</span>`).join('')}
          </div>
        ` : ''}
        <p class="modal-copy"><strong>Restore warning:</strong> clicking replace permanently overwrites the current local Finance Master data in this browser.</p>
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
  if (!accounts.length && !allowEmpty) {
    return '<option value="">Operating cash (created on save)</option>';
  }
  const empty = allowEmpty
    ? '<option value="">All accounts</option>'
    : '<option value="">Choose an account</option>';
  return `${empty}${accounts.map((account: Record<string, unknown>) => `
    <option value="${escapeHtml(account.id)}"${String(account.id) === selected ? ' selected' : ''}>${escapeHtml(account.name)} · ${escapeHtml(account.scope || 'shared')}</option>
  `).join('')}`;
}

function defaultProjectId(selected?: unknown): string {
  const explicit = String(selected || '').trim();
  if (explicit) return explicit;
  try {
    const stored = String(localStorage.getItem('finance-master.layout.treasury-project') || '').trim();
    if (!stored || stored === 'all' || stored === 'unassigned') return '';
    const projects = Store.getFinancialReadModel().projectProfiles || [];
    return projects.some((project: Record<string, unknown>) => String(project.id) === stored && String(project.status || 'active') !== 'archived')
      ? stored
      : '';
  } catch (error) {
    return '';
  }
}

function projectOptions(selected?: string): string {
  const current = defaultProjectId(selected);
  const projects = (Store.getFinancialReadModel().projectProfiles || [])
    .filter((project: Record<string, unknown>) => String(project.status || 'active') !== 'archived');
  return `<option value="">No project</option>${projects.map((project: Record<string, unknown>) => `
    <option value="${escapeHtml(project.id)}"${String(project.id) === current ? ' selected' : ''}>${escapeHtml(project.name)}${project.clientOrPurpose ? ` · ${escapeHtml(project.clientOrPurpose)}` : ''}</option>
  `).join('')}`;
}

function renderProjectProfile(id = ''): string {
  const item = (Store.getFinancialReadModel().projectProfiles || []).find((entry: Record<string, unknown>) => String(entry.id) === id);
  return `
    <div class="modal-form">
      <h2 id="modal-title">${item ? 'Edit project plan' : 'Add project plan'}</h2>
      <p class="modal-copy">Project plans group wallets, reserves, obligations, income, and transactions without creating separate books.</p>
      <input id="modal-project-id" type="hidden" value="${escapeHtml(item?.id || '')}" />
      <div class="form-group"><label for="modal-project-name">Name</label><input id="modal-project-name" value="${escapeHtml(item?.name || '')}" placeholder="Client launch or studio project" /></div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-project-purpose">Client / purpose</label><input id="modal-project-purpose" value="${escapeHtml(item?.clientOrPurpose || '')}" placeholder="Client, campaign, or internal project" /></div>
        <div class="form-group"><label for="modal-project-color">Color</label><select id="modal-project-color">
          ${['mint', 'blue', 'gold', 'rose', 'slate'].map((entry) => `<option value="${entry}"${String(item?.color || 'mint') === entry ? ' selected' : ''}>${entry}</option>`).join('')}
        </select></div>
      </div>
      <div class="form-group"><label for="modal-project-notes">Notes <span class="fin-text-med">(optional)</span></label><textarea id="modal-project-notes" rows="3" placeholder="What this map is for">${escapeHtml(item?.notes || '')}</textarea></div>
      <div class="modal-actions">${item ? '<button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="archiveProjectProfile">Archive</button>' : ''}<span class="modal-actions-spacer"></span>${formActions('projectProfile', Boolean(item)).replace('<div class="modal-actions">', '').replace('</div>', '')}</div>
    </div>
  `;
}

function renderIncome(id = ''): string {
  const item = (Store.getFinancialReadModel().pipelineDeals || []).find((entry: Record<string, unknown>) => String(entry.id) === id);
  const status = String(item?.status || 'expected').toLowerCase();
  const probability = item?.probability ?? INCOME_PROBABILITY_DEFAULTS[status] ?? 0.6;
  const amount = item && Number.isFinite(Number(item.netAmount)) ? item.netAmount : item?.value;
  const vatRate = item && Number.isFinite(Number(item.vatRate)) ? item.vatRate : '';
  const incomeType = String(item?.incomeType || 'one_off');
  const isTermBasedIncome = incomeType === 'retainer' || incomeType === 'recurring';
  const hasDurationValue = item
    && item.durationValue !== null
    && item.durationValue !== undefined
    && String(item.durationValue).trim() !== ''
    && Number.isFinite(Number(item.durationValue));
  const durationValue = hasDurationValue ? Number(item.durationValue) : '';
  const durationUnit = String(item?.durationUnit || 'months');
  return `
    <div class="modal-form">
      <h2 id="modal-title">${item ? 'Edit income' : 'Add income'}</h2>
      <p class="modal-copy">Use status to separate real, expected, overdue, and uncertain income.</p>
      <input id="modal-income-id" type="hidden" value="${escapeHtml(item?.id || '')}" />
      <div class="form-group"><label for="modal-income-title">Source</label><input id="modal-income-title" value="${escapeHtml(item?.title || '')}" placeholder="Client or opportunity" /></div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-income-amount">Amount before VAT</label><input id="modal-income-amount" type="number" step="0.01" value="${escapeHtml(amount || '')}" /></div>
        <div class="form-group"><label for="modal-income-vat-rate">VAT on top % <span class="fin-text-med">(optional)</span></label><input id="modal-income-vat-rate" type="number" min="0" max="100" step="0.1" value="${escapeHtml(vatRate)}" placeholder="0" /></div>
        <div class="form-group"><label for="modal-income-probability">Probability</label><input id="modal-income-probability" type="number" min="0" max="1" step="0.05" value="${escapeHtml(probability)}" /></div>
        <div class="form-group"><label for="modal-income-date">Expected date</label><input id="modal-income-date" type="date" value="${escapeHtml(item?.expectedDateISO || today())}" /></div>
        <div class="form-group"><label for="modal-income-status">Status</label><select id="modal-income-status">${INCOME_STATUSES.map((entry) => `<option value="${entry}"${status === entry ? ' selected' : ''}>${entry}</option>`).join('')}</select></div>
        <div class="form-group"><label for="modal-income-type">Income type</label><select id="modal-income-type" onchange="const wrap=document.getElementById('modal-income-duration-wrap'); if (wrap) wrap.hidden = !(this.value === 'retainer' || this.value === 'recurring');">${['one_off', 'retainer', 'recurring'].map((entry) => `<option value="${entry}"${incomeType === entry ? ' selected' : ''}>${entry.replace('_', ' ')}</option>`).join('')}</select></div>
        <div id="modal-income-duration-wrap" class="modal-grid-two modal-grid-span" ${isTermBasedIncome ? '' : 'hidden'}>
          <div class="form-group"><label for="modal-income-duration-value">Duration / quantity <span class="fin-text-med">(optional)</span></label><input id="modal-income-duration-value" type="number" min="0" step="1" value="${escapeHtml(durationValue)}" placeholder="6" /></div>
          <div class="form-group"><label for="modal-income-duration-unit">Unit</label><select id="modal-income-duration-unit">${['months', 'hours', 'times'].map((entry) => `<option value="${entry}"${durationUnit === entry ? ' selected' : ''}>${entry}</option>`).join('')}</select></div>
        </div>
        <div class="form-group"><label for="modal-income-scenario">Scenario Inclusion</label><select id="modal-income-scenario">${['realistic', 'conservative', 'optimistic', 'all'].map((scenario) => `<option${(item?.scenarioInclusion || 'realistic') === scenario ? ' selected' : ''}>${scenario}</option>`).join('')}</select></div>
        <div class="form-group"><label for="modal-income-scope">Scope</label><select id="modal-income-scope">${scopeOptions(String(item?.scope || 'business'))}</select></div>
        <div class="form-group"><label for="modal-income-project">Project plan</label><select id="modal-income-project">${projectOptions(item ? String(item.projectId || '') : undefined)}</select></div>
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
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-fiat-scope">Scope</label><select id="modal-fiat-scope">${scopeOptions(String(item?.scope || 'business'))}</select></div>
        <div class="form-group"><label for="modal-fiat-project">Project plan</label><select id="modal-fiat-project">${projectOptions(item ? String(item.projectId || '') : undefined)}</select></div>
        <div class="form-group"><label for="modal-fiat-bucket">Bucket</label><select id="modal-fiat-bucket">
          ${[
            ['available', 'Available cash'],
            ['tax_reserve', 'Tax reserve'],
            ['vat_reserve', 'VAT reserve'],
            ['health_insurance', 'Health insurance'],
            ['debt_repayment', 'Debt repayment'],
            ['personal_survival', 'Personal survival'],
            ['business_operating_costs', 'Business operating costs'],
            ['buffer', 'Buffer'],
          ].map(([bucket, label]) => `<option value="${bucket}"${String(item?.bucket || 'available') === bucket ? ' selected' : ''}>${label}</option>`).join('')}
        </select></div>
      </div>
      <div class="modal-actions">${deactivateButton('deactivateFiatAccount', Boolean(item))}<span class="modal-actions-spacer"></span>${formActions('fiatAccount', Boolean(item)).replace('<div class="modal-actions">', '').replace('</div>', '')}</div>
    </div>
  `;
}

function renderReserveBucket(id = '') {
  const item = (Store.getFinancialReadModel().reserveBuckets || []).find((entry: Record<string, unknown>) => String(entry.id) === id);
  return `
    <div class="modal-form">
      <h2 id="modal-title">${item ? 'Edit reserve bucket' : 'Add reserve bucket'}</h2>
      <input id="modal-reserve-id" type="hidden" value="${escapeHtml(item?.id || '')}" />
      <div class="form-group"><label for="modal-reserve-name">Name</label><input id="modal-reserve-name" value="${escapeHtml(item?.name || '')}" placeholder="Tax Reserve 2026" /></div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-reserve-target">Target amount</label><input id="modal-reserve-target" type="number" step="0.01" value="${escapeHtml(item?.targetAmount || '')}" /></div>
        <div class="form-group"><label for="modal-reserve-current">Current amount</label><input id="modal-reserve-current" type="number" step="0.01" value="${escapeHtml(item?.currentAmount || 0)}" /></div>
        <div class="form-group"><label for="modal-reserve-purpose">Purpose</label><select id="modal-reserve-purpose">
          ${[
            ['tax_reserve', 'Taxes'],
            ['vat_reserve', 'VAT'],
            ['health_insurance', 'Health insurance'],
            ['debt_repayment', 'Debt repayment'],
            ['personal_survival', 'Personal survival'],
            ['buffer', 'Buffer'],
            ['custom', 'Custom'],
          ].map(([val, label]) => `<option value="${val}"${String(item?.purpose || 'tax_reserve') === val ? ' selected' : ''}>${label}</option>`).join('')}
        </select></div>
        <div class="form-group"><label for="modal-reserve-scope">Scope</label><select id="modal-reserve-scope">${scopeOptions(String(item?.scope || 'shared'))}</select></div>
        <div class="form-group"><label for="modal-reserve-project">Project plan</label><select id="modal-reserve-project">${projectOptions(item ? String(item.projectId || '') : undefined)}</select></div>
        <div class="form-group"><label for="modal-reserve-priority">Priority</label><select id="modal-reserve-priority">
          ${[
            ['critical', 'Critical (Must fill)'],
            ['high', 'High'],
            ['medium', 'Medium'],
            ['low', 'Low (If surplus)'],
          ].map(([val, label]) => `<option value="${val}"${String(item?.priority || 'high') === val ? ' selected' : ''}>${label}</option>`).join('')}
        </select></div>
      </div>
      <div class="modal-actions">${deactivateButton('deactivateReserveBucket', Boolean(item))}<span class="modal-actions-spacer"></span>${formActions('reserveBucket', Boolean(item)).replace('<div class="modal-actions">', '').replace('</div>', '')}</div>
    </div>
  `;
}

function renderAllocateReserves() {
  const buckets = Store.getFinancialReadModel().reserveBuckets || [];
  return `
    <div class="modal-form">
      <h2 id="modal-title">Allocate Cash</h2>
      <p class="modal-copy">Move available cash into reserve buckets to protect it.</p>
      <div class="modal-section">
        <div class="form-group"><label for="modal-allocate-amount">Amount</label><input id="modal-allocate-amount" type="number" step="0.01" placeholder="0.00" /></div>
        <div class="form-group"><label for="modal-allocate-bucket">To bucket</label><select id="modal-allocate-bucket">
          ${buckets.map((b: any) => `<option value="${escapeHtml(b.id)}">${escapeHtml(b.name)} (${money(b.currentAmount)} of ${money(b.targetAmount)})</option>`).join('')}
        </select></div>
      </div>
      ${formActions('allocateReserves')}
    </div>
  `;
}


function renderExpense(id = ''): string {
  const item = (Store.getFinancialReadModel().recurringExpenses || []).find((entry: Record<string, unknown>) => String(entry.id) === id);
  let baseAmount = item?.monthlyAmount || '';
  if (item && item.monthlyAmount) {
    if (item.frequency === 'quarterly') baseAmount = item.monthlyAmount * 3;
    if (item.frequency === 'semi-annually') baseAmount = item.monthlyAmount * 6;
    if (item.frequency === 'annually') baseAmount = item.monthlyAmount * 12;
  }
  return `
    <div class="modal-form">
      <h2 id="modal-title">${item ? 'Edit recurring cost' : 'Add recurring cost'}</h2>
      <p class="modal-copy">Recurring costs become upcoming obligations and shape runway.</p>
      <input id="modal-expense-id" type="hidden" value="${escapeHtml(item?.id || '')}" />
      <div class="form-group"><label for="modal-expense-category">Name</label><input id="modal-expense-category" value="${escapeHtml(item?.category || '')}" placeholder="Health insurance or studio rent" /></div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-expense-amount">Amount</label><input id="modal-expense-amount" type="number" step="0.01" value="${escapeHtml(baseAmount)}" /></div>
        <div class="form-group"><label for="modal-expense-frequency">Frequency</label><select id="modal-expense-frequency">
          <option value="monthly"${item?.frequency === 'monthly' ? ' selected' : ''}>Monthly</option>
          <option value="quarterly"${item?.frequency === 'quarterly' ? ' selected' : ''}>Quarterly</option>
          <option value="semi-annually"${item?.frequency === 'semi-annually' ? ' selected' : ''}>Semi-annually</option>
          <option value="annually"${item?.frequency === 'annually' ? ' selected' : ''}>Annually</option>
        </select></div>
      </div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-expense-due-day">Due day</label><input id="modal-expense-due-day" type="number" min="1" max="28" value="${escapeHtml(item?.dueDay || 1)}" /></div>
        <div class="form-group"><label for="modal-expense-scope">Scope</label><select id="modal-expense-scope">${scopeOptions(String(item?.scope || 'personal'))}</select></div>
        <div class="form-group"><label for="modal-expense-project">Project plan</label><select id="modal-expense-project">${projectOptions(item ? String(item.projectId || '') : undefined)}</select></div>
      </div>
      <label class="settings-check"><input id="modal-expense-essential" type="checkbox"${item?.essential ? ' checked' : ''} /><span>Essential expense</span></label>
      <div class="modal-actions">${deactivateButton('deactivateRecurringExpense', Boolean(item))}<span class="modal-actions-spacer"></span>${formActions('expense', Boolean(item)).replace('<div class="modal-actions">', '').replace('</div>', '')}</div>
    </div>
  `;
}

function renderDebt(type: 'debtAdd' | 'debtPayment', id = ''): string {
  const debts = Store.getFinancialReadModel().debtAccounts || [];
  if (type === 'debtPayment') {
    if (!debts.length) {
      return `
        <div class="modal-form">
          <h2 id="modal-title">Record debt payment</h2>
          <p class="modal-copy">Add a debt item first, then payments can reduce its remaining balance.</p>
          <div class="fin-compact-empty">No debts are tracked yet.</div>
          <div class="modal-actions">
            <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Close</button>
            <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="openEditModal" data-action-args="'debtAdd'">Add debt item</button>
          </div>
        </div>
      `;
    }
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
      <div class="form-group"><label for="modal-debt-project">Project plan</label><select id="modal-debt-project">${projectOptions(item ? String(item.projectId || '') : undefined)}</select></div>
      <div class="modal-actions">${deactivateButton('deactivateDebtAccount', Boolean(item))}<span class="modal-actions-spacer"></span>${formActions('debtAdd', Boolean(item)).replace('<div class="modal-actions">', '').replace('</div>', '')}</div>
    </div>
  `;
}

function findTreasuryObligation(id: string): Record<string, unknown> | null {
  const treasury = Store.computeFinanceContext(true).treasury || {};
  return ((treasury.obligations || []) as Array<Record<string, unknown>>)
    .find((entry) => String(entry.id || '') === String(id || '')) || null;
}

function renderObligationPayment(id = ''): string {
  const obligation = findTreasuryObligation(id);
  return `
    <div class="modal-form">
      <h2 id="modal-title">Mark obligation paid</h2>
      <p class="modal-copy">${escapeHtml(obligation?.title || 'Obligation')} · ${money(obligation?.amount)} · due ${formatDate(obligation?.dueDate)}</p>
      <input id="modal-obligation-id" type="hidden" value="${escapeHtml(id)}" />
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-obligation-account">Paid from account</label><select id="modal-obligation-account">${accountOptions('', false)}</select></div>
        <div class="form-group"><label for="modal-obligation-paid-at">Payment date</label><input id="modal-obligation-paid-at" type="date" value="${escapeHtml(String(obligation?.dueDate || today()).slice(0, 10))}" /></div>
        <div class="form-group"><label for="modal-obligation-amount">Amount</label><input id="modal-obligation-amount" type="number" step="0.01" value="${escapeHtml(obligation?.amount || '')}" /></div>
      </div>
      <div class="form-group"><label for="modal-obligation-notes">Review note</label><textarea id="modal-obligation-notes" rows="2" placeholder="Optional note for the review trail"></textarea></div>
      ${formActions('obligationPayment')}
    </div>
  `;
}

function renderObligationDefer(id = ''): string {
  const obligation = findTreasuryObligation(id);
  return `
    <div class="modal-form">
      <h2 id="modal-title">Defer obligation</h2>
      <p class="modal-copy">${escapeHtml(obligation?.title || 'Obligation')} · current due date ${formatDate(obligation?.dueDate)}</p>
      <input id="modal-obligation-id" type="hidden" value="${escapeHtml(id)}" />
      <div class="form-group"><label for="modal-obligation-deferred-until">New due date</label><input id="modal-obligation-deferred-until" type="date" value="${today()}" /></div>
      <div class="form-group"><label for="modal-obligation-notes">Review note</label><textarea id="modal-obligation-notes" rows="2" placeholder="Why is this deferred?"></textarea></div>
      ${formActions('obligationDefer')}
    </div>
  `;
}

function findTransaction(id: string): Record<string, unknown> | null {
  return (Store.getFinancialReadModel().transactions || [])
    .find((entry: Record<string, unknown>) => String(entry.id) === String(id || '') || String(entry.transactionEntityId || '') === String(id || '')) || null;
}

function transactionSourceLabel(transaction: Record<string, unknown> | null): string {
  const source = String(transaction?.source || '').trim();
  if (transaction?.importBatchId || transaction?.sourceFile) return 'Imported from CSV';
  if (source === 'obligation.review') return 'Created from obligation review';
  if (source === 'pipeline-settlement') return 'Created from income settlement';
  if (source === 'demo') return 'Sample record';
  if (source === 'manual' || source === 'manual-ledger') return 'Added manually';
  return source ? source.replace(/[._-]/g, ' ') : 'Local record';
}

function transactionImportBatch(transaction: Record<string, unknown> | null): Record<string, unknown> | null {
  const batchId = String(transaction?.importBatchId || '').trim();
  if (!batchId) return null;
  const batches = ((Store.getImportState().batches || []) as unknown) as Record<string, unknown>[];
  return batches.find((batch) => String(batch.id || '') === batchId) || null;
}

function transactionImportBatchSummary(batch: Record<string, unknown> | null): [string, string][] {
  if (!batch) return [];
  const imported = Number(batch.importedCount ?? (Array.isArray(batch.fingerprints) ? batch.fingerprints.length : 0)) || 0;
  const duplicates = Number(batch.duplicateCount || 0);
  const duplicateImported = Number(batch.duplicateImportedCount || 0);
  const rejected = Number(batch.rejectedCount || 0);
  const activeRows = (Store.getFinancialReadModel().transactions || [])
    .filter((entry: Record<string, unknown>) => String(entry.importBatchId || '') === String(batch.id || '')).length;
  const policy = batch.duplicatePolicy === 'import' ? 'duplicates imported' : 'duplicates skipped';
  const totals = `${money(batch.incomeTotal || 0)} in · ${money(batch.expenseTotal || 0)} out`;
  const dateFrom = String(batch.dateFrom || '');
  const dateTo = String(batch.dateTo || '');
  const dateRange = dateFrom && dateTo ? (dateFrom === dateTo ? dateFrom : `${dateFrom} to ${dateTo}`) : '';
  return [
    ['CSV batch', `${imported} imported · ${duplicates} duplicate${duplicates === 1 ? '' : 's'} (${policy}) · ${rejected} rejected`],
    ['Batch totals', totals],
    ['Batch range', dateRange],
    ['Undo state', activeRows > 0 ? `${activeRows} active record${activeRows === 1 ? '' : 's'}` : 'Undo applied'],
    ['Duplicates included', duplicateImported ? String(duplicateImported) : ''],
  ];
}

function transactionTechnicalRows(transaction: Record<string, unknown> | null): [string, string][] {
  const batch = transactionImportBatch(transaction);
  const rows: [string, string][] = [
    ['Category', String(transaction?.categoryId || 'uncategorized')],
    ['Scope', String(transaction?.scope || 'shared')],
    ['Source', transactionSourceLabel(transaction)],
    ['Review', String(transaction?.reviewStatus || 'clear').replace(/[._-]/g, ' ')],
    ['Source file', String(transaction?.sourceFile || '')],
    ['Import batch', String(transaction?.importBatchId || '')],
    ...transactionImportBatchSummary(batch),
    ['Fingerprint', String(transaction?.fingerprint || '')],
    ['Linked income', String(transaction?.linkedIncomeTitle || transaction?.linkedIncomeId || '')],
    ['Linked obligation', String(transaction?.linkedObligationTitle || transaction?.obligationTitle || transaction?.obligationId || '')],
    ['Linked debt', String(transaction?.linkedDebtTitle || transaction?.linkedDebtId || '')],
    ['Linked reserve', String(transaction?.linkedReserveId || '')],
    ['Reversal', transaction?.reversalOf ? `Reversal of ${String(transaction.reversalOf)}` : (transaction?.reversedBy ? `Reversed by ${String(transaction.reversedBy)}` : '')],
    ['Record ID', String(transaction?.id || '')],
    ['Transaction entity', String(transaction?.transactionEntityId || '')],
    ['Created timestamp', String(transaction?.timestamp || '')],
  ];
  return rows.filter((row, index, list) => row[1].trim()
    && list.findIndex((candidate) => candidate[0] === row[0] && candidate[1] === row[1]) === index);
}

function obligationOptions(selected = ''): string {
  const obligations = ((Store.computeFinanceContext(true).treasury || {}).obligations || [])
    .filter((entry: Record<string, unknown>) => String(entry.status || '') !== 'paid' && String(entry.type || '') !== 'debt');
  return `<option value="">Choose obligation</option>${obligations.map((entry: Record<string, unknown>) => `
    <option value="${escapeHtml(entry.id)}"${String(entry.id) === selected ? ' selected' : ''}>${escapeHtml(entry.title)} · ${formatDate(entry.dueDate)} · ${money(entry.amount)}</option>
  `).join('')}`;
}

function daysBetween(left: unknown, right: unknown): number {
  const leftTs = Date.parse(String(left || ''));
  const rightTs = Date.parse(String(right || ''));
  if (!Number.isFinite(leftTs) || !Number.isFinite(rightTs)) return Number.POSITIVE_INFINITY;
  return Math.abs(leftTs - rightTs) / 86400000;
}

function categoryTokens(value: unknown): string[] {
  return String(value || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 4);
}

function addCategorySuggestion(
  suggestions: Map<string, { category: string; reason: string; score: number }>,
  category: unknown,
  reason: string,
  score: number,
): void {
  const normalized = String(category || '').trim();
  if (!normalized || normalized.toLowerCase() === 'uncategorized') return;
  const current = suggestions.get(normalized);
  if (!current || score > current.score) suggestions.set(normalized, { category: normalized, reason, score });
}

function transactionCategorySuggestions(transaction: Record<string, unknown> | null | undefined): Array<{ category: string; reason: string }> {
  if (!transaction) return [];
  const readModel = Store.getFinancialReadModel();
  const description = String(transaction.description || '').toLowerCase();
  const descriptionTokens = new Set(categoryTokens(description));
  const suggestions = new Map<string, { category: string; reason: string; score: number }>();

  (readModel.transactions || []).forEach((entry: Record<string, unknown>) => {
    if (String(entry.id || '') === String(transaction.id || '')) return;
    const category = String(entry.categoryId || '');
    if (!category || category.toLowerCase() === 'uncategorized') return;
    const entryTokens = categoryTokens(entry.description).filter((token) => descriptionTokens.has(token));
    if (entryTokens.length) {
      addCategorySuggestion(suggestions, category, 'Used on similar ledger records', 4 + entryTokens.length);
    } else if (categoryTokens(category).some((token) => description.includes(token))) {
      addCategorySuggestion(suggestions, category, 'Category name appears in the description', 3);
    }
  });

  (readModel.recurringExpenses || []).forEach((entry: Record<string, unknown>) => {
    const category = String(entry.category || '');
    const matched = categoryTokens(category).some((token) => description.includes(token));
    if (matched) addCategorySuggestion(suggestions, category, 'Matches a recurring obligation', 5);
  });

  return Array.from(suggestions.values())
    .sort((left, right) => right.score - left.score || left.category.localeCompare(right.category))
    .slice(0, 3)
    .map(({ category, reason }) => ({ category, reason }));
}

function paymentMatchSuggestions(transaction: Record<string, unknown> | null | undefined): Array<{ id: string; title: string; reason: string }> {
  if (!transaction || String(transaction.type) !== 'expense.recorded') return [];
  const amount = Math.abs(Number(transaction.amount) || Number(transaction.signedAmount) || 0);
  const txTokens = new Set(categoryTokens(transaction.description));
  type PaymentMatchSuggestion = { id: string; title: string; reason: string; score: number };
  const obligations = ((Store.computeFinanceContext(true).treasury || {}).obligations || [])
    .filter((entry: Record<string, unknown>) => String(entry.status || '') !== 'paid' && String(entry.type || '') !== 'debt');
  return obligations.map((entry: Record<string, unknown>): PaymentMatchSuggestion => {
    const obligationAmount = Math.abs(Number(entry.amount) || 0);
    const amountDelta = Math.abs(obligationAmount - amount);
    const dayDelta = daysBetween(transaction.timestamp, entry.dueDate);
    const tokenMatch = categoryTokens(entry.title).filter((token) => txTokens.has(token)).length;
    let score = 0;
    const reasons: string[] = [];
    if (amountDelta < 0.01) {
      score += 6;
      reasons.push('same amount');
    } else if (amountDelta <= Math.max(5, amount * 0.05)) {
      score += 3;
      reasons.push('similar amount');
    }
    if (dayDelta <= 3) {
      score += 4;
      reasons.push('near due date');
    } else if (dayDelta <= 10) {
      score += 2;
      reasons.push('close date');
    }
    if (tokenMatch) {
      score += tokenMatch * 2;
      reasons.push('matching description');
    }
    return {
      id: String(entry.id || ''),
      title: String(entry.title || 'Obligation'),
      reason: reasons.join(' + ') || 'possible obligation',
      score,
    };
  })
    .filter((entry: PaymentMatchSuggestion) => entry.id && entry.score > 0)
    .sort((left: PaymentMatchSuggestion, right: PaymentMatchSuggestion) => right.score - left.score || left.title.localeCompare(right.title))
    .slice(0, 3)
    .map(({ id, title, reason }: PaymentMatchSuggestion) => ({ id, title, reason }));
}

function renderTransactionReview(id = ''): string {
  const transaction = findTransaction(id);
  const suggestions = transactionCategorySuggestions(transaction);
  const currentIncomeId = String(transaction?.linkedIncomeId || '');
  const incomeItems = (Store.getFinancialReadModel().pipelineDeals || [])
    .filter((entry: Record<string, unknown>) => String(entry.id || '') === currentIncomeId || !['paid', 'cancelled', 'lost', 'deleted'].includes(String(entry.status || '').toLowerCase()));
  const reserveBuckets = Store.getFinancialReadModel().reserveBuckets || [];
  const debtAccounts = Store.getFinancialReadModel().debtAccounts || [];
  const technicalRows = transactionTechnicalRows(transaction);
  return `
    <div class="modal-form">
      <h2 id="modal-title">Review transaction</h2>
      <p class="modal-copy">${escapeHtml(transaction?.description || 'Transaction')} · ${money(transaction?.amount)} · ${formatDate(transaction?.timestamp)}</p>
      <p class="modal-copy">Linking is applied only when this review is saved. Choose "No linked ..." to unlink evidence.</p>
      <input id="modal-review-transaction-id" type="hidden" value="${escapeHtml(id)}" />
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-review-transaction-category">Category</label><input id="modal-review-transaction-category" value="${escapeHtml(transaction?.categoryId === 'uncategorized' ? '' : transaction?.categoryId || '')}" placeholder="software, tax, client-income" /></div>
        <div class="form-group"><label for="modal-review-transaction-scope">Scope</label><select id="modal-review-transaction-scope">${scopeOptions(String(transaction?.scope || 'business'))}</select></div>
      </div>
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-review-linked-income">Linked income</label><select id="modal-review-linked-income">
          <option value="">No linked income</option>
          ${incomeItems.map((entry: Record<string, unknown>) => `<option value="${escapeHtml(entry.id)}"${String(transaction?.linkedIncomeId || '') === String(entry.id) ? ' selected' : ''}>${escapeHtml(entry.title || 'Expected income')} · ${money(entry.value)}</option>`).join('')}
        </select></div>
        <div class="form-group"><label for="modal-review-linked-reserve">Linked reserve</label><select id="modal-review-linked-reserve">
          <option value="">No linked reserve</option>
          ${reserveBuckets.map((entry: Record<string, unknown>) => `<option value="${escapeHtml(entry.id)}"${String(transaction?.linkedReserveId || '') === String(entry.id) ? ' selected' : ''}>${escapeHtml(entry.name || 'Reserve bucket')}</option>`).join('')}
        </select></div>
        <div class="form-group"><label for="modal-review-linked-debt">Linked debt</label><select id="modal-review-linked-debt">
          <option value="">No linked debt</option>
          ${debtAccounts.map((entry: Record<string, unknown>) => `<option value="${escapeHtml(entry.id)}"${String(transaction?.linkedDebtId || '') === String(entry.id) ? ' selected' : ''}>${escapeHtml(entry.name || 'Debt item')} · ${money(entry.outstanding)}</option>`).join('')}
        </select></div>
      </div>
      ${suggestions.length ? `
        <div class="csv-validation-list">
          <strong>Suggested categories</strong>
          ${suggestions.map((suggestion) => `
            <button class="fin-mini-btn" type="button" data-action="chooseTransactionCategorySuggestion" data-action-args="'${escapeHtml(actionArg(suggestion.category))}'">${escapeHtml(suggestion.category)}</button>
            <span>${escapeHtml(suggestion.reason)}</span>
          `).join('')}
        </div>
      ` : ''}
      <div class="form-group"><label for="modal-review-transaction-notes">Review note</label><textarea id="modal-review-transaction-notes" rows="2" placeholder="Optional note for why this is clear"></textarea></div>
      ${technicalRows.length ? `
        <details class="modal-technical-details">
          <summary>Technical details</summary>
          <div>
            ${technicalRows.map(([label, fieldValue]) => `<p><span>${escapeHtml(label)}</span><strong>${escapeHtml(fieldValue)}</strong></p>`).join('')}
          </div>
        </details>
      ` : ''}
      ${id ? `
        <div class="modal-danger-zone">
          <span>
            <strong>Card settings</strong>
            <small>Reverse only after checking the transaction details above.</small>
          </span>
          <button class="fin-mini-btn fin-mini-btn--danger" type="button" data-action="deleteTransaction" data-action-args="'${escapeHtml(actionArg(id))}'">Reverse transaction</button>
        </div>
      ` : ''}
      ${formActions('transactionReview')}
    </div>
  `;
}

function renderPaymentMatch(id = ''): string {
  const transaction = findTransaction(id);
  const suggestions = paymentMatchSuggestions(transaction);
  return `
    <div class="modal-form">
      <h2 id="modal-title">Match payment to obligation</h2>
      <p class="modal-copy">${escapeHtml(transaction?.description || 'Payment')} · ${money(transaction?.amount)} · ${formatDate(transaction?.timestamp)}</p>
      <input id="modal-match-transaction-id" type="hidden" value="${escapeHtml(id)}" />
      <div class="form-group"><label for="modal-match-obligation-id">Obligation</label><select id="modal-match-obligation-id">${obligationOptions('')}</select></div>
      ${suggestions.length ? `
        <div class="csv-validation-list">
          <strong>Suggested matches</strong>
          ${suggestions.map((suggestion) => `
            <button class="fin-mini-btn" type="button" data-action="choosePaymentMatchSuggestion" data-action-args="'${escapeHtml(actionArg(suggestion.id))}'">${escapeHtml(suggestion.title)}</button>
            <span>${escapeHtml(suggestion.reason)}</span>
          `).join('')}
        </div>
      ` : ''}
      <div class="form-group"><label for="modal-match-notes">Review note</label><textarea id="modal-match-notes" rows="2" placeholder="Optional note for the match"></textarea></div>
      ${formActions('paymentMatch')}
    </div>
  `;
}

function renderPipelineReview(id = ''): string {
  const item = (Store.getFinancialReadModel().pipelineDeals || []).find((entry: Record<string, unknown>) => String(entry.id) === id);
  const status = String(item?.status || 'expected').toLowerCase();
  return `
    <div class="modal-form">
      <h2 id="modal-title">Review pipeline item</h2>
      <p class="modal-copy">${escapeHtml(item?.title || 'Pipeline item')} · ${money(item?.value)}</p>
      <input id="modal-pipeline-review-id" type="hidden" value="${escapeHtml(id)}" />
      <div class="modal-grid-two">
        <div class="form-group"><label for="modal-pipeline-review-status">Status</label><select id="modal-pipeline-review-status">${INCOME_STATUSES.map((entry) => `<option value="${entry}"${status === entry ? ' selected' : ''}>${entry}</option>`).join('')}</select></div>
        <div class="form-group"><label for="modal-pipeline-review-probability">Probability</label><input id="modal-pipeline-review-probability" type="number" min="0" max="1" step="0.05" value="${escapeHtml(item?.probability ?? 0.65)}" /></div>
        <div class="form-group"><label for="modal-pipeline-review-date">Expected date</label><input id="modal-pipeline-review-date" type="date" value="${escapeHtml(item?.expectedDateISO || today())}" /></div>
        <div class="form-group"><label for="modal-pipeline-review-account">Settlement account</label><select id="modal-pipeline-review-account">${accountOptions(String(item?.destinationAccountId || ''))}</select></div>
      </div>
      <div class="form-group"><label for="modal-pipeline-review-notes">Review note</label><textarea id="modal-pipeline-review-notes" rows="2" placeholder="What changed about this income?"></textarea></div>
      ${formActions('pipelineReview')}
    </div>
  `;
}

function renderDebtPlan(id = ''): string {
  const debt = (Store.getFinancialReadModel().debtAccounts || []).find((entry: Record<string, unknown>) => String(entry.id) === id);
  const planType = debt?.planType || 'regular';
  const frequency = debt?.paymentFrequency || debt?.frequency || 'monthly';
  const planStatus = debt?.planStatus || 'active';
  const installments = debt?.installments || [];
  
  const customHtml = installments.map((inst: any, idx: number) => `
    <div class="custom-installment-row modal-grid-two" data-index="${idx}" style="margin-bottom: 0.5rem; display: flex; gap: 0.5rem;">
      <input type="date" class="modal-debt-plan-inst-date" value="${escapeHtml(inst.date)}" style="flex: 1;" />
      <input type="number" min="0" step="0.01" class="modal-debt-plan-inst-amount" value="${escapeHtml(inst.amount)}" style="flex: 1;" />
      <button type="button" class="btn-secondary ui-btn ui-btn--secondary" onclick="this.parentElement.remove()" style="flex: 0 0 auto;">X</button>
    </div>
  `).join('');

  return `
    <div class="modal-form">
      <h2 id="modal-title">${debt?.planReviewedAt ? 'Edit debt payment plan' : 'Add debt payment plan'}</h2>
      <p class="modal-copy">${escapeHtml(debt?.name || 'Debt item')} · ${money(debt?.outstanding)} outstanding</p>
      <input id="modal-debt-plan-id" type="hidden" value="${escapeHtml(id)}" />
      <div class="modal-grid-two">
        <div class="form-group">
          <label for="modal-debt-plan-status">Plan status</label>
          <select id="modal-debt-plan-status">
            ${[
              ['active', 'Active'],
              ['starts_later', 'Starts later'],
              ['on_hold', 'On hold'],
              ['irregular', 'Irregular'],
              ['completed', 'Completed'],
              ['archived', 'Archived'],
            ].map(([status, label]) => `<option value="${status}"${String(planStatus) === status ? ' selected' : ''}>${label}</option>`).join('')}
          </select>
        </div>
        <div class="form-group"><label for="modal-debt-plan-custom-pressure">Custom monthly pressure</label><input id="modal-debt-plan-custom-pressure" type="number" min="0" step="0.01" value="${escapeHtml(debt?.customMonthlyPressure ?? '')}" placeholder="Optional" /></div>
        <div class="form-group"><label for="modal-debt-plan-start-date">Start date</label><input id="modal-debt-plan-start-date" type="date" value="${escapeHtml(debt?.startDate || '')}" /></div>
        <div class="form-group"><label for="modal-debt-plan-end-date">End date</label><input id="modal-debt-plan-end-date" type="date" value="${escapeHtml(debt?.endDate || '')}" /></div>
      </div>
      <div class="form-group">
        <label for="modal-debt-plan-type">Plan Type</label>
        <select id="modal-debt-plan-type" onchange="if(window.toggleDebtPlanType) window.toggleDebtPlanType(this.value)">
          <option value="regular"${planType === 'regular' ? ' selected' : ''}>Regular Frequencies</option>
          <option value="custom"${planType === 'custom' ? ' selected' : ''}>Custom Installments</option>
        </select>
      </div>

      <div id="modal-debt-plan-regular-section" style="display: ${planType === 'regular' ? 'block' : 'none'};">
        <div class="modal-grid-two">
          <div class="form-group"><label for="modal-debt-plan-frequency">Frequency</label>
            <select id="modal-debt-plan-frequency">
              <option value="weekly"${frequency === 'weekly' ? ' selected' : ''}>Weekly</option>
              <option value="biweekly"${frequency === 'biweekly' ? ' selected' : ''}>Biweekly</option>
              <option value="monthly"${frequency === 'monthly' ? ' selected' : ''}>Monthly</option>
              <option value="quarterly"${frequency === 'quarterly' ? ' selected' : ''}>Quarterly</option>
              <option value="yearly"${frequency === 'yearly' || frequency === 'annually' ? ' selected' : ''}>Yearly</option>
            </select>
          </div>
          <div class="form-group"><label for="modal-debt-plan-minimum">Minimum payment</label><input id="modal-debt-plan-minimum" type="number" min="0" step="0.01" value="${escapeHtml(debt?.paymentAmount || debt?.minimumPayment || '')}" /></div>
        </div>
        <div class="form-group"><label for="modal-debt-plan-due-date">Next due date</label><input id="modal-debt-plan-due-date" type="date" value="${escapeHtml(debt?.dueDate || today())}" /></div>
      </div>

      <div id="modal-debt-plan-custom-section" style="display: ${planType === 'custom' ? 'block' : 'none'};">
        <div class="form-group">
          <label>Installments</label>
          <div id="modal-debt-plan-custom-list">
            ${customHtml}
          </div>
          <button type="button" class="btn-secondary ui-btn ui-btn--secondary" data-action="addCustomInstallment" style="margin-top: 0.5rem;">+ Add Installment</button>
        </div>
      </div>

      <div class="form-group"><label for="modal-debt-plan-note">Payment plan note <span class="fin-text-med">(optional)</span></label><textarea id="modal-debt-plan-note" rows="2" placeholder="Monthly minimum, creditor agreement, or next decision">${escapeHtml(debt?.paymentPlanNote || '')}</textarea></div>
      <div class="modal-section">
        <label class="settings-check"><input id="modal-debt-plan-include-burn" type="checkbox"${debt?.includeInBurnRate === false ? '' : ' checked'} /><span>Include in monthly burn</span></label>
        <label class="settings-check"><input id="modal-debt-plan-include-safe" type="checkbox"${debt?.includeInSafeToSpend === false ? '' : ' checked'} /><span>Include in Safe-to-Spend</span></label>
        <label class="settings-check"><input id="modal-debt-plan-include-runway" type="checkbox"${debt?.includeInRunway === false ? '' : ' checked'} /><span>Include in runway</span></label>
      </div>
      ${formActions('debtPlan')}
    </div>
  `;
}

function renderModal(type: string, id = ''): string {
  if (type === 'quickAdd') return renderQuickAdd();
  if (type === 'transaction') return renderTransaction(id);
  if (type === 'financeOverview') return renderOverview();
  if (type === 'weeklyReview') return renderWeeklyReview();
  if (type === 'goals') return renderGoals();
  if (type === 'goal') return renderGoal(id);
  if (type === 'csvImport') return renderCsvImport();
  if (type === 'backupRestore') return renderBackupRestore();
  if (type === 'destructiveConfirm') return renderDestructiveConfirm();
  if (type === 'projectProfile') return renderProjectProfile(id);
  if (type === 'settleIncome') return renderSettleIncome(id);
  if (type === 'income') return renderIncome(id);
  if (type === 'fiatAccount') return renderFiatAccount(id);
  if (type === 'reserveBucket') return renderReserveBucket(id);
  if (type === 'allocateReserves') return renderAllocateReserves();
  if (type === 'web3Position' || type === 'defiPosition') return '<div class="modal-form"><h2 id="modal-title">Postponed</h2><p class="modal-copy">Market portfolio tracking is outside the focused treasury MVP.</p></div>';
  if (type === 'expense') return renderExpense(id);
  if (type === 'debtAdd' || type === 'debtPayment') return renderDebt(type, id);
  if (type === 'obligationPayment') return renderObligationPayment(id);
  if (type === 'obligationDefer') return renderObligationDefer(id);
  if (type === 'transactionReview') return renderTransactionReview(id);
  if (type === 'paymentMatch') return renderPaymentMatch(id);
  if (type === 'pipelineReview') return renderPipelineReview(id);
  if (type === 'debtPlan') return renderDebtPlan(id);
  return '<div class="modal-form"><h2 id="modal-title">Nothing to edit</h2></div>';
}

function openEditModal(type: string, options: { id?: string } | string = {}): void {
  if (!overlay || !body) return;
  closeQuickActionMenu();
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

function openDestructiveConfirmation(config: DestructiveConfirmation): void {
  destructiveConfirmation = config;
  openEditModal('destructiveConfirm');
}

function closeModal(): void {
  if (!overlay || !body) return;
  overlay.classList.remove('active');
  overlay.setAttribute('aria-hidden', 'true');
  body.innerHTML = '';
  destructiveConfirmation = null;
  modalReturnFocus?.focus();
  modalReturnFocus = null;
}

function append(draft: FinanceEventDraft, source: string): void {
  try {
    Store.appendFinanceEvent(draft, { source });
    closeModal();
  } catch (error) {
    showModalError(error instanceof Error ? error.message : 'Could not save this finance entry.');
  }
}

function addTransactionFromFields(prefix: string): boolean {
  const type = value(`${prefix}-type`) || 'expense';
  const description = value(`${prefix}-desc`);
  const amount = Math.abs(Number(value(`${prefix}-amount`)));
  const accountId = value(`${prefix}-account`);
  const hasAccounts = (Store.getFinancialReadModel().fiatAccounts || []).length > 0;
  const canCreateDefaultAccount = !hasAccounts && type !== 'transfer';
  if (!Number.isFinite(amount) || amount <= 0 || (!accountId && !canCreateDefaultAccount)) {
    showModalError(canCreateDefaultAccount ? 'Add a positive amount.' : 'Add a positive amount and an account.');
    return false;
  }
  try {
    if (type === 'transfer') {
      Store.recordTransfer({
        description,
        amount,
        timestamp: toIso(value(`${prefix}-date`)),
        fromAccountId: accountId,
        toAccountId: value(`${prefix}-to-account`),
        categoryId: value(`${prefix}-category`) || 'transfer',
        scope: value(`${prefix}-scope`) as FinanceScope,
        projectId: value(`${prefix}-project`),
      });
    } else {
      Store.recordLedgerTransaction({
        type: type === 'income' || type === 'adjustment' ? type : 'expense',
        description,
        amount,
        timestamp: toIso(value(`${prefix}-date`)),
        accountId,
        categoryId: value(`${prefix}-category`) || (type === 'income' ? 'client-income' : type === 'adjustment' ? 'adjustment' : 'uncategorized'),
        scope: value(`${prefix}-scope`) as FinanceScope,
        direction: value(`${prefix}-direction`) === 'decrease' ? 'decrease' : 'increase',
        projectId: value(`${prefix}-project`),
      });
    }
    closeModal();
    return true;
  } catch (error) {
    showModalError(error instanceof Error ? error.message : 'Could not add this transaction.');
    return false;
  }
}

function captureCsvFields(): void {
  csvRaw = value('modal-csv-text') || csvRaw;
  csvAccountId = value('modal-csv-account') || csvAccountId;
  csvDefaultCategory = value('modal-csv-default-category') || csvDefaultCategory;
  csvDefaultScope = (value('modal-csv-default-scope') || csvDefaultScope) as FinanceScope;
  const duplicatePolicy = document.querySelector<HTMLInputElement>('input[name="modal-csv-duplicate-policy"]:checked')?.value;
  csvDuplicatePolicy = duplicatePolicy === 'import' ? 'import' : 'skip';
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
  Store.recordBackupExport(backup.exportedAt);
  URL.revokeObjectURL(link.href);
}

function downloadTransactionsCsv(): void {
  const blob = new Blob([Store.exportTransactionsCsv()], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `finance-master-transactions-${today()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function saveFinanceModal(type: string): void {
  const currency = Store.getFinanceSettings().baseCurrency;
  const timestamp = new Date().toISOString();
  if (type === 'transaction') {
    addTransactionFromFields('modal-fast-txn');
    return;
  }
  if (type === 'income') {
    const amount = Number(value('modal-income-amount'));
    const vatRateRaw = String(value('modal-income-vat-rate') || '').trim();
    const vatRate = vatRateRaw ? Number(vatRateRaw) : 0;
    const probability = Number(value('modal-income-probability'));
    const incomeType = value('modal-income-type') || 'one_off';
    const durationRaw = String(value('modal-income-duration-value') || '').trim();
    const durationValue = durationRaw ? Number(durationRaw) : null;
    const durationUnit = value('modal-income-duration-unit') || 'months';
    if (!value('modal-income-title') || !Number.isFinite(amount) || amount === 0 || !Number.isFinite(probability) || probability < 0 || probability > 1 || !Number.isFinite(vatRate) || vatRate < 0 || vatRate > 100) {
      showModalError('Add an income source, a non-zero amount, an optional VAT rate between 0 and 100, and a probability between 0 and 1.');
      return;
    }
    if ((incomeType === 'retainer' || incomeType === 'recurring') && durationRaw && (!Number.isFinite(Number(durationValue)) || Number(durationValue) <= 0 || !['months', 'hours', 'times'].includes(durationUnit))) {
      showModalError('For retainer or recurring income, duration must be a positive number with months, hours, or times.');
      return;
    }
    const netAmount = Math.abs(amount);
    const vatAmount = Math.round((netAmount * (vatRate / 100)) * 100) / 100;
    const grossAmount = Math.round((netAmount + vatAmount) * 100) / 100;
    const termMetadata = (incomeType === 'retainer' || incomeType === 'recurring') && durationValue
      ? { durationValue, durationUnit }
      : {};
    append({
      type: 'pipeline.created',
      amount: grossAmount,
      currency,
      timestamp,
      related_entity_id: value('modal-income-id') || financeId('pipeline'),
      metadata: {
        title: value('modal-income-title'),
        value: grossAmount,
        netAmount,
        vatRate,
        vatAmount,
        grossAmount,
        probability,
        status: value('modal-income-status'),
        stage: value('modal-income-status'),
        scenarioInclusion: value('modal-income-scenario') || 'realistic',
        incomeType,
        ...termMetadata,
        expectedDateISO: value('modal-income-date'),
        destinationAccountId: value('modal-income-account'),
        scope: value('modal-income-scope'),
        projectId: value('modal-income-project') || undefined,
      },
    }, 'modal.income');
    return;
  }
  if (type === 'fiatAccount') {
    const balance = Number(value('modal-fiat-balance'));
    if (!value('modal-fiat-name') || !Number.isFinite(balance)) {
      showModalError('Add an account name and a valid balance.');
      return;
    }
    const bucket = value('modal-fiat-bucket') || 'available';
    append({
      type: 'asset.account_set',
      amount: balance,
      currency,
      timestamp,
      related_entity_id: value('modal-fiat-id') || financeId('cash'),
      metadata: {
        name: value('modal-fiat-name'),
        balance,
        active: true,
        scope: value('modal-fiat-scope'),
        projectId: value('modal-fiat-project') || undefined,
        bucket,
        reserved: bucket !== 'available',
      },
    }, 'modal.fiatAccount');
    return;
  }
  
  if (type === 'reserveBucket') {
    let reserveName = value('modal-reserve-name');
    let target = Number(value('modal-reserve-target'));
    const current = Number(value('modal-reserve-current')) || 0;
    if ((!Number.isFinite(target) || target <= 0) && current > 0) {
      const combined = reserveName.match(/^(.*[^\s\d])(\d+(?:\.\d+)?)$/);
      if (combined) {
        reserveName = combined[1].trim();
        target = Number(combined[2]);
      }
    }
    if (!reserveName || !Number.isFinite(target) || target <= 0 || current < 0) {
      showModalError('Add a name, a positive target amount, and a valid current amount.');
      return;
    }
    append({
      type: 'asset.reserve_set',
      amount: target,
      currency,
      timestamp,
      related_entity_id: value('modal-reserve-id') || financeId('reserve'),
      metadata: {
        name: reserveName,
        targetAmount: target,
        currentAmount: current,
        purpose: value('modal-reserve-purpose'),
        scope: value('modal-reserve-scope'),
        projectId: value('modal-reserve-project') || undefined,
        priority: value('modal-reserve-priority'),
        active: true,
      },
    }, 'modal.reserveBucket');
    return;
  }
  
  if (type === 'allocateReserves') {
    const amount = Number(value('modal-allocate-amount'));
    const bucketId = value('modal-allocate-bucket');
    if (!bucketId || !Number.isFinite(amount) || amount <= 0) {
      showModalError('Enter a valid amount to allocate.');
      return;
    }
    const bucket = (Store.getFinancialReadModel().reserveBuckets || []).find((entry: any) => String(entry.id) === bucketId);
    if (!bucket) {
      showModalError('Choose an existing reserve bucket before allocating cash.');
      return;
    }
    
    append({
      type: 'asset.reserve_allocated',
      amount: amount,
      currency,
      timestamp,
      related_entity_id: bucketId,
      metadata: {
        currentAmount: (Number(bucket.currentAmount) || 0) + amount,
      },
    }, 'modal.allocateReserves');
    return;
  }
  
  if (type === 'expense') {
    const amount = Math.abs(Number(value('modal-expense-amount')));
    const frequency = value('modal-expense-frequency') || 'monthly';
    let monthlyAmount = amount;
    if (frequency === 'quarterly') monthlyAmount = amount / 3;
    if (frequency === 'semi-annually') monthlyAmount = amount / 6;
    if (frequency === 'annually') monthlyAmount = amount / 12;
    
    const dueDay = Number(value('modal-expense-due-day'));
    if (!value('modal-expense-category') || !Number.isFinite(amount) || amount <= 0 || !Number.isFinite(dueDay) || dueDay < 1 || dueDay > 28) {
      showModalError('Add a cost name, positive amount, and due day from 1 to 28.');
      return;
    }
    append({ type: 'expense.recurring_set', amount, currency, timestamp, related_entity_id: value('modal-expense-id') || financeId('expense'), metadata: { category: value('modal-expense-category'), monthlyAmount, essential: checked('modal-expense-essential'), active: true, dueDay, frequency, scope: value('modal-expense-scope'), projectId: value('modal-expense-project') || undefined } }, 'modal.expense');
    return;
  }
  if (type === 'debtAdd') {
    const amount = Math.abs(Number(value('modal-debt-amount')));
    if (!value('modal-debt-name') || !Number.isFinite(amount) || amount <= 0) {
      showModalError('Add a debt name and a positive amount.');
      return;
    }
    append({ type: 'debt.added', amount, currency, timestamp, related_entity_id: value('modal-debt-id') || financeId('debt'), metadata: { name: value('modal-debt-name'), scope: value('modal-debt-scope'), projectId: value('modal-debt-project') || undefined } }, 'modal.debtAdd');
    return;
  }
  if (type === 'projectProfile') {
    try {
      Store.saveProjectProfile({
        id: value('modal-project-id') || undefined,
        name: value('modal-project-name'),
        clientOrPurpose: value('modal-project-purpose'),
        color: value('modal-project-color'),
        notes: value('modal-project-notes'),
        status: 'active',
      });
      closeModal();
    } catch (error) {
      showModalError(error instanceof Error ? error.message : 'Could not save this project plan.');
    }
    return;
  }
  if (type === 'debtPayment') {
    const amount = Math.abs(Number(value('modal-debt-payment-amount')));
    if (!value('modal-debt-payment-id') || !Number.isFinite(amount) || amount <= 0) {
      showModalError('Choose a debt item and enter a positive payment amount.');
      return;
    }
    append({ type: 'debt.payment_made', amount, currency, timestamp, related_entity_id: value('modal-debt-payment-id'), metadata: {} }, 'modal.debtPayment');
    return;
  }
  if (type === 'obligationPayment') {
    const amount = Math.abs(Number(value('modal-obligation-amount')));
    if (!value('modal-obligation-id') || !value('modal-obligation-account') || !Number.isFinite(amount) || amount <= 0) {
      showModalError('Choose an obligation, payment account, and positive amount.');
      return;
    }
    try {
      Store.reviewObligation({
        id: value('modal-obligation-id'),
        status: 'paid',
        accountId: value('modal-obligation-account'),
        paidAt: value('modal-obligation-paid-at'),
        amount,
        notes: value('modal-obligation-notes'),
      });
      closeModal();
    } catch (error) {
      showModalError(error instanceof Error ? error.message : 'Could not mark this obligation paid.');
    }
    return;
  }
  if (type === 'obligationDefer') {
    if (!value('modal-obligation-id') || !value('modal-obligation-deferred-until')) {
      showModalError('Choose an obligation and a new due date.');
      return;
    }
    try {
      Store.reviewObligation({
        id: value('modal-obligation-id'),
        status: 'deferred',
        deferredUntil: value('modal-obligation-deferred-until'),
        notes: value('modal-obligation-notes'),
      });
      closeModal();
    } catch (error) {
      showModalError(error instanceof Error ? error.message : 'Could not defer this obligation.');
    }
    return;
  }
  if (type === 'transactionReview') {
    if (!value('modal-review-transaction-id') || !value('modal-review-transaction-category')) {
      showModalError('Choose a transaction category before clearing this item.');
      return;
    }
    try {
      Store.reviewTransaction({
        id: value('modal-review-transaction-id'),
        categoryId: value('modal-review-transaction-category'),
        scope: value('modal-review-transaction-scope') as FinanceScope,
        notes: value('modal-review-transaction-notes'),
        linkedIncomeId: value('modal-review-linked-income'),
        linkedReserveId: value('modal-review-linked-reserve'),
        linkedDebtId: value('modal-review-linked-debt'),
      });
      closeModal();
    } catch (error) {
      showModalError(error instanceof Error ? error.message : 'Could not categorize this transaction.');
    }
    return;
  }
  if (type === 'paymentMatch') {
    if (!value('modal-match-transaction-id') || !value('modal-match-obligation-id')) {
      showModalError('Choose a payment and an obligation to match.');
      return;
    }
    try {
      Store.matchTransactionToObligation({
        transactionId: value('modal-match-transaction-id'),
        obligationId: value('modal-match-obligation-id'),
        notes: value('modal-match-notes'),
      });
      closeModal();
    } catch (error) {
      showModalError(error instanceof Error ? error.message : 'Could not match this payment.');
    }
    return;
  }
  if (type === 'pipelineReview') {
    const probability = Number(value('modal-pipeline-review-probability'));
    if (!value('modal-pipeline-review-id') || !value('modal-pipeline-review-date') || !Number.isFinite(probability) || probability < 0 || probability > 1) {
      showModalError('Choose a pipeline item, expected date, and probability between 0 and 1.');
      return;
    }
    try {
      Store.updatePipelineReview({
        id: value('modal-pipeline-review-id'),
        status: value('modal-pipeline-review-status'),
        probability,
        expectedDateISO: value('modal-pipeline-review-date'),
        destinationAccountId: value('modal-pipeline-review-account'),
        notes: value('modal-pipeline-review-notes'),
      });
      closeModal();
    } catch (error) {
      showModalError(error instanceof Error ? error.message : 'Could not update this pipeline item.');
    }
    return;
  }
  if (type === 'debtPlan') {
    const planType = (value('modal-debt-plan-type') as 'regular' | 'custom') || 'regular';
    const planStatus = value('modal-debt-plan-status') || 'active';
    const frequency = value('modal-debt-plan-frequency');
    const minimumPayment = Number(value('modal-debt-plan-minimum'));
    const dueDate = value('modal-debt-plan-due-date');
    const startDate = value('modal-debt-plan-start-date');
    const endDate = value('modal-debt-plan-end-date');
    const customMonthlyPressure = value('modal-debt-plan-custom-pressure') ? Number(value('modal-debt-plan-custom-pressure')) : null;
    const note = value('modal-debt-plan-note');
    
    const installments: Array<{ date: string; amount: number }> = [];
    if (planType === 'custom') {
      const dates = document.querySelectorAll<HTMLInputElement>('.modal-debt-plan-inst-date');
      const amounts = document.querySelectorAll<HTMLInputElement>('.modal-debt-plan-inst-amount');
      for (let i = 0; i < dates.length; i++) {
        if (dates[i].value && Number(amounts[i].value) > 0) {
          installments.push({ date: dates[i].value, amount: Number(amounts[i].value) });
        }
      }
      if (installments.length === 0) {
        showModalError('Add at least one valid installment for a custom plan.');
        return;
      }
    } else if (planStatus === 'active') {
      if (!dueDate || !Number.isFinite(minimumPayment) || minimumPayment <= 0) {
        showModalError('Add a due date and positive minimum payment.');
        return;
      }
    }
    if (planStatus === 'starts_later' && !startDate) {
      showModalError('Choose when this payment plan starts.');
      return;
    }
    if (customMonthlyPressure !== null && (!Number.isFinite(customMonthlyPressure) || customMonthlyPressure < 0)) {
      showModalError('Add a valid custom monthly pressure or leave it empty.');
      return;
    }

    if (!value('modal-debt-plan-id')) {
      showModalError('Invalid debt ID.');
      return;
    }
    
    try {
      Store.saveDebtPlan({
        id: value('modal-debt-plan-id'),
        dueDate: dueDate || installments[0]?.date || new Date().toISOString(),
        minimumPayment: minimumPayment || installments[0]?.amount || 0,
        paymentPlanNote: note,
        planType,
        planStatus,
        startDate,
        endDate,
        customMonthlyPressure,
        frequency,
        installments,
        includeInBurnRate: checked('modal-debt-plan-include-burn'),
        includeInSafeToSpend: checked('modal-debt-plan-include-safe'),
        includeInRunway: checked('modal-debt-plan-include-runway'),
      });
      closeModal();
    } catch (error) {
      showModalError(error instanceof Error ? error.message : 'Could not save this debt plan.');
    }
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
    try {
      Store.markPipelineItemPaid(value('modal-settle-id'), { destinationAccountId: value('modal-settle-account') });
      closeModal();
    } catch (error) {
      showModalError(error instanceof Error ? error.message : 'Could not mark this income as paid.');
    }
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
  if (!id) return;
  openDestructiveConfirmation({
    action: method as DestructiveConfirmationAction,
    targetId: id,
    title: 'Deactivate item',
    copy: 'This archives the selected item from active finance calculations while keeping the event history.',
    phrase: 'DEACTIVATE ITEM',
    buttonLabel: 'Deactivate item',
  });
}

Object.assign(window, {
  openEditModal,
  requestDestructiveConfirmation: openDestructiveConfirmation,
  closeModal,
  toggleQuickActionMenu,
  closeQuickActionMenu,
  saveFinanceModal,
  addTransaction: () => {
    if (addTransactionFromFields('modal-txn')) openEditModal('financeOverview');
  },
  refreshTransactionsModal: () => {
    transactionFilters.search = value('modal-filter-search');
    transactionFilters.accountId = value('modal-filter-account');
    transactionFilters.scope = value('modal-filter-scope') || 'all';
    transactionFilters.categoryId = value('modal-filter-category');
    transactionFilters.type = value('modal-filter-type') || 'all';
    transactionFilters.reviewStatus = value('modal-filter-review-status') || 'all';
    transactionFilters.dateFrom = value('modal-filter-date-from');
    transactionFilters.dateTo = value('modal-filter-date-to');
    openEditModal('financeOverview');
  },
  deleteTransaction: (id: string) => {
    if (!id) return;
    openDestructiveConfirmation({
      action: 'reverseTransaction',
      targetId: id,
      source: 'modal.transaction.reverse',
      title: 'Reverse transaction',
      copy: 'This reverses the transaction and its linked account balance update.',
      phrase: 'REVERSE TRANSACTION',
      buttonLabel: 'Reverse transaction',
      renderAfter: true,
    });
  },
  markAsPaid: (id: string) => {
    openEditModal('settleIncome', { id });
  },
  deleteInvoice: (id: string) => {
    if (!id) return;
    const invoice = (Store.getFinancialReadModel().invoices || []).find((entry: Record<string, unknown>) => String(entry.id) === id);
    openDestructiveConfirmation({
      action: 'deleteInvoice',
      targetId: id,
      reverseSettlement: String(invoice?.status || '').toLowerCase() === 'paid',
      title: 'Archive income entry',
      copy: 'This archives the selected pipeline or settlement entry. If it is settled, the linked settlement can be reversed as part of the archive.',
      phrase: 'ARCHIVE INCOME ENTRY',
      buttonLabel: 'Archive entry',
    });
  },
  markObligationNeedsReview: (id: string) => {
    try {
      Store.reviewObligation({ id, status: 'needs_review' });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not update this obligation.');
    }
  },
  cancelPipelineFromReview: (id: string) => {
    if (!id) return;
    openDestructiveConfirmation({
      action: 'cancelPipelineItem',
      targetId: id,
      source: 'Cancelled during Review.',
      title: 'Cancel pipeline item',
      copy: 'This removes the selected pipeline item from expected income and forecast assumptions.',
      phrase: 'CANCEL PIPELINE ITEM',
      buttonLabel: 'Cancel pipeline item',
      renderAfter: true,
    });
  },
  chooseTransactionCategorySuggestion: (category: string) => {
    const input = document.getElementById('modal-review-transaction-category') as HTMLInputElement | null;
    if (input) {
      input.value = category;
      input.focus();
    }
  },
  choosePaymentMatchSuggestion: (obligationId: string) => {
    const input = document.getElementById('modal-match-obligation-id') as HTMLSelectElement | null;
    if (input) {
      input.value = obligationId;
      input.focus();
    }
  },
  toggleDebtPlanType: (type: string) => {
    const regular = document.getElementById('modal-debt-plan-regular-section');
    const custom = document.getElementById('modal-debt-plan-custom-section');
    if (regular) regular.style.display = type === 'regular' ? 'block' : 'none';
    if (custom) custom.style.display = type === 'custom' ? 'block' : 'none';
  },
  addCustomInstallment: () => {
    const list = document.getElementById('modal-debt-plan-custom-list');
    if (!list) return;
    const idx = list.children.length;
    const row = document.createElement('div');
    row.className = 'custom-installment-row modal-grid-two';
    row.style.cssText = 'margin-bottom: 0.5rem; display: flex; gap: 0.5rem;';
    row.dataset.index = String(idx);
    row.innerHTML = `
      <input type="date" class="modal-debt-plan-inst-date" value="${today()}" style="flex: 1;" />
      <input type="number" min="0" step="0.01" class="modal-debt-plan-inst-amount" placeholder="Amount" style="flex: 1;" />
      <button type="button" class="btn-secondary ui-btn ui-btn--secondary" onclick="this.parentElement.remove()" style="flex: 0 0 auto;">X</button>
    `;
    list.appendChild(row);
  },
  archiveProjectProfile: () => {
    const id = value('modal-project-id');
    if (!id) return;
    openDestructiveConfirmation({
      action: 'archiveProjectProfile',
      targetId: id,
      title: 'Archive project plan',
      copy: 'This hides the project plan from active profile choices while keeping all tagged finance history intact.',
      phrase: 'ARCHIVE PROJECT PLAN',
      buttonLabel: 'Archive project',
      renderAfter: true,
    });
  },
  deactivateFiatAccount: () => confirmDeactivate('deactivateFiatAccount', 'modal-fiat-id'),
  deactivateReserveBucket: () => confirmDeactivate('deactivateReserveBucket', 'modal-reserve-id'),
  deactivateRecurringExpense: () => confirmDeactivate('deactivateRecurringExpense', 'modal-expense-id'),
  deactivateDebtAccount: () => confirmDeactivate('deactivateDebtAccount', 'modal-debt-id'),
  deleteDebtAccount: (id: string) => {
    if (!id) return;
    openDestructiveConfirmation({
      action: 'deleteDebtAccount',
      targetId: id,
      title: 'Delete mistaken debt',
      copy: 'This reverses the selected debt, its payments, and its payment-plan events. Use archive for old debt history you want to keep visible in the record.',
      phrase: 'DELETE DEBT ENTRY',
      buttonLabel: 'Delete debt entry',
      renderAfter: true,
    });
  },
  pauseDebtPlan: (id: string) => {
    try {
      Store.setDebtPlanStatus(id, 'on_hold');
      window.FinancialMode?.render?.();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not pause this debt plan.');
    }
  },
  reactivateDebtPlan: (id: string) => {
    try {
      Store.setDebtPlanStatus(id, 'active');
      window.FinancialMode?.render?.();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Could not reactivate this debt plan.');
    }
  },
  completeDebtPlan: (id: string) => {
    if (!id) return;
    openDestructiveConfirmation({
      action: 'completeDebtPlan',
      targetId: id,
      title: 'Mark debt plan complete',
      copy: 'This keeps the debt record in history and removes the plan from active monthly pressure.',
      phrase: 'MARK DEBT COMPLETE',
      buttonLabel: 'Mark complete',
      renderAfter: true,
    });
  },
  archiveDebtPlan: (id: string) => {
    if (!id) return;
    openDestructiveConfirmation({
      action: 'archiveDebtPlan',
      targetId: id,
      title: 'Archive debt plan',
      copy: 'This hides the payment plan from active calculations while keeping the liability history available.',
      phrase: 'ARCHIVE DEBT PLAN',
      buttonLabel: 'Archive debt plan',
      renderAfter: true,
    });
  },
  resetDemoData: () => {
    openDestructiveConfirmation({
      action: 'resetDemoData',
      title: 'Restore sample data',
      copy: 'This replaces the current local Finance Master ledger with the fictional sample data.',
      phrase: 'RESTORE SAMPLE DATA',
      buttonLabel: 'Restore sample data',
    });
  },
  deleteDemoData: () => {
    openDestructiveConfirmation({
      action: 'deleteDemoData',
      title: 'Delete sample data',
      copy: 'This clears the fictional sample ledger from this browser. Your dashboard will be empty until you add entries or restore a backup.',
      phrase: 'DELETE SAMPLE DATA',
      buttonLabel: 'Delete sample data',
    });
  },
  resetLocalFinanceData: () => {
    openDestructiveConfirmation({
      action: 'resetLocalFinanceData',
      title: 'Reset local finance data',
      copy: 'This clears only Finance Master local finance data in this browser, including ledger events, settings, review state, import history, goals, and cached local values.',
      phrase: 'DELETE LOCAL FINANCE DATA',
      buttonLabel: 'Reset local data',
    });
  },
  completeWeeklyReview: () => {
    const accountChecks = [...document.querySelectorAll<HTMLInputElement>('.review-account-check')];
    const reviewChecks = [
      'modal-review-unresolvedItems',
      'modal-review-matchPayments',
      'modal-review-confirmObligations',
      'modal-review-reviewSignals',
      'modal-review-closeMonth',
    ];
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
        unresolvedItems: true,
        matchPayments: true,
        confirmObligations: true,
        reviewSignals: true,
        closeMonth: true,
        notes: value('modal-review-notes'),
      });
      closeModal();
    } catch (error) {
      showModalError(error instanceof Error ? error.message : 'Could not complete this review.');
    }
  },
  deleteGoal: (id: string) => {
    if (!id) return;
    openDestructiveConfirmation({
      action: 'deleteGoal',
      targetId: id,
      title: 'Delete savings goal',
      copy: 'This deletes the selected savings or buffer goal. It does not delete linked account balances.',
      phrase: 'DELETE SAVINGS GOAL',
      buttonLabel: 'Delete goal',
      reopenModal: 'goals',
    });
  },
  exportFinanceBackup: () => downloadBackup(),
  exportTransactionsCsv: () => downloadTransactionsCsv(),
  chooseFinanceBackup: () => document.querySelector<HTMLInputElement>('#modal-backup-file')?.click(),
  undoImportBatch: (batchId: string) => {
    if (!batchId) return;
    openDestructiveConfirmation({
      action: 'undoImportBatch',
      targetId: batchId,
      title: 'Undo CSV import',
      copy: 'This reverses the transactions imported in the selected CSV batch.',
      phrase: 'UNDO CSV IMPORT',
      buttonLabel: 'Undo import',
      renderAfter: true,
    });
  },
  chooseCsvImport: () => document.querySelector<HTMLInputElement>('#modal-csv-file')?.click(),
  analyzeCsvImport: () => {
    try {
      captureCsvFields();
      csvDocument = parseCsvDocument(csvRaw);
      csvMapping = inferCsvColumnMapping(csvDocument.headers);
      csvAppliedProfileName = '';
      applyBestCsvImportProfile();
      csvPreview = null;
      csvSummary = '';
      openEditModal('csvImport');
    } catch (error) {
      csvDocument = null;
      csvPreview = null;
      csvAppliedProfileName = '';
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
      saveCurrentCsvImportProfile();
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
    if (!csvPreview) {
      showModalError('Preview at least one valid row before importing.');
      return;
    }
    try {
      const rows = csvDuplicatePolicy === 'import'
        ? [...csvPreview.rows, ...csvPreview.duplicates]
        : csvPreview.rows;
      if (!rows.length) {
        showModalError('Preview at least one valid row before importing.');
        return;
      }
      const summary = Store.importCsvTransactions(rows, {
        accountId: csvAccountId,
        sourceFile: csvPreview.sourceFile,
        duplicatePolicy: csvDuplicatePolicy,
        duplicateCount: csvPreview.duplicates.length,
        rejectedCount: csvPreview.rejected.length,
      });
      saveCurrentCsvImportProfile();
      csvSummary = `Imported ${summary.imported} row${summary.imported === 1 ? '' : 's'}${summary.duplicateImported ? ` · included ${summary.duplicateImported} duplicate${summary.duplicateImported === 1 ? '' : 's'}` : ''}${summary.duplicates ? ` · skipped ${summary.duplicates} duplicate${summary.duplicates === 1 ? '' : 's'}` : ''}.`;
      csvPreview = null;
      openEditModal('csvImport');
    } catch (error) {
      showModalError(error instanceof Error ? error.message : 'Could not import this CSV.');
    }
  },
  applyBackupRestore: () => {
    if (!backupPreview?.valid || !pendingBackup) {
      showModalError('Choose a valid Finance Master backup before restoring.');
      return;
    }
    openDestructiveConfirmation({
      action: 'restoreBackup',
      title: 'Replace local finance data',
      copy: 'This replaces the current local Finance Master data in this browser with the selected backup.',
      phrase: 'RESTORE LOCAL FINANCE DATA',
      buttonLabel: 'Replace current data',
    });
  },
  applyDestructiveConfirmation: () => {
    const config = destructiveConfirmation;
    if (!config) {
      showModalError('Choose an action before confirming.');
      return;
    }
    if (value('modal-destructive-phrase') !== config.phrase) {
      showModalError('The confirmation phrase does not match.');
      return;
    }
    try {
      if (config.action === 'restoreBackup') {
        if (!backupPreview?.valid || !pendingBackup) throw new Error('Choose a valid Finance Master backup before restoring.');
        Store.restoreBackup(pendingBackup);
        pendingBackup = null;
        backupPreview = null;
      } else if (config.action === 'resetLocalFinanceData') {
        Store.resetLocalFinanceData();
      } else if (config.action === 'resetDemoData') {
        Store.clearAndReseedDemo();
      } else if (config.action === 'deleteDemoData') {
        Store.deleteSampleData();
      } else if (config.action === 'archiveProjectProfile') {
        if (!config.targetId) throw new Error('Choose a project plan before archiving.');
        Store.archiveProjectProfile(config.targetId);
      } else if (config.action === 'deactivateFiatAccount' || config.action === 'deactivateReserveBucket' || config.action === 'deactivateRecurringExpense' || config.action === 'deactivateDebtAccount') {
        if (!config.targetId) throw new Error('Choose an item before deactivating.');
        (Store[config.action] as (id: string) => FinanceEvent[])(config.targetId);
      } else if (config.action === 'deleteDebtAccount') {
        if (!config.targetId) throw new Error('Choose a debt item before deleting.');
        Store.deleteDebtAccount(config.targetId);
      } else if (config.action === 'completeDebtPlan') {
        if (!config.targetId) throw new Error('Choose a debt item before completing.');
        Store.setDebtPlanStatus(config.targetId, 'completed');
      } else if (config.action === 'archiveDebtPlan') {
        if (!config.targetId) throw new Error('Choose a debt item before archiving.');
        Store.setDebtPlanStatus(config.targetId, 'archived');
      } else if (config.action === 'reverseTransaction') {
        if (!config.targetId) throw new Error('Choose a transaction before reversing.');
        Store.reverseTransaction(config.targetId, config.source || 'modal.transaction.reverse');
      } else if (config.action === 'deleteInvoice') {
        if (!config.targetId) throw new Error('Choose an income entry before archiving.');
        Store.deleteInvoice(config.targetId, { reverseSettlement: config.reverseSettlement === true });
      } else if (config.action === 'cancelPipelineItem') {
        if (!config.targetId) throw new Error('Choose a pipeline item before cancelling.');
        Store.cancelPipelineItem(config.targetId, config.source || 'Cancelled.');
      } else if (config.action === 'deleteGoal') {
        if (!config.targetId) throw new Error('Choose a goal before deleting.');
        Store.deleteGoal(config.targetId);
      } else if (config.action === 'undoImportBatch') {
        if (!config.targetId) throw new Error('Choose an import batch before undoing.');
        Store.undoImportBatch(config.targetId);
      }
      const reopenModal = config.reopenModal;
      const renderAfter = config.renderAfter === true;
      applyAppearance(Store);
      closeModal();
      if (reopenModal) openEditModal(reopenModal);
      if (renderAfter || !reopenModal) window.FinancialMode?.render?.();
    } catch (error) {
      showModalError(error instanceof Error ? error.message : 'Could not complete this action.');
    }
  },
});

document.addEventListener('click', (event) => {
  const button = (event.target as Element | null)?.closest<HTMLElement>('[data-action]');
  const target = event.target as Node | null;
  if (!button) {
    if (target && quickActionMenu?.classList.contains('active') && !quickActionMenu.contains(target) && !quickActionButton?.contains(target)) {
      closeQuickActionMenu();
    }
    return;
  }
  const action = button.dataset.action;
  if (!action) return;
  if (action !== 'toggleQuickActionMenu' && quickActionMenu?.contains(button)) closeQuickActionMenu();
  event.preventDefault();
  resolveAction(action)?.(...parseArgs(button.dataset.actionArgs || ''));
});

overlay?.addEventListener('click', (event) => {
  if (event.target === overlay) closeModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && quickActionMenu?.classList.contains('active')) {
    closeQuickActionMenu();
    return;
  }
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
  if (!overlay.contains(document.activeElement)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

document.addEventListener('input', (event) => {
  const input = event.target as HTMLInputElement | null;
  if (input?.id === 'modal-destructive-phrase') updateDestructiveConfirmButton();
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
        csvAppliedProfileName = '';
        applyBestCsvImportProfile();
        csvPreview = null;
        csvSummary = '';
        openEditModal('csvImport');
      } catch (error) {
        csvDocument = null;
        csvPreview = null;
        csvAppliedProfileName = '';
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
      backupPreview = Store.previewBackup(pendingBackup);
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
