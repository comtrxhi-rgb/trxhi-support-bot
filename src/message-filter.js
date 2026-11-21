const MAX_TEXT_LENGTH = 3000;
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const WINDOW_MS = 60_000;
const MAX_MESSAGES_PER_WINDOW = 6;
const DUPLICATE_MS = 30_000;
const DANGEROUS_EXTENSIONS = new Set([
  'exe', 'msi', 'apk', 'dmg', 'pkg', 'bat', 'cmd', 'com', 'scr', 'ps1', 'sh'
]);

export function createMessageGuard(now = () => Date.now()) {
  const users = new Map();

  function checkRate(userId, fingerprint) {
    const timestamp = now();
    const state = users.get(userId) || { timestamps: [], fingerprint: '', duplicateAt: 0 };
    state.timestamps = state.timestamps.filter(value => timestamp - value < WINDOW_MS);
    if (state.timestamps.length >= MAX_MESSAGES_PER_WINDOW) {
      users.set(userId, state);
      return deny('发送过于频繁，请等待一分钟后再试。');
    }
    if (fingerprint && state.fingerprint === fingerprint && timestamp - state.duplicateAt < DUPLICATE_MS) {
      return deny('请勿重复发送相同内容，客服已能看到上一条消息。');
    }
    state.timestamps.push(timestamp);
    state.fingerprint = fingerprint;
    state.duplicateAt = timestamp;
    users.set(userId, state);
    return { allowed: true };
  }

  function text(userId, value) {
    const normalized = normalizeText(value);
    if (!normalized) return deny('消息内容为空，请直接描述你的问题。');
    if (normalized.length > MAX_TEXT_LENGTH) {
      return deny(`消息过长，请控制在 ${MAX_TEXT_LENGTH} 个字符以内并分段发送。`);
    }
    const rate = checkRate(userId, `text:${normalized}`);
    if (!rate.allowed) return rate;
    const redacted = redactSecrets(normalized);
    return {
      allowed: true,
      value: redacted.value,
      warning: redacted.changed
        ? '⚠️ 检测到疑似私钥或助记词，敏感内容已隐藏。请永远不要向任何人发送私钥或助记词。'
        : ''
    };
  }

  function media(userId, message) {
    const document = message?.document;
    const fileName = String(document?.file_name || '');
    const extension = fileName.includes('.') ? fileName.split('.').pop().toLowerCase() : '';
    if (extension && DANGEROUS_EXTENSIONS.has(extension)) {
      return deny('出于安全原因，不接受可执行文件或脚本。请发送截图、PDF 或纯文本说明。');
    }
    const size = Number(document?.file_size || message?.video?.file_size || message?.audio?.file_size || 0);
    if (size > MAX_FILE_SIZE) {
      return deny('附件超过 15 MB，请压缩图片或改用文字说明。');
    }
    return checkRate(userId, `media:${message?.file_unique_id || document?.file_unique_id || message?.message_id || ''}`);
  }

  return { text, media };
}

export function normalizeText(value) {
  return String(value || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n?/g, '\n')
    .trim();
}

export function redactSecrets(value) {
  let changed = false;
  let output = value.replace(/\b(?:0x)?[A-Fa-f0-9]{64}\b/g, () => {
    changed = true;
    return '[疑似私钥已隐藏]';
  });
  output = output.replace(/((?:助记词|恢复短语|seed phrase|recovery phrase)\s*[:：]\s*)([^\n]{20,})/gi, (_match, label) => {
    changed = true;
    return `${label}[敏感内容已隐藏]`;
  });
  return { value: output, changed };
}

function deny(message) {
  return { allowed: false, message: `🛡️ ${message}` };
}
