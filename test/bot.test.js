import test from 'node:test';
import assert from 'node:assert/strict';
import { handleUpdate } from '../src/bot.js';
import { getConfig, validateConfig } from '../src/config.js';
import { repliedUserId, ticketHeader } from '../src/ticket.js';

const config = {
  ...getConfig({
    BOT_TOKEN: 'token',
    WEBHOOK_SECRET: 'secret',
    SUPPORT_GROUP_ID: '-1001',
    ADMIN_IDS: '42'
  })
};

function fakeTelegram() {
  const calls = [];
  return {
    calls,
    sendMessage(...args) { calls.push(['sendMessage', ...args]); },
    copyMessage(...args) { calls.push(['copyMessage', ...args]); }
  };
}

test('工单内容安全转义并能识别用户', () => {
  const text = ticketHeader({ id: 123, first_name: '<用户>', username: 'demo' }, '<b>问题</b>');
  assert.match(text, /&lt;用户&gt;/);
  assert.match(text, /&lt;b&gt;问题&lt;\/b&gt;/);
  assert.equal(repliedUserId({ reply_to_message: { text } }), 123);
});

test('配置检查给出缺失项', () => {
  const errors = validateConfig(getConfig({ WEBSITE_URL: 'http://example.com' }));
  assert.deepEqual(errors, [
    '缺少 BOT_TOKEN',
    '缺少 WEBHOOK_SECRET',
    '缺少 SUPPORT_GROUP_ID',
    '缺少有效的 ADMIN_IDS',
    'WEBSITE_URL 必须使用 https://'
  ]);
});

test('客户文字转发到客服群', async () => {
  const telegram = fakeTelegram();
  await handleUpdate({
    message: {
      message_id: 7,
      text: '需要帮助',
      chat: { id: 123, type: 'private' },
      from: { id: 123, first_name: '用户' }
    }
  }, telegram, config);
  assert.equal(telegram.calls.length, 2);
  assert.equal(telegram.calls[0][1], '-1001');
  assert.match(telegram.calls[0][2], /需要帮助/);
  assert.equal(telegram.calls[1][1], 123);
});

test('非管理员不能通过客服群回复用户', async () => {
  const telegram = fakeTelegram();
  await handleUpdate({
    message: {
      text: '假回复',
      chat: { id: -1001, type: 'group' },
      from: { id: 99 },
      reply_to_message: { text: 'TRXHI_USER:123' }
    }
  }, telegram, config);
  assert.equal(telegram.calls.length, 0);
});
