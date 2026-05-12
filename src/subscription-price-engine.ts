import type { CurrencyRateSource } from './currency-rate-client';

export class SubscriptionPriceEngine {
  private usdToRub = 90;
  private vatPercent = 20;

  getUsdToRub(): number {
    return this.usdToRub;
  }

  getVatPercent(): number {
    return this.vatPercent;
  }

  setUsdToRubRate(rate: number): void {
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new RangeError('Курс USD/RUB должен быть положительным числом');
    }
    this.usdToRub = rate;
  }

  setVatPercent(percent: number): void {
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      throw new RangeError('НДС должен быть в диапазоне 0–100');
    }
    this.vatPercent = percent;
  }

  /** Сброс мутабельного состояния к значениям по умолчанию. */
  resetToDefaults(): void {
    this.usdToRub = 90;
    this.vatPercent = 20;
  }

  monthlyAmountRub(netUsdMonthly: number, options?: { withVat?: boolean }): number {
    if (!Number.isFinite(netUsdMonthly) || netUsdMonthly < 0) {
      throw new RangeError('Сумма в USD не может быть отрицательной');
    }
    const rub = netUsdMonthly * this.usdToRub;
    if (options?.withVat) {
      return rub * (1 + this.vatPercent / 100);
    }
    return rub;
  }

  /**
   * Экономия при годовой оплате относительно 12 месяцев по месячной цене (0–100%).
   */
  yearlySavingsPercent(monthlyUsd: number, annualUsd: number): number {
    if (!Number.isFinite(monthlyUsd) || monthlyUsd < 0) {
      throw new RangeError('monthlyUsd не может быть отрицательным');
    }
    if (!Number.isFinite(annualUsd) || annualUsd < 0) {
      throw new RangeError('annualUsd не может быть отрицательным');
    }
    const full = monthlyUsd * 12;
    if (full <= 0) {
      return 0;
    }
    if (annualUsd >= full) {
      return 0;
    }
    return Math.round(((full - annualUsd) / full) * 1000) / 10;
  }

  /** Итог в рублях с «полом» минимальной суммы. */
  applyMinimumChargeRub(calculatedRub: number, minimumRub: number): number {
    if (!Number.isFinite(calculatedRub) || calculatedRub < 0) {
      throw new RangeError('calculatedRub не может быть отрицательным');
    }
    if (!Number.isFinite(minimumRub) || minimumRub < 0) {
      throw new RangeError('minimumRub не может быть отрицательным');
    }
    return Math.max(calculatedRub, minimumRub);
  }

  /** Мутация курса из внешнего источника */
  async syncRateFromSource(source: CurrencyRateSource): Promise<void> {
    const rate = await source.fetchUsdRub();
    this.setUsdToRubRate(rate);
  }
}
