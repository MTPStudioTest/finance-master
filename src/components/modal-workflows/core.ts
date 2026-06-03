import { formActions, scopeOptions } from '../modal-ui';

interface TransactionRendererDeps {
  accountOptions: (selected?: string, allowEmpty?: boolean) => string;
  today: () => string;
}

export function renderQuickAdd(): string {
  return `
    <div class="modal-form">
      <h2 id="modal-title">New Entry</h2>
      <p class="modal-copy">Add items to your treasury OS.</p>
      <div class="quick-add-grid">
        <button class="quick-add-card" type="button" data-action="openEditModal" data-action-args="'transaction', 'expense'"><strong>Add transaction</strong><span>Record income, expense, or transfer</span></button>
        <button class="quick-add-card" type="button" data-action="openEditModal" data-action-args="'income'"><strong>Add invoice / expected income</strong><span>Confirmed, likely, uncertain, or overdue</span></button>
        <button class="quick-add-card" type="button" data-action="openEditModal" data-action-args="'expense'"><strong>Add recurring cost</strong><span>Fixed obligation that affects runway</span></button>
        <button class="quick-add-card" type="button" data-action="openEditModal" data-action-args="'debtAdd'"><strong>Add debt</strong><span>Track a loan or credit obligation</span></button>
        <button class="quick-add-card" type="button" data-action="openEditModal" data-action-args="'reserveBucket'"><strong>Add reserve bucket</strong><span>Tax, VAT, buffer, or available cash</span></button>
        <button class="quick-add-card" type="button" data-action="openEditModal" data-action-args="'csvImport'"><strong>Import local CSV</strong><span>Bring in transactions for review</span></button>
      </div>
    </div>
  `;
}

export function renderTransaction(defaultType = 'expense', deps: TransactionRendererDeps): string {
  const safeType = ['expense', 'income', 'transfer', 'adjustment'].includes(defaultType) ? defaultType : 'expense';
  const title = safeType === 'income'
    ? 'Add income'
    : safeType === 'transfer'
      ? 'Add transfer'
      : safeType === 'adjustment'
        ? 'Add cash adjustment'
        : 'Add expense';
  return `
    <div class="modal-form">
      <h2 id="modal-title">${title}</h2>
      <p class="modal-copy">Enter a positive amount. Corrections are handled by reversing the entry and adding a new one.</p>
      <div class="modal-grid-dynamic" data-active-type="${safeType}">
        <div class="form-group fg-type">
          <label for="modal-fast-txn-type">Type</label>
          <select id="modal-fast-txn-type" onchange="this.closest('.modal-grid-dynamic').dataset.activeType = this.value; document.getElementById('modal-title').textContent = 'Add ' + (this.value === 'expense' ? 'expense' : this.value === 'income' ? 'income' : this.value === 'transfer' ? 'transfer' : 'cash adjustment');">
            <option value="expense"${safeType === 'expense' ? ' selected' : ''}>Expense</option>
            <option value="income"${safeType === 'income' ? ' selected' : ''}>Income</option>
            <option value="transfer"${safeType === 'transfer' ? ' selected' : ''}>Transfer</option>
            <option value="adjustment"${safeType === 'adjustment' ? ' selected' : ''}>Adjustment</option>
          </select>
        </div>
        <div class="form-group fg-amount">
          <label for="modal-fast-txn-amount">Amount</label>
          <input id="modal-fast-txn-amount" type="number" min="0" step="0.01" placeholder="Positive amount" />
        </div>
        <div class="form-group fg-date">
          <label for="modal-fast-txn-date">Date</label>
          <input id="modal-fast-txn-date" type="date" value="${deps.today()}" />
        </div>
        <div class="form-group fg-account">
          <label for="modal-fast-txn-account">Account</label>
          <select id="modal-fast-txn-account">${deps.accountOptions('', false)}</select>
        </div>
        <div class="form-group fg-to-account conditional-transfer">
          <label for="modal-fast-txn-to-account">Transfer destination</label>
          <select id="modal-fast-txn-to-account">${deps.accountOptions('', false)}</select>
        </div>
        <div class="form-group fg-direction conditional-adjustment">
          <label for="modal-fast-txn-direction">Adjustment direction</label>
          <select id="modal-fast-txn-direction">
            <option value="increase">Increase account</option>
            <option value="decrease">Decrease account</option>
          </select>
        </div>
        <div class="form-group fg-category conditional-income-expense">
          <label for="modal-fast-txn-category">Category</label>
          <input id="modal-fast-txn-category" placeholder="uncategorized" />
        </div>
        <div class="form-group fg-scope conditional-income-expense">
          <label for="modal-fast-txn-scope">Scope</label>
          <select id="modal-fast-txn-scope">${scopeOptions('business')}</select>
        </div>
        <div class="form-group fg-note">
          <label for="modal-fast-txn-desc">Note <span class="fin-text-med">(optional)</span></label>
          <input id="modal-fast-txn-desc" placeholder="Client payment or studio rent" data-autofocus />
        </div>
      </div>
      ${formActions('transaction')}
    </div>
  `;
}
