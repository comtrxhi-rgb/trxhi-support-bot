export function welcomeText(config) {
  return [
    `👋 欢迎来到 <b>${escapeHtml(config.projectName)}</b>`,
    '',
    escapeHtml(config.slogan),
    '',
    '你可以了解项目、查看常见问题，或直接联系人工客服。'
  ].join('\n');
}

export function projectText(config) {
  return [
    `🚀 <b>关于 ${escapeHtml(config.projectName)}</b>`,
    '',
    escapeHtml(config.description),
    '',
    '我们的目标：流程简单、价格透明、服务可靠。'
  ].join('\n');
}

export const faqText = [
  '❓ <b>常见问题</b>',
  '',
  '<b>1. TRXHI 是什么？</b>',
  '面向 TRON 用户的能量租赁与链上服务平台。',
  '',
  '<b>2. 如何使用？</b>',
  '点击“访问官网”，按照页面提示选择服务并完成操作。',
  '',
  '<b>3. 遇到问题怎么办？</b>',
  '点击“联系人工客服”，直接发送问题或截图。',
  '',
  '<b>4. 如何确认官方网站？</b>',
  '请只通过机器人内的“访问官网”按钮进入。'
].join('\n');

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
