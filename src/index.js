import { createBot } from './bot.js';
import { config, validateConfig } from './config.js';

const errors = validateConfig(config);
if (errors.length) {
  console.error(`配置不完整：${errors.join('、')}。\n首次体验请运行：npm run demo`);
  process.exit(1);
}

const bot = createBot(config);
const commands = [
  { command: 'start', description: '打开主菜单' },
  { command: 'about', description: '了解项目' },
  { command: 'website', description: '访问官网' },
  { command: 'faq', description: '常见问题' },
  { command: 'support', description: '联系人工客服' },
  { command: 'done', description: '结束客服咨询' }
];

async function withRetry(label, task, attempts = 6) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      const delayMs = Math.min(3000 * attempt, 15000);
      console.warn(`${label}失败（${attempt}/${attempts}），${delayMs / 1000} 秒后重试。`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

await withRetry('同步 Telegram 命令', () => bot.telegram.setMyCommands(commands));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
await withRetry('启动 Telegram 机器人', () => bot.launch());
console.log(`${config.projectName} 中文客服机器人已启动。`);
