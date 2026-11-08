import { createBot } from './bot.js';
import { config, validateConfig } from './config.js';

const errors = validateConfig(config);
if (errors.length) {
  console.error(`配置不完整：${errors.join('、')}。\n首次体验请运行：npm run demo`);
  process.exit(1);
}

const bot = createBot(config);
await bot.telegram.setMyCommands([
  { command: 'start', description: '打开主菜单' },
  { command: 'about', description: '了解项目' },
  { command: 'website', description: '访问官网' },
  { command: 'faq', description: '常见问题' },
  { command: 'support', description: '联系人工客服' },
  { command: 'done', description: '结束客服咨询' }
]);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
await bot.launch();
console.log(`${config.projectName} 中文客服机器人已启动。`);
