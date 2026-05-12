## Тестлист

| ID | Модуль / файл | Название теста (it) | Предусловия | Действие | Ожидаемый результат |
|----|----------------|---------------------|-------------|----------|---------------------|
| PE-01 | `subscription-price-engine.spec` | обновляет курс при валидном значении | Новый `SubscriptionPriceEngine` | `setUsdToRubRate(100)` | `getUsdToRub() === 100` |
| PE-02 | то же | отклоняет неположительный или нечисловой курс | Новый engine | `setUsdToRubRate(0)`, `-1`, `NaN` | `RangeError` |
| PE-03 | то же | устанавливает НДС в допустимых пределах | Новый engine | `setVatPercent(0)` затем `setVatPercent(10)` | `0`, затем `10` |
| PE-04 | то же | отклоняет НДС вне 0–100 | Новый engine | `setVatPercent(-0.1)`, `setVatPercent(101)` | `RangeError` |
| PE-05 | то же | восстанавливает курс и НДС после мутаций | Курс и НДС изменены | `resetToDefaults()` | курс `90`, НДС `20` |
| PE-06 | то же | переводит net USD в RUB без НДС | `setUsdToRubRate(10)` | `monthlyAmountRub(5)` | `50` |
| PE-07 | то же | добавляет НДС при withVat | курс `100`, НДС `20%` | `monthlyAmountRub(1, { withVat: true })` | `120` |
| PE-08 | то же | отклоняет отрицательную сумму в USD | По умолчанию | `monthlyAmountRub(-1)` | `RangeError` |
| PE-09 | то же | возвращает 0 если год не дешевле 12 месяцев | По умолчанию | `yearlySavingsPercent(10, 120)`, `(10, 130)` | `0`, `0` |
| PE-10 | то же | считает процент экономии при выгодном годе | По умолчанию | `yearlySavingsPercent(10, 100)` | `16.7` |
| PE-11 | то же | возвращает 0 при нулевой месячной цене | По умолчанию | `yearlySavingsPercent(0, 0)` | `0` |
| PE-12 | то же | отклоняет отрицательные аргументы | По умолчанию | отрицательный `monthlyUsd` или `annualUsd` | `RangeError` |
| PE-13 | то же | поднимает сумму до минимума при необходимости | По умолчанию | `applyMinimumChargeRub(50, 100)`, `(200, 100)` | `100`, `200` |
| PE-14 | то же | отклоняет отрицательные входы | По умолчанию | отрицательный `calculatedRub` или `minimumRub` | `RangeError` |
| PE-15 | то же | подставляет курс из мока и вызывает источник один раз | Мок `fetchUsdRub` → `88.5` | `syncRateFromSource(source)` | вызов `fetchUsdRub` ровно 1 раз; `getUsdToRub() === 88.5` |
| PE-16 | то же | пробрасывает ошибку источника курса | Мок бросает `Error` | `syncRateFromSource(source)` | Promise rejects с тем же сообщением |
| CR-01 | `currency-rate-client.spec` | возвращает rate из JSON ответа API | `fetch` — мок успешного JSON | `fetchUsdRub()` | `99.1`; `fetch` вызван с `…/rates/usd-rub`, GET |
| CR-02 | то же | бросает при HTTP ошибке | `fetch` — `ok: false`, статус 503 | `fetchUsdRub()` | ошибка с текстом про HTTP 503 |
| CR-03 | то же | бросает при некорректном теле ответа | JSON с `rate: 'bad'` | `fetchUsdRub()` | ошибка про некорректное поле `rate` |

---
