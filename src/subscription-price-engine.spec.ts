import { SubscriptionPriceEngine } from './subscription-price-engine';
import type { CurrencyRateSource } from './currency-rate-client';

describe('SubscriptionPriceEngine (лондонская школа: мок CurrencyRateSource)', () => {
  let engine: SubscriptionPriceEngine;

  beforeEach(() => {
    engine = new SubscriptionPriceEngine();
  });

  describe('setUsdToRubRate', () => {
    it('обновляет курс при валидном значении', () => {
      engine.setUsdToRubRate(100);
      expect(engine.getUsdToRub()).toBe(100);
    });

    it('отклоняет неположительный или нечисловой курс', () => {
      expect(() => engine.setUsdToRubRate(0)).toThrow(RangeError);
      expect(() => engine.setUsdToRubRate(-1)).toThrow(RangeError);
      expect(() => engine.setUsdToRubRate(Number.NaN)).toThrow(RangeError);
    });
  });

  describe('setVatPercent', () => {
    it('устанавливает НДС в допустимых пределах', () => {
      engine.setVatPercent(0);
      expect(engine.getVatPercent()).toBe(0);
      engine.setVatPercent(10);
      expect(engine.getVatPercent()).toBe(10);
    });

    it('отклоняет НДС вне 0–100', () => {
      expect(() => engine.setVatPercent(-0.1)).toThrow(RangeError);
      expect(() => engine.setVatPercent(101)).toThrow(RangeError);
    });
  });

  describe('resetToDefaults', () => {
    it('восстанавливает курс и НДС после мутаций', () => {
      engine.setUsdToRubRate(111);
      engine.setVatPercent(5);
      engine.resetToDefaults();
      expect(engine.getUsdToRub()).toBe(90);
      expect(engine.getVatPercent()).toBe(20);
    });
  });

  describe('monthlyAmountRub', () => {
    it('переводит net USD в RUB без НДС', () => {
      engine.setUsdToRubRate(10);
      expect(engine.monthlyAmountRub(5)).toBe(50);
    });

    it('добавляет НДС при withVat', () => {
      engine.setUsdToRubRate(100);
      engine.setVatPercent(20);
      expect(engine.monthlyAmountRub(1, { withVat: true })).toBe(120);
    });

    it('отклоняет отрицательную сумму в USD', () => {
      expect(() => engine.monthlyAmountRub(-1)).toThrow(RangeError);
    });
  });

  describe('yearlySavingsPercent', () => {
    it('возвращает 0 если год не дешевле 12 месяцев', () => {
      expect(engine.yearlySavingsPercent(10, 120)).toBe(0);
      expect(engine.yearlySavingsPercent(10, 130)).toBe(0);
    });

    it('считает процент экономии при выгодном годе', () => {
      expect(engine.yearlySavingsPercent(10, 100)).toBe(16.7);
    });

    it('возвращает 0 при нулевой месячной цене', () => {
      expect(engine.yearlySavingsPercent(0, 0)).toBe(0);
    });

    it('отклоняет отрицательные аргументы', () => {
      expect(() => engine.yearlySavingsPercent(-1, 100)).toThrow(RangeError);
      expect(() => engine.yearlySavingsPercent(10, -1)).toThrow(RangeError);
    });
  });

  describe('applyMinimumChargeRub', () => {
    it('поднимает сумму до минимума при необходимости', () => {
      expect(engine.applyMinimumChargeRub(50, 100)).toBe(100);
      expect(engine.applyMinimumChargeRub(200, 100)).toBe(200);
    });

    it('отклоняет отрицательные входы', () => {
      expect(() => engine.applyMinimumChargeRub(-1, 0)).toThrow(RangeError);
      expect(() => engine.applyMinimumChargeRub(0, -1)).toThrow(RangeError);
    });
  });

  describe('syncRateFromSource', () => {
    it('подставляет курс из мока и вызывает источник один раз', async () => {
      const fetchUsdRub = jest.fn(async () => 88.5);
      const source: CurrencyRateSource = { fetchUsdRub };

      await engine.syncRateFromSource(source);

      expect(fetchUsdRub).toHaveBeenCalledTimes(1);
      expect(engine.getUsdToRub()).toBe(88.5);
    });

    it('пробрасывает ошибку источника курса', async () => {
      const source: CurrencyRateSource = {
        fetchUsdRub: jest.fn(async () => {
          throw new Error('сеть недоступна');
        }),
      };

      await expect(engine.syncRateFromSource(source)).rejects.toThrow('сеть недоступна');
    });
  });
});
