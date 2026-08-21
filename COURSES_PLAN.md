# 梦之城AI赋能中心 · courses 融合规划（最终版）

> 本文档是对官网现状与 `SOLUTION.md` 课程规划协调后的最终融合方案。
> 核心结论：**全站课程内容 + 单一永久会员制付费墙**，采用 Next.js + Tailwind + Supabase 渐进式重构，全功能集成到同一站点。

---

## 一、产品模式（定论）

- **6888 元 = 永久全站课程会员**，开通后即可查看站内全部课程（无需逐门购买）。
- 课程采用**多门结构**，当前先上架《AI 个人电商实战》第 1 门，后续可扩展。
- **游客可浏览**课程目录 / 详情 / 大纲；**进入播放页时被拦截**，跳转开通会员页。
- 本期**不接入真实支付**：开通会员页做完整 UI + 占位按钮，后期再接入微信 / 支付宝。
- 课程视频本期**占位**：`video_url` 预留，前端先展示封面 + “视频制作中”，待视频做好再填充。

---

## 二、技术架构

| 项 | 选型 | 说明 |
|---|---|---|
| 框架 | **Next.js (App Router)** | 重写原 FastAPI 工程 |
| 样式 | **Tailwind CSS** | 复用现有“深蓝 + 金”品牌视觉 |
| 后端/数据 | **Supabase** | Auth + Postgres + Storage（本期占位，接口层先行） |
| 语言 | 全站简体中文 | 延续现有 demo |
| 工程方式 | **原地改为干净工程** | 以 Next.js 全新工程替换 FastAPI |

> **Supabase 占位策略**：因尚无真实 Supabase 项目，本期采用“接口 / 服务层先行”，
> 数据层暂用本地 mock / SQLite 占位实现，保持与未来 Supabase 的调用签名一致，届时无缝替换。

---

## 三、站点导航结构

```
梦之城AI赋能中心
├── 首页            /
├── 业务中心        /services   （OPC搭建 / 个人品牌搭建 / 新媒体账号运营，宣传保留）
├── 课程            /courses    （新增独立板块，全站会员内容）
│     └── AI 个人电商实战营      （当前第 1 门）
├── 关于我们        /about
├── 合作交流        /contact
└── [登录 / 注册 / 会员中心]      （顶部账号区）
```

---

## 四、数据模型（Supabase Postgres）

围绕“会员制”而非“逐门卖课”设计：

```
users           用户账号            （Supabase Auth）
courses         课程                id, slug, title, description, cover, sort
lessons         课时                id, course_id, title, sort,
                                   video_url(NULL占位), duration, resource_url
memberships     会员记录            user_id, plan(6888), status,
                                   paid_at, expires_at(NULL=永久), order_id
orders          订单                （预留，后期接支付）
progress        学习进度            user_id, lesson_id, watched, completed_at
```

### 关键说明
- `memberships.expires_at` 为 `NULL` 表示**永久会员**，本方案即此模式。
- 多门课程通过 `courses` + `lessons` 的 `sort` 字段支持，当前只填充第 1 门。

---

## 五、页面清单与权限映射

| 页面 | 路径 | 游客 | 会员 |
|---|---|---|---|
| 首页 / 业务中心 / 关于 / 合作 | `/` `/services` `/about` `/contact` | ✅ | ✅ |
| 课程目录页 | `/courses` | ✅ | ✅ |
| 课程详情页 | `/courses/[slug]` | ✅ | ✅ |
| 课时大纲 | 详情页内 | ✅ | ✅ |
| **课时播放页** | `/courses/[slug]/lessons/[id]` | ❌ 拦截→开通页 | ✅ |
| 开通会员页 | `/membership` | ✅（完整 UI + 占位） | 显示“已是会员” |
| 会员中心 | `/account` | 需登录 | ✅ |

**拦截逻辑**：播放页统一做权限守卫，未开通会员 → 跳转 `/membership?redirect=...`，开通后回跳。

---

## 六、阶段落地计划

### 阶段 1（核心，已完成）：搭建 Next.js 干净工程
- Next.js (App Router) + Tailwind 工程初始化
- 用户认证与会话（Supabase Auth 接口占位，先用本地 mock）
- 数据模型层：`courses` / `lessons` / `memberships` / `orders` / `progress`（本地 mock）
- 课程目录页、课程详情页、课时大纲（公开可浏览）
- 课时播放页 + 会员守卫 + 开通会员页（占位）
- 会员中心页
- 迁移现有三大业务 + 品牌视觉与文案

### 阶段 2（延后）
- 支付接入（微信 / 支付宝，需企业资质）
- 视频真实托管（阿里云 VOD 等）+ `video_url` 填充
- 学习进度持久化
- 会员到期管理

### 阶段 3（远期）
- 社区 / 问答、作业提交
- AI 视频生成流水线（Remotion）
- 多课程体系填充

---

## 七、现有 FastAPI 资产处置

| 现有资产 | 处理 |
|---|---|
| 深蓝 + 金品牌视觉 | 迁移到 Next.js 设计系统 |
| 三大业务 + 品牌文案 | 保留，迁入新工程 |
| 用户注册/登录 + 微信 OAuth 占位 | 用 Supabase Auth 重实现 |
| SQLite | 由 Supabase Postgres（占位 mock）取代 |
| Jinja2 模板 | 放弃，改 Next.js + Tailwind |
| FastAPI 后端 | 由 Next.js 全栈替换（原地改造为干净工程） |

---

*文档状态：已与负责人确认（永久会员 / 多门先填1门 / 简体中文 / Supabase占位）。*
