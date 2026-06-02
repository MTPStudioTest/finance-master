import { STORAGE_KEYS } from '../settings/storage-keys';

const COPY = {
  contextLabel: 'Material Ground',
  headline: 'Finance',
  subline: 'Where reality becomes clear and supportive.',
  welcome: [
    'Welcome to material ground.',
    'This space turns numbers into steadier footing.',
    'You are not here to panic or predict perfectly.',
    'Clarity, even when incomplete, is already support.',
  ],
  faq: [
    ['What is this space for?', 'To see financial reality and choose calm next steps.'],
    ['When should I come here?', 'Weekly, and before major spending or commitments.'],
    ['What should I focus on first?', 'Review Real Balance and Runway, then Tension Signals.'],
    ['What if I ignore it for a while?', 'Return with one ledger event; the view will re-stabilize.'],
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
