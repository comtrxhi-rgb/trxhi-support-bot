import 'dotenv/config';

function list(value = '') {
  return value.split(',').map(item => Number(item.trim())).filter(Number.isSafeInteger);
}

export const config = {
  botToken: process.env.BOT_TOKEN || '',
  supportGroupId: process.env.SUPPORT_GROUP_ID || '',
  adminIds: list(process.env.ADMIN_IDS),
  projectName: process.env.PROJECT_NAME || 'TRXHI',
  slogan: process.env.PROJECT_SLOGAN || '简单、快速、透明的 TRON 服务平台',
  websiteUrl: process.env.WEBSITE_URL || 'https://trxhi.com',
  description: process.env.PROJECT_DESCRIPTION ||
    'TRXHI 提供 TRON 能量租赁与相关链上服务，让用户以更低成本完成 TRC20 转账。'
};

export function validateConfig(value = config) {
  const errors = [];
  if (!value.botToken) errors.push('缺少 BOT_TOKEN');
  if (!value.supportGroupId) errors.push('缺少 SUPPORT_GROUP_ID');
  if (!value.adminIds.length) errors.push('缺少有效的 ADMIN_IDS');
  if (!/^https:\/\//.test(value.websiteUrl)) errors.push('WEBSITE_URL 必须使用 https://');
  return errors;
}
