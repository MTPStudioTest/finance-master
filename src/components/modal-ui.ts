export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function scopeOptions(selected = 'shared'): string {
  return [
    ['business', 'Business'],
    ['personal', 'Personal'],
    ['shared', 'Shared'],
  ].map(([entry, label]) => `<option value="${entry}"${selected === entry ? ' selected' : ''}>${label}</option>`).join('');
}

export function scopeFilterOptions(selected = 'all'): string {
  return `<option value="all"${selected === 'all' ? ' selected' : ''}>All scopes</option>${scopeOptions(selected)}`;
}

export function formatDate(value: unknown): string {
  const parsed = Date.parse(String(value || ''));
  if (!Number.isFinite(parsed)) return 'Unknown date';
  return new Date(parsed).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatTransactionType(value: unknown): string {
  const raw = String(value || '').replace(/_/g, ' ').replace(/\./g, ' ');
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Transaction';
}

export function signedAmount(entry: Record<string, unknown>): number {
  const explicit = Number(entry.signedAmount);
  if (Number.isFinite(explicit)) return explicit;
  const amount = Math.abs(Number(entry.amount) || 0);
  if (String(entry.type) === 'expense.recorded') return -amount;
  return amount;
}

export function formActions(type: string, edit = false): string {
  return `
    <div class="modal-actions">
      <button class="btn-secondary ui-btn ui-btn--secondary" type="button" data-action="closeModal">Cancel</button>
      <button class="btn-primary ui-btn ui-btn--primary" type="button" data-action="saveFinanceModal" data-action-args="'${type}'">${edit ? 'Save' : 'Create'}</button>
    </div>
  `;
}

export function deactivateButton(action: string, edit: boolean): string {
  return edit
    ? `<button class="btn-danger ui-btn" type="button" data-action="${action}">Deactivate</button>`
    : '';
}
