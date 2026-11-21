import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRuntimeConfig } from '../src/runtime-config.js';

test('remote support bot token overrides the local token', async () => {
  const originalFetch = global.fetch;
  global.fetch = async (_url, options) => {
    assert.equal(options.headers.Authorization, 'Bearer settings-secret');
    return { ok: true, json: async () => ({ data: { botToken: '123456789:remote-token-value-1234567890' } }) };
  };
  try {
    const result = await loadRuntimeConfig({
      botToken: 'local-token',
      settingsApiUrl: 'https://trxhi.com/api/settings/support-bot/runtime',
      settingsApiToken: 'settings-secret'
    });
    assert.equal(result.botToken, '123456789:remote-token-value-1234567890');
  } finally {
    global.fetch = originalFetch;
  }
});

test('local configuration remains available when remote settings are not configured', async () => {
  const config = { botToken: 'local-token', settingsApiUrl: '', settingsApiToken: '' };
  assert.equal(await loadRuntimeConfig(config), config);
});
