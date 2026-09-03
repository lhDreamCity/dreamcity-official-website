/**
 * 媒体 URL 拼接（视频为主）。
 *
 * data.ts 里的 videoUrl 是相对路径（如 `/courses/ai-ecommerce/.../x.mp4`）。
 * 渲染时由它拼接成完整地址：
 *  - 没配 NEXT_PUBLIC_COS_BASE_URL → 返回原路径，Next.js 走 public/courses/
 *  - 配了 → 返回 COS 上的 CDN URL（如 https://dreamcity-xxx.cos.ap-shanghai.myqcloud.com/courses/...）
 *
 * 之所以把 env 变量叫 NEXT_PUBLIC_* 是因为视频 URL 出现在客户端组件的 <video src>，
 * 服务端 + 客户端 bundle 都得能取到。`NEXT_PUBLIC_*` 在构建时由 Next.js 内联到客户端 bundle。
 */
export function videoUrlFor(rel: string | null | undefined): string | null {
  if (!rel) return null;
  const base = process.env.NEXT_PUBLIC_COS_BASE_URL?.replace(/\/$/, "");
  return base ? `${base}${rel}` : rel;
}