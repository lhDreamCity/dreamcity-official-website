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
RUN npm run build

# ---------- Stage 2: Runner ----------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 只复制生产必需文件
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# standalone 模式下不需要 node_modules，Next.js 已打包
# 但如果使用了原生依赖，需要保留 node_modules
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "server.js"]
