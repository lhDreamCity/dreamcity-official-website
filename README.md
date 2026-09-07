# 梦之城AI赋能中心 - 官网 + 课程平台

基于 **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4** 的全栈站点：官网宣传 + 体系化课程平台。

> 课程产品体系规划详见 [SOLUTION.md](./SOLUTION.md)、[COURSES_PLAN.md](./COURSES_PLAN.md)。
> 原 FastAPI 版本已归档至 [`_legacy_fastapi/`](./_legacy_fastapi/)。

## 产品模式

**登录即学，全站免费**

- 学员用**手机号 + 短信验证码**登录（注册/登录一体，无密码）。
- 登录后即可学习全部课程，**无付费墙**（旧版 6888 会员制已移除）。
- 未登录可浏览课程目录/大纲，进入播放页时引导登录。
- 管理后台入口**隐藏**（`/admin-login`），账号密码走环境变量。

## 课程体系

| # | 课程 | slug | 规模 |
|---|------|------|------|
| 1 | AI 时代个人数字素养基础课 | `ai-digital-literacy` | 6 讲 |
| 2 | AI 个人电商实战 | `ai-ecommerce` | 8 模块 |
| 3 | AI 时代个人品牌搭建 | `ai-opc` | 8 模块 |

课程数据源：`app/lib/data.ts`（本地静态维护）；大纲文档：`docs/courses/`。

## 技术架构

- **框架**：Next.js 16 (App Router) + React 19 + TypeScript
- **样式**：Tailwind CSS v4（品牌设计系统：深蓝 + 金，见 `app/globals.css`）
- **会话**：httpOnly Cookie + **HMAC-SHA256 签名**（`lib/session-secret.ts`），客户端无法篡改角色
- **权限**：RBAC（`lib/rbac.ts`），课程播放仅需登录
- **验证码**：`/api/verify-code` 发码（IP 限流；开发期返回 `devCode` 便于测试，生产接入短信服务商）
- **视频托管**：腾讯云 COS（可选）。`NEXT_PUBLIC_COS_BASE_URL` 未设置时走本地 `public/courses/`，设置后自动拼前缀（`lib/media.ts`）
- **AI 助手**：右下角"梦梦"聊天（`components/cat-chatbot.tsx`），OpenAI 兼容 API 流式对话，未配置 key 时优雅降级
- **测试**：`node --test`（`tests/rbac.test.ts`、`tests/verify.test.ts`）

## 本地开发

```bash
npm install
cp .env.local.example .env.local   # 填入必填项（见下）
npm run dev                        # http://localhost:3000
```

### 环境变量（`.env.local`，样例见 `.env.local.example`）

| 变量 | 必填 | 说明 |
|------|------|------|
| `SESSION_SECRET` | ✅ | Cookie 签名密钥，≥32 字符；`openssl rand -base64 48` 生成。未设置服务拒绝启动 |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | ✅ | 管理员账号；未设置时 `/api/admin-login` 返回 503 |
| `NEXT_PUBLIC_COS_BASE_URL` | — | 视频 CDN 前缀（腾讯云 COS 公开桶），不填走本地 |
| `OPENAI_API_KEY` / `OPENAI_API_URL` / `OPENAI_MODEL` | — | 梦梦 chatbot，不填则聊天降级提示 |

## Docker 部署

```bash
docker compose up -d --build
```

- 多阶段构建（`Dockerfile`），standalone 模式，端口 3000
- `SESSION_SECRET` / `ADMIN_USERNAME` / `ADMIN_PASSWORD` 未设置时 compose 直接报错（`:?` 校验）
- 内置 healthcheck：`GET /api/health`

## CI / CD

`.github/workflows/docker.yml`：push 到 `master` 自动执行——

1. `npm ci` + `npm test`
2. Docker 构建
3. 推送镜像到 `ghcr.io/vndr-atall/dreamcityweb`（`latest` + `master-<sha>` 两个标签）

服务器拉取镜像即可部署（`docker compose` 中把 `build:` 换成 `image: ghcr.io/vndr-atall/dreamcityweb:latest`）。

## 目录结构

```
dreamCityWeb/
├── app/
│   ├── layout.tsx / page.tsx     # 根布局 / 首页
│   ├── globals.css               # 品牌设计系统
│   ├── components/               # Header / Footer / 课程图谱 / 梦梦chatbot / 进度组件
│   ├── lib/
│   │   ├── data.ts               # 课程数据源
│   │   ├── auth.ts               # 会话（HMAC 签名 cookie）
│   │   ├── session-secret.ts     # HMAC 签名/验签
│   │   ├── verify.ts / rate-limit.ts   # 验证码 + IP 限流
│   │   ├── rbac.ts / guard.ts    # 角色权限 + 路由守卫
│   │   └── media.ts              # 视频 URL（COS/本地自动切换）
│   ├── courses/                  # 课程目录 / 详情 / 播放页
│   ├── account/                  # 个人中心（学习进度/连续学习）
│   ├── login/ register/          # 手机号+验证码登录注册
│   ├── admin-login/  admin/      # 隐藏管理入口 + 内部后台
│   └── api/                      # login/register/verify-code/logout/admin-login/chat/health
├── tests/                        # node:test 单元测试
├── docs/courses/                 # 课程大纲文档
├── public/                       # 静态资源（品牌图片；课程视频已迁 COS）
├── Dockerfile / docker-compose.yml
└── .github/workflows/docker.yml  # CI：测试 + 构建镜像 + 推 GHCR
```

## 待办

- [ ] 验证码接入真实短信服务商（阿里云/腾讯云 SMS，替换 `verify.ts` 开发期实现）
- [ ] 用户数据持久化（当前会话为签名 cookie，无数据库）
- [ ] 学习进度云端同步（现 localStorage）
- [ ] 服务器侧 compose 切换为直接拉取 GHCR 镜像
