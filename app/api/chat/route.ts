import { NextRequest } from "next/server";
import { getClientIp, rateLimit } from "@/app/lib/rate-limit";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  // 限流：每 IP 每分钟 20 次（chatbot 还没登录态，先按 IP 粗限）。
  // /api/chat 走 OpenAI 真烧钱 + 真消耗配额，没限流是 DoS / 刷账单风险。
  const ip = getClientIp(req);
  const rl = rateLimit(`chat:ip:${ip}`, 20, 60_000);
  if (!rl.allowed) {
    return new Response(
      JSON.stringify({ error: "请求过于频繁，请稍后再试" }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)),
        },
      },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const apiUrl = process.env.OPENAI_API_URL || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "API key not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { messages?: Array<{ role: string; content: string }> };
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!body.messages || !Array.isArray(body.messages)) {
    return new Response(
      JSON.stringify({ error: "messages array required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const payload = {
    model,
    messages: body.messages,
    stream: true,
    temperature: 0.8,
  };

  try {
    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      return new Response(
        JSON.stringify({ error: `Upstream error: ${text}` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: `Fetch failed: ${message}` }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}
