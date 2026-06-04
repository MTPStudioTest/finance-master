export function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function escapeActionArg(value) {
    return String(value == null ? '' : value)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, '\\\'');
}

export function pluralize(count, singular, plural) {
    const value = Number(count) || 0;
    return `${value} ${value === 1 ? singular : (plural || `${singular}s`)}`;
}

export function scopeFilterOptions(selected) {
    return [
        ['all', 'All scopes'],
        ['business', 'Business'],
        ['personal', 'Personal'],
        ['shared', 'Shared']
    ].map(([value, label]) => `<option value="${value}"${selected === value ? ' selected' : ''}>${label}</option>`).join('');
}

export function formatShortDate(value) {
    const timestamp = Date.parse(String(value || ''));
    if (!Number.isFinite(timestamp)) return 'Not yet';
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function renderCompactEmpty(text) {
    return `<div class="fin-compact-empty">${escapeHtml(text)}</div>`;
}

export function statusLabel(value) {
    const raw = String(value || '').replace(/_/g, ' ');
    return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : 'Review';
}

export function renderStatusPill(status) {
    const safe = String(status || 'needs_review').toLowerCase();
    return `<span class="fin-status-pill fin-status-pill--${escapeHtml(safe)}">${escapeHtml(statusLabel(safe))}</span>`;
}

export function renderFinanceButton({
    label,
    action = '',
    args = '',
    local = false,
    variant = 'secondary',
    size = 'md',
    iconHtml = '',
    extraClass = '',
    attrs = '',
    fullWidth = false
} = {}) {
    const actionAttr = action
        ? (local
            ? `data-fin-action="${escapeHtml(action)}"`
            : `data-action="${escapeHtml(action)}"${args ? ` data-action-args="${escapeHtml(args)}"` : ''}`)
        : '';
    const classes = [
        'fin-button',
        `fin-button--${String(variant || 'secondary')}`,
        `fin-button--${String(size || 'md')}`,
        fullWidth ? 'fin-button--full' : '',
        extraClass
    ].filter(Boolean).join(' ');
    return `
        <button class="${escapeHtml(classes)}" type="button" ${actionAttr} ${attrs}>
            ${iconHtml || ''}
            <span>${escapeHtml(label || 'Action')}</span>
        </button>
    `;
}

export function renderInfoButton(key, label) {
    const safeLabel = label || key || 'widget';
    return `
        <button class="fin-info-button" type="button" data-fin-action="open-widget-info" data-widget-info-key="${escapeHtml(key)}" aria-label="Explain ${escapeHtml(safeLabel)}" title="Explain ${escapeHtml(safeLabel)}">
            ?
        </button>
    `;
}

export function renderWidgetHeader({ eyebrow = '', title = '', subtitle = '', actions = '' } = {}) {
    return `
        <div class="fin-widget-header">
            <div class="fin-widget-header-copy">
                ${eyebrow ? `<div class="fin-widget-eyebrow">${escapeHtml(eyebrow)}</div>` : ''}
                ${title ? `<div class="widget-title ui-title">${escapeHtml(title)}</div>` : ''}
                ${subtitle ? `<div class="fin-helper-text">${escapeHtml(subtitle)}</div>` : ''}
            </div>
            ${actions ? `<div class="fin-widget-header-actions">${actions}</div>` : ''}
        </div>
    `;
}

export function renderWidgetFooter(actions = '', { align = 'end' } = {}) {
    if (!actions) return '';
    return `<div class="fin-widget-footer fin-widget-footer--${escapeHtml(align)}">${actions}</div>`;
}

export function renderFinancialListRow({ title = '', meta = '', metaHtml = '', amount = '', amountClass = '', rightHtml = '', actionHtml = '', iconHtml = '', extraClass = '', attrs = '' } = {}) {
    return `
        <div class="fin-list-row ${escapeHtml(extraClass)}" ${attrs}>
            ${iconHtml ? `<div class="fin-list-row-icon">${iconHtml}</div>` : ''}
            <div class="fin-list-row-main">
                <div class="fin-list-row-title">${escapeHtml(title || 'Item')}</div>
                ${metaHtml ? `<div class="fin-list-row-meta">${metaHtml}</div>` : (meta ? `<div class="fin-list-row-meta">${escapeHtml(meta)}</div>` : '')}
            </div>
            ${(rightHtml || amount || actionHtml) ? `
                <div class="fin-list-row-right">
                    ${rightHtml || (amount ? `<div class="fin-list-row-amount ${escapeHtml(amountClass)}">${escapeHtml(amount)}</div>` : '')}
                    ${actionHtml ? `<div class="fin-list-row-action">${actionHtml}</div>` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

export function renderWidgetInfoPopover({ title = '', sections = [], formulaHtml = '', extraHtml = '' } = {}) {
    return `
        <div class="fin-info-popover-backdrop" data-fin-action="close-widget-info">
            <aside class="fin-info-popover" role="dialog" aria-modal="true" aria-label="${escapeHtml(title || 'Widget information')}">
                <div class="fin-info-popover-header">
                    <div>
                        <div class="fin-widget-eyebrow">Help layer</div>
                        <h3>${escapeHtml(title || 'Widget information')}</h3>
                    </div>
                    <button class="fin-info-popover-close" type="button" data-fin-action="close-widget-info" aria-label="Close information">&times;</button>
                </div>
                <div class="fin-info-popover-body">
                    ${sections.map((section) => `
                        <section class="fin-info-popover-section">
                            <h4>${escapeHtml(section.label || '')}</h4>
                            <p>${escapeHtml(section.body || '')}</p>
                        </section>
                    `).join('')}
                    ${formulaHtml ? `
                        <section class="fin-info-popover-section">
                            <h4>Formula</h4>
                            ${formulaHtml}
                        </section>
                    ` : ''}
                    ${extraHtml || ''}
                </div>
            </aside>
        </div>
    `;
}

export function renderSectionHeading(title, copy) {
    return `
        <section class="fin-section fin-section-heading">
            <div class="fin-page-header">
                <h2 class="fin-page-title">${escapeHtml(title)}</h2>
                <p class="fin-page-subtitle">${escapeHtml(copy)}</p>
            </div>
        </section>
    `;
}
