import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const mbUrl = process.env.MOUNTEBANK_URL ?? 'http://localhost:2525';
const body = readFileSync(join(__dirname, '..', 'mountebank', 'currency-usd-rub-imposter.json'), 'utf8');

const res = await fetch(`${mbUrl}/imposters`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body,
});

const text = await res.text();
if (!res.ok) {
  console.error(res.status, text);
  process.exit(1);
}
console.log('Imposter создан:', text);
