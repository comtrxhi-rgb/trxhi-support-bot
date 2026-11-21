import { Markup, Telegraf } from 'telegraf';
import { faqText, projectText, welcomeText, escapeHtml } from './content.js';
import { repliedUserId, ticketHeader } from './ticket.js';
import { createMessageGuard } from './message-filter.js';

const mediaTypes = ['photo', 'document', 'video', 'voice', 'audio', 'animation', 'sticker'];

export function createBot(config) {
  const bot = new Telegraf(config.botToken);
  const guard = createMessageGuard();

  const menu = () => Markup.keyboard([
    ['🚀 项目介绍', '🌐 访问官网'],
    ['❓ 常见问题', '💬 联系人工客服']
  ]).resize();

  bot.start(ctx => ctx.reply(welcomeText(config), { parse_mode: 'HTML', ...menu() }));
  bot.command('about', ctx => ctx.reply(projectText(config), { parse_mode: 'HTML' }));
  bot.command('faq', ctx => ctx.reply(faqText, { parse_mode: 'HTML' }));
  bot.command('website', ctx => showWebsite(ctx, config));
  bot.command('support', ctx => startSupport(ctx));
  bot.command('done', ctx => stopSupport(ctx, menu));

  bot.hears('🚀 项目介绍', ctx => ctx.reply(projectText(config), { parse_mode: 'HTML' }));
  bot.hears('🌐 访问官网', ctx => showWebsite(ctx, config));
  bot.hears('❓ 常见问题', ctx => ctx.reply(faqText, { parse_mode: 'HTML' }));
  bot.hears('💬 联系人工客服', ctx => startSupport(ctx));

  bot.on('text', async ctx => {
    if (isAdminReply(ctx, config)) return sendAdminText(ctx);
    if (ctx.chat.type !== 'private') return;
    const result = guard.text(ctx.from.id, ctx.message.text);
    if (!result.allowed) return ctx.reply(result.message);
    return sendCustomerText(ctx, config, result);
  });

  bot.on(mediaTypes, async ctx => {
    if (isAdminReply(ctx, config)) return sendAdminMedia(ctx);
    if (ctx.chat.type !== 'private') return;
    const result = guard.media(ctx.from.id, ctx.message);
    if (!result.allowed) return ctx.reply(result.message);
    return sendCustomerMedia(ctx, config);
  });

  bot.catch((error, ctx) => {
    console.error('[机器人错误]', error);
    return ctx.reply('系统暂时繁忙，请稍后再试。');
  });

  return bot;
}

function showWebsite(ctx, config) {
  return ctx.reply(`🌐 <b>${escapeHtml(config.projectName)} 官方网站</b>`, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([[Markup.button.url('立即访问官网', config.websiteUrl)]])
  });
}

function startSupport(ctx) {
  return ctx.reply('💬 请直接发送你的问题、图片或文件。\n\n你的下一条消息会自动转发给客服群。');
}

function stopSupport(ctx, menu) {
  return ctx.reply('✅ 本次咨询已结束，感谢你的联系。', menu());
}

async function sendCustomerText(ctx, config, filtered) {
  await ctx.telegram.sendMessage(config.supportGroupId, ticketHeader(ctx.from, filtered.value), { parse_mode: 'HTML' });
  const warning = filtered.warning ? `\n\n${filtered.warning}` : '';
  return ctx.reply(`✅ 消息已发送到客服群，客服会尽快回复。\n\n你可以继续直接发送消息。${warning}`);
}

async function sendCustomerMedia(ctx, config) {
  await ctx.telegram.sendMessage(config.supportGroupId, ticketHeader(ctx.from, ctx.message.caption || '用户发送了一个附件'), { parse_mode: 'HTML' });
  await ctx.telegram.copyMessage(config.supportGroupId, ctx.chat.id, ctx.message.message_id);
  return ctx.reply('✅ 附件已发送到客服群，客服会尽快回复。\n\n你可以继续直接发送消息。');
}

function isAdminReply(ctx, config) {
  return String(ctx.chat.id) === String(config.supportGroupId) &&
    config.adminIds.includes(ctx.from.id) && Boolean(repliedUserId(ctx.message));
}

async function sendAdminText(ctx) {
  const userId = repliedUserId(ctx.message);
  await ctx.telegram.sendMessage(userId, `💬 <b>客服回复</b>\n\n${escapeHtml(ctx.message.text)}`, { parse_mode: 'HTML' });
  return ctx.reply('✅ 已回复用户。');
}

async function sendAdminMedia(ctx) {
  const userId = repliedUserId(ctx.message);
  await ctx.telegram.copyMessage(userId, ctx.chat.id, ctx.message.message_id);
  return ctx.reply('✅ 已回复用户。');
}
