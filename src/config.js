function numberList(value = '') {
  return String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .map(Number)
    .filter(Number.isSafeInteger);
}

export function getConfig(env = {}) {
  return {
    botToken: env.BOT_TOKEN || '',
    webhookSecret: env.WEBHOOK_SECRET || '',
    supportGroupId: env.SUPPORT_GROUP_ID || '',
    adminIds: numberList(env.ADMIN_IDS),
    projectName: env.PROJECT_NAME || 'TRXHI',
    slogan: env.PROJECT_SLOGAN || '简单、快速、透明的 TRON 服务平台',
    websiteUrl: env.WEBSITE_URL || 'https://trxhi.com',
    description: env.PROJECT_DESCRIPTION ||
      'TRXHI 提供 TRON 能量租赁与相关链上服务，让用户以更低成本完成 TRC20 转账。'
  };
}

export function validateConfig(config) {
  const errors = [];
  if (!config.botToken) errors.push('缺少 BOT_TOKEN');
  if (!config.webhookSecret) errors.push('缺少 WEBHOOK_SECRET');
  if (!config.supportGroupId) errors.push('缺少 SUPPORT_GROUP_ID');
  if (!config.adminIds.length) errors.push('缺少有效的 ADMIN_IDS');
  if (!/^https:\/\//.test(config.websiteUrl)) errors.push('WEBSITE_URL 必须使用 https://');
  return errors;
}
