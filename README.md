# Tavern MVP

中世纪酒馆主题的 Web MVP（Next.js + Supabase）。

## 1. 项目简介

这个项目目前实现了一个可交互的“酒馆入口 + 大厅分区”体验，并包含两块核心功能：

- **吧台实时聊天**（chat）
- **公告板留言**（board）

目标是先验证玩法和视觉体验，再逐步完善账号体系、权限和内容模块。

---

## 2. 技术栈

- **框架**: Next.js 16（App Router）
- **语言**: TypeScript
- **样式**: 全局 CSS（含酒馆主题场景样式）
- **数据层**: Supabase（Postgres + Realtime）

---

## 3. 目录结构

```text
tavern-mvp/
├─ public/
│  ├─ images/
│  │  └─ README.txt                # 背景图命名规范
│  └─ ...
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                  # 首页（开门动画）
│  │  └─ tavern/
│  │     ├─ page.tsx               # 酒馆大厅（区域入口）
│  │     ├─ chat/page.tsx          # 吧台实时聊天
│  │     └─ board/page.tsx         # 公告板
│  └─ lib/
│     └─ supabase.ts               # Supabase client 初始化
├─ supabase-schema.sql             # 数据库初始化 SQL
├─ .env.example                    # 环境变量模板
└─ README.md
```

---

## 4. 当前功能状态

### 已完成
- 首页进入酒馆动画与页面跳转
- 酒馆大厅分区入口（吧台、公告板、预留区）
- 聊天消息读取、发送、实时更新（去重）
- 公告板发帖与列表展示
- Supabase 表结构与 RLS 策略 SQL

### 待完善
- TypeScript 构建报错修复（`board/page.tsx` 对 `supabase` 可空判断）
- 背景图资源补齐
- README/部署文档完善（本次已补齐）
- 安全策略收敛（当前 RLS 为 MVP 阶段的公开读写）
- 账号系统、鉴权、内容审核等

详细计划见 `docs/ROADMAP.md`。

---

## 5. 本地开发

### 5.1 安装依赖

```bash
npm install
```

### 5.2 配置环境变量

复制模板并填写：

```bash
cp .env.example .env.local
```

`.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名公钥
```

### 5.3 初始化数据库

在 Supabase SQL Editor 执行：

- `supabase-schema.sql`

### 5.4 启动开发环境

```bash
npm run dev
```

浏览器打开 `http://localhost:3000`。

---

## 6. 生产部署（推荐）

推荐组合：

- 域名：GoDaddy
- 应用托管：Vercel
- 数据库：Supabase

部署细节见 `docs/DEPLOYMENT.md`。

---

## 7. 背景图资源

请将背景图放在：`public/images/`，文件名必须与下列一致：

1. `tavern-entrance-bg.jpg`（首页）
2. `tavern-hall-bg.jpg`（大厅背景）
3. `tavern-interior-bg.jpg`（大厅内场景）

参考说明文件：`public/images/README.txt`

---

## 8. 数据模型（MVP）

### chat_messages
- `id` bigint identity pk
- `nickname` text
- `content` text
- `created_at` timestamptz

### posts
- `id` bigint identity pk
- `title` text
- `content` text
- `category` enum-like text (`bounty` | `rumor` | `trade`)
- `created_at` timestamptz

---

## 9. 已知问题

- 当前 `npm run build` 会在 `board/page.tsx` 报类型错误（`supabase` 可能为 `null`）。
- 当前策略偏向快速验证（公开写入），正式环境需增加鉴权与限流。

---

## 10. 后续建议

1. 先修复构建报错，确保可部署。
2. 增加最小内容治理（长度限制、敏感词过滤、频率限制）。
3. 接入用户身份（匿名 UUID 或 OAuth）。
4. 增加数据分页和历史归档。
5. 把“左侧预留区”实现为游戏/收藏品模块。

---

## 11. 命令速查

```bash
npm run dev      # 本地开发
npm run build    # 生产构建
npm run start    # 本地生产模式启动
npm run lint     # 代码检查
```

---

如需一键上线，请按 `docs/DEPLOYMENT.md` 执行。