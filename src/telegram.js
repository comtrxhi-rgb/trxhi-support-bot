export class Telegram {
  constructor(token) {
    this.url = `https://api.telegram.org/bot${token}`;
  }

  async call(method, body) {
    const response = await fetch(`${this.url}/${method}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
    const result = await response.json();
    if (!result.ok) throw new Error(`Telegram ${method}: ${result.description}`);
    return result.result;
  }

  sendMessage(chatId, text, options = {}) {
    return this.call('sendMessage', { chat_id: chatId, text, ...options });
  }

  copyMessage(chatId, fromChatId, messageId) {
    return this.call('copyMessage', {
      chat_id: chatId,
      from_chat_id: fromChatId,
      message_id: messageId
    });
  }
}
