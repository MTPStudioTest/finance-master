export function resolveCurrencyCode(explicitCurrency?: unknown, baseCurrency?: unknown): string;

export function formatCurrencyAmount(amount: unknown, options?: {
  currency?: unknown;
  baseCurrency?: unknown;
  locale?: string | string[];
}): string;
