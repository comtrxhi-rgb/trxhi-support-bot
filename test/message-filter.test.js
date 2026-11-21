import test from 'node:test';
import assert from 'node:assert/strict';
import { createMessageGuard, normalizeText, redactSecrets } from '../src/message-filter.js';

test('normal customer messages pass after control characters are removed', () => {
  const guard = createMessageGuard(() => 1000);
  const result = guard.text(1, '  Order\u0000 123 needs help  ');
  assert.equal(result.allowed, true);
  assert.equal(result.value, 'Order 123 needs help');
  assert.equal(normalizeText('a\r\nb'), 'a\nb');
});

test('private keys and labeled recovery phrases are redacted', () => {
  const key = 'a'.repeat(64);
  const result = redactSecrets(`private key ${key}\n助记词: one two three four five six seven eight nine ten eleven twelve`);
  assert.equal(result.changed, true);
  assert.doesNotMatch(result.value, new RegExp(key));
  assert.match(result.value, /敏感内容已隐藏/);
});

test('duplicate messages and message floods are blocked', () => {
  let timestamp = 1000;
  const guard = createMessageGuard(() => timestamp);
  assert.equal(guard.text(7, 'help').allowed, true);
  assert.equal(guard.text(7, 'help').allowed, false);
  for (let index = 0; index < 5; index += 1) {
    timestamp += 1000;
    assert.equal(guard.text(7, `message ${index}`).allowed, true);
  }
  timestamp += 1000;
  assert.equal(guard.text(7, 'one too many').allowed, false);
});

test('dangerous and oversized attachments are blocked', () => {
  const guard = createMessageGuard(() => 1000);
  assert.equal(guard.media(1, { document: { file_name: 'payload.exe', file_size: 10 } }).allowed, false);
  assert.equal(guard.media(2, { document: { file_name: 'report.pdf', file_size: 16 * 1024 * 1024 } }).allowed, false);
  assert.equal(guard.media(3, { document: { file_name: 'report.pdf', file_size: 1024 }, message_id: 1 }).allowed, true);
});
