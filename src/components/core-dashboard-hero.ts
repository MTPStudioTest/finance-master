import { STORAGE_KEYS } from '../settings/storage-keys';

const COPY = {
  contextLabel: 'Local-first treasury',
  headline: 'Finance Observatory',
  subline: 'See what is real, what is reserved, what is due, and what needs a decision.',
  welcome: [
    'Welcome to the treasury cockpit.',
    'This space separates cash from commitments.',
    'You are not here to forecast perfectly.',
    'You are here to reduce anxiety enough to make the next real decision.',
  ],
  faq: [
    ['What is this space for?', 'To see available cash, reserves, obligations, runway, and review items.'],
    ['When should I come here?', 'Weekly, and before major spending, debt, tax, or project-income decisions.'],
    ['What should I focus on first?', 'Truly available cash, reserved money, overdue obligations, then runway.'],
    ['What if I ignore it for a while?', 'Return with one cash account or transaction; the Observatory will re-ground.'],
  ],
};

function escapeHtml(value: unknown): string {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHero(options: Record<string, unknown>): string {
  const signal = escapeHtml(options.signalText || 'Open');
  const tone = escapeHtml(options.signalTone || 'quiet');
  const icon = window.renderSAGIcon?.(String(options.signalIcon || 'attention'), { size: 'xs', tone: 'muted' }) || '';
  const open = localStorage.getItem(STORAGE_KEYS.heroDetails) === 'true';
  return `
    <section class="connection-ambient-header${options.compact ? ' connection-ambient-header--compact' : ''}">
      <div class="connection-ambient-inner">
        <div class="connection-kicker">${COPY.contextLabel}</div>
        <h1 class="connection-title">${COPY.headline}</h1>
        <p class="connection-dashboard-copy">${COPY.subline}</p>
        <div class="connection-hero-climate">
          <span class="connection-climate-pill climate-${tone}" aria-label="Finance signal: ${signal}">
            <span aria-hidden="true">${icon}</span><span>${signal}</span>
          </span>
        </div>
        <details class="connection-field-details" data-hero-details="true"${open ? ' open' : ''}>
          <summary class="ui-title">Details</summary>
          <div class="connection-dashboard-head">
            ${COPY.welcome.map((line) => `<p class="connection-dashboard-copy">${line}</p>`).join('')}
          </div>
          <div class="connection-dashboard-head">
            ${COPY.faq.map(([question, answer]) => `<p class="connection-dashboard-copy"><strong>${question}</strong><br><span>${answer}</span></p>`).join('')}
          </div>
        </details>
      </div>
    </section>
  `;
}

function bindDetailsPersistence(root: Element): void {
  const details = root.querySelector<HTMLDetailsElement>('[data-hero-details="true"]');
  if (!details || details.dataset.heroBound === '1') return;
  details.dataset.heroBound = '1';
  details.addEventListener('toggle', () => {
    localStorage.setItem(STORAGE_KEYS.heroDetails, details.open ? 'true' : 'false');
  });
}

window.CoreDashboardHero = {
  renderHero,
  bindDetailsPersistence,
};
