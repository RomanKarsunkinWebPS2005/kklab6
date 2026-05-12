import { CurrencyRateClient } from './currency-rate-client';

describe('CurrencyRateClient', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('возвращает rate из JSON ответа API', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rate: 99.1 }),
    } as unknown as Response);

    const client = new CurrencyRateClient('http://mock.local');
    await expect(client.fetchUsdRub()).resolves.toBe(99.1);
    expect(global.fetch).toHaveBeenCalledWith('http://mock.local/rates/usd-rub', { method: 'GET' });
  });

  it('бросает при HTTP ошибке', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
    } as unknown as Response);

    const client = new CurrencyRateClient('http://mock.local');
    await expect(client.fetchUsdRub()).rejects.toThrow('HTTP 503');
  });

  it('бросает при некорректном теле ответа', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rate: 'bad' }),
    } as unknown as Response);

    const client = new CurrencyRateClient('http://mock.local');
    await expect(client.fetchUsdRub()).rejects.toThrow('Некорректное поле rate');
  });
});
