import { SubscriptionPriceEngine } from './subscription-price-engine';

const engine = new SubscriptionPriceEngine();
engine.setUsdToRubRate(100);
engine.setVatPercent(90);
console.log(engine.monthlyAmountRub(2, { withVat: true }));
