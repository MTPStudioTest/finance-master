export function resolveCurrencyCode(explicitCurrency, baseCurrency = 'EUR') {
  const explicit = String(explicitCurrency || '').trim().toUpperCase();
  if (explicit) return explicit;
  const base = String(baseCurrency || '').trim().toUpperCase();
  return base || 'EUR';
}

export function formatCurrencyAmount(amount, options = {}) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '—';
  const currency = resolveCurrencyCode(options.currency, options.baseCurrency);
  return new Intl.NumberFormat(options.locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
