# 梦之城AI赋能中心 - 官网 + 课程平台

基于 **Next.js (App Router) + Tailwind CSS** 的全栈站点，集成官网宣传与课程交易于一体。

> 融合方案详见 [COURSES_PLAN.md](./COURSES_PLAN.md)。
> 课程产品体系规划详见 [SOLUTION.md](./SOLUTION.md)。
> 原 FastAPI 版本已归档至 [`_legacy_fastapi/`](./_legacy_fastapi/)。

## 产品模式

**全站课程内容 + 单一永久会员制付费墙**

- 6888 元 = 永久全站会员，开通即看全部课程。
- 游客可浏览课程目录/详情/大纲，**进入播放页时拦截，跳转开通会员页**。
- 支付为占位，接入后即可在线开通。

## 技术栈

- **框架**：Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **数据**：Supabase（**当前为占位**，用本地 mock 数据与 cookie 会话模拟，接入点已预留）
- **语言**：全站简体中文

## 本地运行

```bash
npm install
npm run dev
```

访问 http://localhost:3000

## 目录结构

```
dreamCityWeb/
├── app/
│   ├── layout.tsx          # 根布局（导航 + 页脚）
│   ├── page.tsx            # 首页
│   ├── globals.css         # 品牌设计系统（深蓝 + 金）
│   ├── components/         # Header / Footer / 会员操作
│   ├── lib/
│   │   ├── data.ts         # 课程/课时 mock 数据
│   │   ├── services.ts     # 三大业务数据
│   │   ├── auth.ts         # 会话（Supabase 占位）
│   │   └── types.ts
│   ├── services/           # 业务中心
│   ├── courses/            # 课程目录 / 详情 / 播放页
│   ├── membership/         # 开通会员页
│   ├── account/            # 会员中心
│   ├── login/ register/    # 认证
│   └── api/                # login/register/logout/membership 路由
├── public/                 # 静态资源（品牌图片）
├── static/                 # 旧版 CSS/JS 参考（已归档不再引用）
└── _legacy_fastapi/        # 原 FastAPI 版本备份
```

## 会员流程（Demo）

1. 注册/登录账号
2. 访问课时播放页 → 未开通被拦截跳转 `/membership`
3. 在开通页点击「（Demo）模拟开通会员」解锁
4. 解锁后即可在 `/account` 会员中心访问全部课程

## 待办（接入生产）

- [ ] 接入 Supabase Auth（替换 `lib/auth.ts` 与 `api/`）
- [ ] 接入微信支付/支付宝支付（替换 `/membership` 占位按钮）
- [ ] 接入视频托管（阿里云 VOD），填充课时 `videoUrl`
- [ ] 学习进度持久化（`progress` 表）
