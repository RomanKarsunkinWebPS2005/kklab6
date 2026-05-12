export interface CurrencyRateSource {
  fetchUsdRub(): Promise<number>;
}

export class CurrencyRateClient implements CurrencyRateSource {
  constructor(private readonly baseUrl: string) {}

  async fetchUsdRub(): Promise<number> {
    const url = new URL('/rates/usd-rub', this.baseUrl).toString();
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
      throw new Error(`Курс недоступен: HTTP ${res.status}`);
    }
    const data = (await res.json()) as { rate?: number };
    if (typeof data.rate !== 'number' || !Number.isFinite(data.rate) || data.rate <= 0) {
      throw new Error('Некорректное поле rate в ответе');
    }
    return data.rate;
  }
}
