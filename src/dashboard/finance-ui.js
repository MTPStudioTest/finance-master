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
