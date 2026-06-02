import type { FinancePriceQuote, PriceProvider } from '../types/finance';

export class ManualPriceProvider implements PriceProvider {
  id = 'manual';

  async getQuotes(_symbols: string[], _currency: string): Promise<FinancePriceQuote[]> {
    return [];
  }
}

const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  USDC: 'usd-coin',
};

export class CoinGeckoPriceProvider implements PriceProvider {
  id = 'coingecko';

  async getQuotes(symbols: string[], currency: string): Promise<FinancePriceQuote[]> {
    const normalizedCurrency = currency.toLowerCase();
    const ids = [...new Set(symbols.map((symbol) => COINGECKO_IDS[symbol.toUpperCase()]).filter(Boolean))];
    if (!ids.length) return [];
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids.join(','))}&vs_currencies=${encodeURIComponent(normalizedCurrency)}`);
    if (!response.ok) throw new Error('CoinGecko price refresh is temporarily unavailable.');
    const data = await response.json() as Record<string, Record<string, number>>;
    const quotedAt = new Date().toISOString();
    return symbols.flatMap((symbol) => {
      const id = COINGECKO_IDS[symbol.toUpperCase()];
      const price = Number(data[id]?.[normalizedCurrency]);
      if (!Number.isFinite(price)) return [];
      return [{ symbol: symbol.toUpperCase(), currency: currency.toUpperCase(), price, source: this.id, quotedAt }];
    });
  }
}

export function createPriceProvider(source: FinanceUiSettings['walletPriceSource']): PriceProvider {
  return source === 'coingecko' ? new CoinGeckoPriceProvider() : new ManualPriceProvider();
}
