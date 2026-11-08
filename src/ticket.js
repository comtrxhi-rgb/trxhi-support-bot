import { escapeHtml } from './content.js';

export function ticketHeader(user, text = '附件') {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || '未命名用户';
  const username = user.username ? `@${escapeHtml(user.username)}` : '无用户名';
  return [
    `🎫 <b>新客服消息</b> · <code>#${user.id}</code>`,
    `<b>用户：</b>${escapeHtml(name)}（${username}）`,
    `<b>用户 ID：</b><code>${user.id}</code>`,
    '',
    escapeHtml(text),
    '',
    '<i>客服请直接回复这条消息</i>',
    `<code>TRXHI_USER:${user.id}</code>`
  ].join('\n');
}

export function repliedUserId(message) {
  const replied = message?.reply_to_message;
  const source = replied?.text || replied?.caption || '';
  const match = source.match(/TRXHI_USER:(\d+)/);
  return match ? Number(match[1]) : null;
}
