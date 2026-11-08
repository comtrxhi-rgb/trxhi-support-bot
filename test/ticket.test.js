import test from 'node:test';
import assert from 'node:assert/strict';
import { ticketHeader, repliedUserId } from '../src/ticket.js';
import { validateConfig } from '../src/config.js';

test('工单内容安全转义并能识别用户', () => {
  const text = ticketHeader({ id: 123, first_name: '<用户>', username: 'demo' }, '<b>问题</b>');
  assert.match(text, /&lt;用户&gt;/);
  assert.match(text, /&lt;b&gt;问题&lt;\/b&gt;/);
  assert.equal(repliedUserId({ reply_to_message: { text } }), 123);
});

test('配置检查给出中文缺失项', () => {
  const errors = validateConfig({ botToken: '', supportGroupId: '', adminIds: [], websiteUrl: 'http://example.com' });
  assert.deepEqual(errors, ['缺少 BOT_TOKEN', '缺少 SUPPORT_GROUP_ID', '缺少有效的 ADMIN_IDS', 'WEBSITE_URL 必须使用 https://']);
});
