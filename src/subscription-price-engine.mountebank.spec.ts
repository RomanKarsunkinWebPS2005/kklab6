import { CurrencyRateClient } from './currency-rate-client';
import { SubscriptionPriceEngine } from './subscription-price-engine';

const serviceBaseUrl = process.env.CURRENCY_MOCK_URL ?? 'http://localhost:4545';

async function mockServiceOk(): Promise<boolean> {
  try {
    const url = new URL('/rates/usd-rub', serviceBaseUrl).toString();
    const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

describe('SubscriptionPriceEngine с Mountebank', () => {
  beforeAll(async () => {
    const ok = await mockServiceOk();
    if (!ok) {
      throw new Error(
        `Mock недоступен по ${serviceBaseUrl}.`,
      );
    }
  });

  it('syncRateFromSource обновляет курс через imposter', async () => {
    const engine = new SubscriptionPriceEngine();
    const client = new CurrencyRateClient(serviceBaseUrl);

    await engine.syncRateFromSource(client);

    expect(engine.getUsdToRub()).toBe(93.35);
  });

  it('после синка с Mountebank конвертирует net USD в RUB', async () => {
    const engine = new SubscriptionPriceEngine();
    const client = new CurrencyRateClient(serviceBaseUrl);

    await engine.syncRateFromSource(client);

    expect(engine.monthlyAmountRub(10)).toBe(933.5);
  });

  it('после синка с Mountebank добавляет НДС к сумме в рублях при withVat', async () => {
    const engine = new SubscriptionPriceEngine();
    const client = new CurrencyRateClient(serviceBaseUrl);

    await engine.syncRateFromSource(client);

    expect(engine.monthlyAmountRub(10, { withVat: true })).toBe(1120.2);
  });
});
