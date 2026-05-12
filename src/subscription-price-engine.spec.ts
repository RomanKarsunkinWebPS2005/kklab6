import { SubscriptionPriceEngine } from './subscription-price-engine';
import type { CurrencyRateSource } from './currency-rate-client';

describe('SubscriptionPriceEngine', () => {
  let engine: SubscriptionPriceEngine;

  beforeEach(() => {
    engine = new SubscriptionPriceEngine();
  });

  describe('setUsdToRubRate', () => {
    it('обновляет курс при валидном значении', () => {
      engine.setUsdToRubRate(100);
      expect(engine.getUsdToRub()).toBe(100);
    });

    it.each([
      [0],
      [-1],
      [Number.NaN],
    ])('отклоняет неположительный или нечисловой курс (%p)', (rate: number) => {
      expect(() => engine.setUsdToRubRate(rate)).toThrow(RangeError);
    });
  });

  describe('setVatPercent', () => {
    it.each([[0], [10]])('устанавливает допустимый НДС (%p%%)', (vat: number) => {
      engine.setVatPercent(vat);
      expect(engine.getVatPercent()).toBe(vat);
    });

    it.each([
      [-0.1],
      [101],
    ])('отклоняет НДС вне 0–100 (%p)', (vat: number) => {
      expect(() => engine.setVatPercent(vat)).toThrow(RangeError);
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
    it.each([
      [10, 120, 0],
      [10, 130, 0],
    ])('yearlySavingsPercent(%i, %i) возвращает %i', (monthlyUsd, annualUsd, expected) => {
      expect(engine.yearlySavingsPercent(monthlyUsd, annualUsd)).toBe(expected);
    });

    it('считает процент экономии при выгодном годе', () => {
      expect(engine.yearlySavingsPercent(10, 100)).toBe(16.7);
    });

    it('возвращает 0 при нулевой месячной цене', () => {
      expect(engine.yearlySavingsPercent(0, 0)).toBe(0);
    });

    it.each([
      [-1, 100],
      [10, -1],
    ])('отклоняет отрицательные аргументы (monthly=%i, annual=%i)', (monthlyUsd, annualUsd) => {
      expect(() => engine.yearlySavingsPercent(monthlyUsd, annualUsd)).toThrow(RangeError);
    });
  });

  describe('applyMinimumChargeRub', () => {
    it.each([
      [50, 100, 100],
      [200, 100, 200],
    ])('applyMinimumChargeRub(%i, %i) возвращает %i', (calculatedRub, minimumRub, expected) => {
      expect(engine.applyMinimumChargeRub(calculatedRub, minimumRub)).toBe(expected);
    });

    it.each([
      [-1, 0],
      [0, -1],
    ])('отклоняет отрицательные входы (calculated=%i, minimum=%i)', (calculatedRub, minimumRub) => {
      expect(() => engine.applyMinimumChargeRub(calculatedRub, minimumRub)).toThrow(RangeError);
    });
  });

  describe('syncRateFromSource', () => {
    describe('когда источник возвращает 88.5', () => {
      let fetchUsdRub: jest.MockedFunction<() => Promise<number>>;

      beforeEach(async () => {
        fetchUsdRub = jest.fn(async () => 88.5);
        const source: CurrencyRateSource = { fetchUsdRub };
        await engine.syncRateFromSource(source);
      });

      it('вызывает источник курса ровно один раз', () => {
        expect(fetchUsdRub).toHaveBeenCalledTimes(1);
      });

      it('устанавливает курс из ответа источника', () => {
        expect(engine.getUsdToRub()).toBe(88.5);
      });
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
