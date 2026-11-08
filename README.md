# TRXHI 中文客服机器人

一个独立、简洁、全中文的 Telegram 项目介绍与人工客服机器人。适合开源后让其他项目快速修改使用，也可以作为 [TRXHI 官网](https://trxhi.com) 的 Telegram 入口。

## 功能

- 中文主菜单：项目介绍、访问官网、常见问题、人工客服
- 用户消息转发到客服群，客服直接回复工单即可回答用户
- 支持文字、图片、文件、视频、语音和贴纸
- 项目名称、介绍、口号和官网均通过 `.env` 修改
- 自带演示模式，无需 Token 即可预览
- 无数据库、无后台面板，部署和维护简单

## 先看演示

需要 Node.js 20 或更高版本：

```bash
npm install
npm run demo
```

## 五分钟启动

1. 在 Telegram 联系 `@BotFather`，执行 `/newbot` 创建机器人并取得 Token。
2. 新建一个客服群，把机器人加入群组。
3. 在群内临时加入 `@RawDataBot` 等 ID 查询机器人，取得以 `-100` 开头的群组 ID，随后可将查询机器人移除。
4. 取得客服人员的 Telegram 数字 ID。
5. 创建配置并启动：

```bash
cp .env.example .env
npm install
npm start
```

编辑 `.env`：

```env
BOT_TOKEN=123456:你的Token
SUPPORT_GROUP_ID=-1001234567890
ADMIN_IDS=123456789,987654321

PROJECT_NAME=TRXHI
PROJECT_SLOGAN=简单、快速、透明的 TRON 服务平台
WEBSITE_URL=https://trxhi.com
PROJECT_DESCRIPTION=TRXHI 提供 TRON 能量租赁与相关链上服务，让用户以更低成本完成 TRC20 转账。
```

## 客服如何使用

1. 用户点击“💬 联系人工客服”。
2. 用户发送问题、截图或文件。
3. 客服群收到带有用户资料的工单。
4. `ADMIN_IDS` 中的客服人员直接回复该工单消息。
5. 机器人把回复发送到用户私聊。
6. 用户发送 `/done` 结束咨询。

为了正确识别用户，客服必须回复带有“新客服消息”的工单，不要回复后面单独复制的附件。

## Docker 部署

```bash
cp .env.example .env
docker compose up -d --build
```

## 自定义

普通项目只需要修改 `.env`。如需调整菜单、介绍或常见问题，可编辑：

- `src/content.js`：项目介绍和常见问题
- `src/bot.js`：菜单及客服流程
- `.env`：项目名称、官网和客服配置

## 安全说明

- 不要提交 `.env` 或机器人 Token。
- 只有 `ADMIN_IDS` 中的人员能够通过客服群回复用户。
- 本项目不收集密码、私钥或助记词。请在客服规范中提醒用户不要发送这些信息。

## 测试

```bash
npm run check
npm test
```

## 开源协议

[MIT](LICENSE) —— 可以自由使用、修改和发布，请保留版权与许可证声明。
