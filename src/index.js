import { handleUpdate } from './bot.js';
import { getConfig, validateConfig } from './config.js';
import { Telegram } from './telegram.js';

export default {
  async fetch(request, env, context) {
    if (request.method === 'GET') {
      return Response.json({ ok: true, service: 'trxhi-support-bot' });
    }
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const config = getConfig(env);
    const errors = validateConfig(config);
    if (errors.length) return Response.json({ ok: false, errors }, { status: 500 });

    const secret = request.headers.get('x-telegram-bot-api-secret-token');
    if (secret !== config.webhookSecret) return new Response('Unauthorized', { status: 401 });

    const update = await request.json();
    context.waitUntil(processUpdate(update, config));
    return Response.json({ ok: true });
  }
};

async function processUpdate(update, config) {
  try {
    await handleUpdate(update, new Telegram(config.botToken), config);
  } catch (error) {
    console.error('处理 Telegram 更新失败', error);
  }
}
