# 梦之城AI赋能中心 - Next.js 生产镜像
# 多阶段构建，最小化最终镜像体积

# ---------- Stage 1: Builder ----------
FROM node:22-alpine AS builder

WORKDIR /app

# 先安装依赖（利用 Docker cache）
COPY package.json package-lock.json ./
RUN npm ci --only=production=false

# 复制源码并构建
COPY . .

# 构建时 Next.js 会 collect page data，过程中会导入 app/lib/identifier-hash.ts，
# 它在模块顶层就 require IDENTIFIER_HASH_SECRET / SESSION_SECRET (>=32 chars)。
# 这里设一个 build-time dummy（仅用于让 import 不抛错）；真 secret 在运行时通过
# docker compose env_file 注入。值长度必须 >= 32 字符。
ENV IDENTIFIER_HASH_SECRET=build-time-dummy-do-not-use-in-prod-32-chars

RUN npm run build

# ---------- Stage 2: Runner ----------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 复制生产必需文件
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# standalone 模式下不需要 node_modules，Next.js 已打包
# 但如果使用了原生依赖，需要保留 node_modules
COPY --from=builder /app/node_modules ./node_modules

# drizzle migration 文件 + 迁移 runner。启动时跑 db-migrate 是 idempotent 的
# (drizzle migrator 用 __drizzle_migrations 表跟踪),新建空 DB 时建表,已有 schema 时跳过。
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/scripts ./scripts

EXPOSE 3000

# 启动顺序：先 apply migration（保证 schema 与镜像版本对齐），再起 Next.js server
# 用 ./node_modules/.bin/tsx 绝对路径：npm 装本地包到 node_modules/.bin，不在 PATH 默认目录里
CMD ["sh", "-c", "./node_modules/.bin/tsx scripts/db-migrate.ts && exec node server.js"]
