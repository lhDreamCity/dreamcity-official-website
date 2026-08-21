# RBAC 账号体系技术方案（梦之城 AI 赋能中心）

> 目标：按 RBAC 标准搭建账号体系。当前已落地**开发期框架**（cookie 模拟），
> 本文档描述完整接入 **Supabase Auth + 数据库 + RLS** 的最终方案与迁移路径。

---

## 一、架构分层

```
身份层（Auth）       RBAC 授权层          订阅/授权层
你是谁？              你能做什么？          你能访问什么内容？
Supabase Auth     roles / permissions     subscriptions(会员)
                       user_roles            （课程访问）
                       role_permissions
```

**关键设计**：课程访问是**订阅型**（会员可看全部课），不是资源型授权，
所以把「会员订阅」独立成 `subscriptions` 表，不塞进 RBAC 权限里。

---

## 二、已落地的开发期框架（当前代码）

| 文件 | 作用 |
|---|---|
| `app/lib/types.ts` | RBAC 类型（`RoleName`、`PermissionCode`、`User.roles/permissions`） |
| `app/lib/rbac.ts` | 角色-权限映射（单一事实来源）、`hasRole/hasPermission/resolvePermissions` |
| `app/lib/auth.ts` | `getCurrentUser()` 升级为返回 `roles + permissions`（cookie 模拟） |
| `app/lib/guard.ts` | 服务端守卫 `requireAuth / requireRole / requirePermission / can` |
| `middleware.ts` | 路由级守卫（`/admin/**` 需 admin、`/dashboard/**` 需后台角色） |
| `app/admin/page.tsx` | admin 后台占位（渲染角色-权限矩阵） |
| `app/forbidden/page.tsx` | 403 页面 |
| `app/login/page.tsx` | 登录页支持开发期角色选择 |
| `app/account/page.tsx` | 展示角色 + admin 入口 |

**开发期模拟**：`dcw_user`（邮箱）、`dcw_member`（会员）、`dcw_role`（角色）cookie。
登录接口 `POST /api/login` 接受可选 `role` 字段。

---

## 三、Supabase 数据模型（最终方案）

### 1. 角色表
```sql
create table public.roles (
  id bigint generated always as identity primary key,
  name text not null unique,        -- admin/teacher/editor/member/guest
  description text
);
```

### 2. 权限表
```sql
create table public.permissions (
  id bigint generated always as identity primary key,
  code text not null unique,        -- course:view / lesson:watch / ...
  description text
);
```

### 3. 角色-权限映射
```sql
create table public.role_permissions (
  role_id bigint references public.roles(id) on delete cascade,
  permission_id bigint references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);
```

### 4. 用户-角色映射
```sql
create table public.user_roles (
  user_id uuid references auth.users(id) on delete cascade,
  role_id bigint references public.roles(id) on delete cascade,
  granted_at timestamptz default now(),
  primary key (user_id, role_id)
);
```

### 5. 会员订阅（订阅层）
```sql
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  plan text not null default 'monthly',   -- monthly/yearly/lifetime
  status text not null default 'active',  -- active/canceled/expired
  current_period_end timestamptz,
  created_at timestamptz default now()
);
```

---

## 四、RLS 行级安全（权限兜底）

RLS 是权限体系的**最后防线**，即使绕过应用层也越权不了。

```sql
alter table public.subscriptions enable row level security;

-- 用户只能看自己的订阅
create policy "users read own subscription"
on public.subscriptions for select
using (auth.uid() = user_id);

-- 只有 admin 能管理订阅
create policy "admin manage subscriptions"
on public.subscriptions for all
using (
  exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid() and r.name = 'admin'
  )
);
```

### 课程课时访问（lesson:watch）
```sql
-- 读取课时需为会员（或 admin/teacher/editor）
create policy "member watch lessons"
on public.lessons for select
using (
  exists (
    select 1 from public.subscriptions s
    where s.user_id = auth.uid()
      and s.status = 'active'
      and (s.current_period_end is null or s.current_period_end > now())
  )
  or exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid() and r.name in ('admin','teacher','editor')
  )
);
```

---

## 五、应用层迁移步骤（开发期 → Supabase）

### 第 1 步：接入 Supabase Client
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 第 2 步：建库脚本
执行上面的建表 + RLS 脚本（可用 `supabase/migrations/` 管理）。

### 第 3 步：替换 auth.ts
```ts
// app/lib/auth.ts 中 getCurrentUser 改为：
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) return null;

// 查角色
const { data: roles } = await supabase
  .from("user_roles")
  .select("roles(name)")
  .eq("user_id", user.id);
const roleNames = roles.map(r => r.roles.name);

// 展平权限（仍可复用 rbac.ts 的 resolvePermissions）
const permissions = resolvePermissions(roleNames);

// 查订阅
const { data: sub } = await supabase
  .from("subscriptions")
  .select("status, current_period_end")
  .eq("user_id", user.id)
  .eq("status", "active")
  .maybeSingle();
```

### 第 4 步：替换 login/register
- `POST /api/login` → `supabase.auth.signInWithPassword()`
- `POST /api/register` → `supabase.auth.signUp()`
- 移除 cookie 模拟逻辑与 `dcw_role`

### 第 5 步：保留中间件 + 守卫
`middleware.ts` / `guard.ts` 的路径规则与守卫签名**不变**，只需把 cookie 判断换成
Supabase session 判断即可，其余代码无需改动。

---

## 六、权限矩阵（角色 × 权限）

| 权限 | admin | teacher | editor | member | guest |
|---|---|---|---|---|---|
| course:view | ✓ | ✓ | ✓ | ✓ | ✓ |
| lesson:watch | ✓ | ✓ | ✓ | ✓ | · |
| course:create | ✓ | ✓ | · | · | · |
| course:edit | ✓ | ✓ | · | · | · |
| lesson:manage | ✓ | ✓ | · | · | · |
| content:publish | ✓ | ✓ | ✓ | · | · |
| user:manage | ✓ | · | · | · | · |
| role:manage | ✓ | · | · | · | · |
| member:manage | ✓ | · | · | · | · |
| analysis:view | ✓ | ✓ | ✓ | · | · |
| settings:manage | ✓ | · | · | · | · |

（与 `app/lib/rbac.ts` 中的 `ROLE_PERMISSIONS` 保持一致）

---

## 七、后续迭代（非本次范围）

- [ ] admin 后台：用户管理 / 角色分配 / 会员管理（增删改）
- [ ] teacher 后台：课程 / 课时 / 视频上传
- [ ] 会员订阅支付流程 + 到期自动失效
- [ ] 审计日志（谁在何时做了什么）
