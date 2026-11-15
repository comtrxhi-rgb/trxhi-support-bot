import { faqText, projectText, welcomeText, escapeHtml } from './content.js';
import { repliedUserId, ticketHeader } from './ticket.js';

const menu = {
  keyboard: [
    ['🚀 项目介绍', '🌐 访问官网'],
    ['❓ 常见问题', '💬 联系人工客服']
  ],
  resize_keyboard: true
};

export async function handleUpdate(update, telegram, config) {
  const message = update.message;
  if (!message?.from || !message.chat) return;

  const userId = repliedUserId(message);
  if (userId && isAdmin(message, config)) return replyToCustomer(message, userId, telegram);
  if (message.chat.type !== 'private') return;

  const text = message.text;
  if (text === '/start') return sendWelcome(message.chat.id, telegram, config);
  if (text === '/about' || text === '🚀 项目介绍') {
    return telegram.sendMessage(message.chat.id, projectText(config), { parse_mode: 'HTML' });
  }
  if (text === '/faq' || text === '❓ 常见问题') {
    return telegram.sendMessage(message.chat.id, faqText, { parse_mode: 'HTML' });
  }
  if (text === '/website' || text === '🌐 访问官网') return sendWebsite(message.chat.id, telegram, config);
  if (text === '/support' || text === '💬 联系人工客服') {
    return telegram.sendMessage(message.chat.id, '💬 请直接发送你的问题、图片或文件，客服会尽快回复。');
  }

  return forwardToSupport(message, telegram, config);
}

function isAdmin(message, config) {
  return String(message.chat.id) === String(config.supportGroupId) &&
    config.adminIds.includes(message.from.id);
}

function sendWelcome(chatId, telegram, config) {
  return telegram.sendMessage(chatId, welcomeText(config), {
    parse_mode: 'HTML',
    reply_markup: menu
  });
}

function sendWebsite(chatId, telegram, config) {
  return telegram.sendMessage(chatId, `🌐 <b>${escapeHtml(config.projectName)} 官方网站</b>`, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [[{ text: '立即访问官网', url: config.websiteUrl }]]
    }
  });
}

async function forwardToSupport(message, telegram, config) {
  await telegram.sendMessage(
    config.supportGroupId,
    ticketHeader(message.from, message.text || message.caption || '用户发送了一个附件'),
    { parse_mode: 'HTML' }
  );
  if (!message.text) {
    await telegram.copyMessage(config.supportGroupId, message.chat.id, message.message_id);
  }
  return telegram.sendMessage(message.chat.id, '✅ 消息已发送，客服会尽快回复。');
}

async function replyToCustomer(message, userId, telegram) {
  if (message.text) {
    await telegram.sendMessage(userId, `💬 <b>客服回复</b>\n\n${escapeHtml(message.text)}`, {
      parse_mode: 'HTML'
    });
  } else {
    await telegram.copyMessage(userId, message.chat.id, message.message_id);
  }
  return telegram.sendMessage(message.chat.id, '✅ 已回复用户。');
}
