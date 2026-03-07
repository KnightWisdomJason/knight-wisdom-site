# 部署文档（GoDaddy + Vercel + Supabase）

## 目标架构

- **域名**：GoDaddy
- **应用**：Vercel（Next.js）
- **数据库**：Supabase

> 适合当前 Tavern MVP：低成本、上线快、后续可平滑升级。

---

## 1. 准备事项

在开始前确保：

- 代码已推送到 GitHub
- Supabase 项目已创建
- 已能获取 Supabase 的 URL 和 anon key

---

## 2. 初始化 Supabase

1. 打开 Supabase 项目
2. 进入 **SQL Editor**
3. 执行 `supabase-schema.sql`
4. 在 **Project Settings → API** 记录：
   - `Project URL`
   - `anon public key`

---

## 3. 部署到 Vercel

1. 登录 Vercel
2. `New Project` → 导入 GitHub 仓库（`tavern-mvp`）
3. 在 `Environment Variables` 添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 点击 Deploy

> 注意：如果构建失败，优先修复 TypeScript 错误后再部署。

---

## 4. 绑定域名

1. 在 Vercel 项目里进入 `Settings → Domains`
2. 添加：
   - `yourdomain.com`
   - `www.yourdomain.com`
3. 按 Vercel 提示，在 GoDaddy DNS 添加记录（通常是 A + CNAME）
4. 等待 DNS 生效（几分钟到数小时）

---

## 5. HTTPS

- Vercel 自动签发并续期 HTTPS 证书
- DNS 生效后默认可用 `https://`

---

## 6. 上线后检查清单

- [ ] 首页可访问
- [ ] 可进入酒馆大厅
- [ ] 吧台聊天可发送并实时看到新消息
- [ ] 公告板可发布并展示
- [ ] 手机端基本可用
- [ ] 日志无明显报错（Vercel Runtime Logs / Supabase Logs）

---

## 7. 免费额度提醒

- GoDaddy：域名按年续费（不是免费）
- Vercel：个人免费层有构建/带宽/函数限制
- Supabase：免费层有容量与活跃度限制

---

## 8. 故障排查

### 8.1 页面显示“还差一步：配置 Supabase”
- 检查 Vercel 环境变量是否配置正确
- 重新部署以应用新变量

### 8.2 聊天不实时
- 检查 Supabase Realtime 是否正常
- 确认表在 `public` schema，且订阅事件是 INSERT

### 8.3 发布失败/读取失败
- 检查 RLS 策略是否按 `supabase-schema.sql` 创建
- 检查 anon key 是否与项目匹配

---

## 9. 生产安全建议（MVP 之后）

- 引入用户身份（匿名用户体系也可）
- 收紧 RLS（按用户/角色控制写入）
- 添加 API 限流、防刷和内容过滤
- 增加错误监控与告警（Sentry 等）