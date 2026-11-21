export async function loadRuntimeConfig(baseConfig, { required = false } = {}) {
  if (!baseConfig.settingsApiUrl || !baseConfig.settingsApiToken) {
    if (required) throw new Error('缺少 SETTINGS_API_URL 或 SETTINGS_API_TOKEN');
    return baseConfig;
  }

  const response = await fetch(baseConfig.settingsApiUrl, {
    headers: { Authorization: `Bearer ${baseConfig.settingsApiToken}` },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error(`远程设置请求失败：HTTP ${response.status}`);
  const payload = await response.json();
  const botToken = String(payload?.data?.botToken || '').trim();
  return botToken ? { ...baseConfig, botToken } : baseConfig;
}

export function watchRuntimeToken(config, activeToken) {
  if (!config.settingsApiUrl || !config.settingsApiToken) return null;
  const intervalMs = Number.isFinite(config.settingsPollMs)
    ? Math.max(15000, config.settingsPollMs)
    : 60000;
  const timer = setInterval(async () => {
    try {
      const latest = await loadRuntimeConfig(config);
      if (latest.botToken && latest.botToken !== activeToken) {
        console.log('检测到客服机器人 Token 更新，正在安全重启。');
        process.exit(0);
      }
    } catch (error) {
      console.warn(`读取客服机器人远程设置失败：${error.message}`);
    }
  }, intervalMs);
  timer.unref();
  return timer;
}
