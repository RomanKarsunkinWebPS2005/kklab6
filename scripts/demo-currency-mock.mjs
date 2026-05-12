const baseUrl = process.env.CURRENCY_MOCK_URL ?? 'http://localhost:4545';

const res = await fetch(new URL('/rates/usd-rub', baseUrl).toString(), { method: 'GET' });
if (!res.ok) {
  console.error(`Ошибка HTTP ${res.status}.`);
  process.exit(1);
}
const json = await res.json();
console.log('Ответ MOCK API курса:', json);
console.log('Курс USD/RUB для приложения:', json.rate);
