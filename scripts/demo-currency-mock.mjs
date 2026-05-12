/**
 * Демонстрация MOCK курса валют через Mountebank (без реального внешнего API).
 *
 * 1) Установите mountebank глобально: npm i -g mountebank
 * 2) Запустите: mb
 * 3) Поднимите imposter: curl -i -X POST http://localhost:2525/imposters -H "Content-Type: application/json" -d @mountebank/currency-usd-rub-imposter.json
 *    (в PowerShell можно: Invoke-RestMethod ...)
 * 4) Запустите: npm run demo:currency-mock
 */

const baseUrl = process.env.CURRENCY_MOCK_URL ?? 'http://localhost:4545';

const res = await fetch(new URL('/rates/usd-rub', baseUrl).toString(), { method: 'GET' });
if (!res.ok) {
  console.error(`Ошибка HTTP ${res.status}.`);
  process.exit(1);
}
const json = await res.json();
console.log('Ответ MOCK API курса:', json);
console.log('Курс USD/RUB для приложения:', json.rate);
