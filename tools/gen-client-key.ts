import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const secret = readFileSync(path.resolve(__dirname, 'secret.txt'));
const hash = createHmac('sha256', secret)
  .update(Date.now.toString())
  .update(Math.random().toString())
  .digest('hex');
console.log(hash);
