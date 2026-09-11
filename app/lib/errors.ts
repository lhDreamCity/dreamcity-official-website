/**
 * 应用层错误分类。
 *
 * route handler 里直接 throw new ApiError(...)，
 * 在每个路由顶部 wrap，或者后续用全局 handler 统一序列化。
 *
 * M2：先在 /api/register 等少数路由里 throw + try/catch；M3+ 再统一中间件化。
 */

export type ApiErrorCode =
  | "bad-request" // 400
  | "unauthorized" // 401
  | "forbidden" // 403
  | "not-found" // 404
  | "conflict" // 409
  | "rate-limited" // 429
  | "internal"; // 500

const STATUS: Record<ApiErrorCode, number> = {
  "bad-request": 400,
  unauthorized: 401,
  forbidden: 403,
  "not-found": 404,
  conflict: 409,
  "rate-limited": 429,
  internal: 500,
};

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly retryAfterMs?: number,
  ) {
    super(message);
  }

  get status(): number {
    return STATUS[this.code];
  }

  toJSON(): { error: string; retryAfterMs?: number } {
    return {
      error: this.message,
      ...(this.retryAfterMs ? { retryAfterMs: this.retryAfterMs } : {}),
    };
  }
}

/** 用来在 route handler 里把 ApiError 翻译成 NextResponse。 */
export function errorResponse(e: unknown): {
  status: number;
  body: { error: string; retryAfterMs?: number };
} {
  if (e instanceof ApiError) {
    return { status: e.status, body: e.toJSON() };
  }
  return { status: 500, body: { error: "服务器错误" } };
}