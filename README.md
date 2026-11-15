# TRXHI 中文客服机器人

一个只运行在 Cloudflare Workers 上的简洁中文 Telegram 客服机器人。它使用 Telegram Webhook，不需要服务器、Docker、数据库或常驻进程。

## 功能

- 中文菜单：项目介绍、官网、常见问题、人工客服
- 将客户文字、图片和文件转发到客服群
- 客服直接回复工单，机器人把内容送回客户私聊
- 无数据库、无用户资料存储
- 使用 Webhook 密钥验证 Telegram 请求
- 可由 Cloudflare 免费套餐运行

## 准备

你需要：

- 一个 Cloudflare 账号
- Node.js 20 或更高版本
- 通过 `@BotFather` 创建的 Telegram Bot Token
- 客服群 ID（通常以 `-100` 开头）
- 可以回复客户的客服人员 Telegram 数字 ID

把机器人加入客服群。若要回复图片和文件，建议将机器人设为群管理员。

## 部署

```bash
npm install
npx wrangler login
npm run deploy
```

部署完成后，Wrangler 会显示 Worker 地址，例如：

```text
https://trxhi-support-bot.<你的子域名>.workers.dev
```

设置运行配置。`WEBHOOK_SECRET` 请使用一段随机字符串，只能包含英文字母、数字、下划线和连字符。

```bash
npx wrangler secret put BOT_TOKEN
npx wrangler secret put WEBHOOK_SECRET
npx wrangler secret put SUPPORT_GROUP_ID
npx wrangler secret put ADMIN_IDS
```

`ADMIN_IDS` 支持多个 ID，用英文逗号分隔，例如 `123456789,987654321`。

可选的项目资料也可以通过 Worker 变量设置：

- `PROJECT_NAME`
- `PROJECT_SLOGAN`
- `WEBSITE_URL`（必须是 HTTPS）
- `PROJECT_DESCRIPTION`

最后注册 Telegram Webhook。替换以下三个值：

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"<WORKER_URL>","secret_token":"<WEBHOOK_SECRET>","allowed_updates":["message"]}'
```

返回 `{"ok":true,...}` 后，向机器人发送 `/start` 即可测试。

## 客服使用方法

1. 客户发送问题、图片或文件。
2. 客服群收到带有客户 ID 的工单。
3. 客服必须直接回复带有“新客服消息”的工单。
4. 机器人将客服的文字或附件发送给客户。

只有 `ADMIN_IDS` 中的人员可以通过客服群回复客户。

## 本地检查

```bash
npm run check
npm test
```

本地运行 Worker 时，将变量写入不提交 Git 的 `.dev.vars`：

```env
BOT_TOKEN=你的机器人Token
WEBHOOK_SECRET=本地测试密钥
SUPPORT_GROUP_ID=-1001234567890
ADMIN_IDS=123456789
```

然后运行 `npm run dev`。

## 更新

修改代码后重新运行：

```bash
npm run deploy
```

Worker 地址不变，无需重新注册 Webhook。

## 安全

- 不要将 Token、Webhook 密钥或 `.dev.vars` 提交到 GitHub。
- 不要要求客户发送密码、私钥或助记词。
- 定期检查 Cloudflare 日志，并及时移除不再任职的客服 ID。

## 开源协议

[MIT](LICENSE)
