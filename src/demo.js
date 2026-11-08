import { config } from './config.js';
import { faqText, projectText, welcomeText } from './content.js';
import { ticketHeader } from './ticket.js';

const stripHtml = text => text.replace(/<[^>]+>/g, '');

console.log('════════ TRXHI 客服机器人演示 ════════\n');
console.log(stripHtml(welcomeText(config)));
console.log('\n菜单：\n🚀 项目介绍　🌐 访问官网\n❓ 常见问题　💬 联系人工客服');
console.log('\n── 点击：项目介绍 ──\n');
console.log(stripHtml(projectText(config)));
console.log('\n── 点击：常见问题 ──\n');
console.log(stripHtml(faqText));
console.log('\n── 客户发送：我付款后多久可以完成？ ──\n');
console.log(stripHtml(ticketHeader({ id: 123456, first_name: '演示用户', username: 'demo_user' }, '我付款后多久可以完成？')));
console.log('\n客服回复后，客户会在机器人私聊中收到消息。');
console.log(`\n官网：${config.websiteUrl}`);
