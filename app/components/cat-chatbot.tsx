"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { chatbotConfig, isChatbotEnabled } from "@/app/lib/chatbot-config";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type CatState = "idle" | "sit" | "walk" | "sleep";
type Facing = "left" | "right";

interface Point {
  x: number;
  y: number;
}

/* ---------- state machine config ---------- */
const STATE_CONFIG: Record<
  CatState,
  { duration: [number, number]; next: CatState[]; weights: number[] }
> = {
  idle: {
    duration: [3000, 7000],
    next: ["idle", "walk", "sit", "sleep"],
    weights: [35, 30, 25, 10],
  },
  sit: {
    duration: [4000, 10000],
    next: ["idle", "sit", "walk"],
    weights: [45, 30, 25],
  },
  walk: {
    duration: [2500, 5000],
    next: ["idle", "sit"],
    weights: [60, 40],
  },
  sleep: {
    duration: [15000, 30000],
    next: ["idle"],
    weights: [100],
  },
};

/* ---------- helpers ---------- */
function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

function weightedRandom<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    if (r < weights[i]) return items[i];
    r -= weights[i];
  }
  return items[items.length - 1];
}

function getSafeZone(): { minX: number; maxX: number; minY: number; maxY: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 64;
  const zoneW = Math.min(380, vw * 0.38);
  const zoneH = Math.min(380, vh * 0.55);
  return {
    minX: Math.max(vw * 0.55, vw - zoneW - margin),
    maxX: vw - margin,
    minY: Math.max(80, vh - zoneH - margin),
    maxY: vh - margin,
  };
}

function randomPoint(): Point {
  const zone = getSafeZone();
  return {
    x: randInt(zone.minX, zone.maxX),
    y: randInt(zone.minY, zone.maxY),
  };
}

function imageForState(state: CatState): string {
  switch (state) {
    case "walk":
      return chatbotConfig.thinkingImage; // side view
    case "sleep":
      return chatbotConfig.backImage; // back/tail
    default:
      return chatbotConfig.avatarImage; // front
  }
}

/* ---------- component ---------- */
export default function CatChatbot() {
  const pathname = usePathname();

  /* chat states */
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: chatbotConfig.welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* cat activity states */
  const [catState, setCatState] = useState<CatState>("idle");
  const [pos, setPos] = useState<Point>({ x: 0, y: 0 });
  const [facing, setFacing] = useState<Facing>("right");
  const [moveDuration, setMoveDuration] = useState(1000);
  const [bubbleText, setBubbleText] = useState("");
  const activityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isActive = useRef(true);

  const enabled = isChatbotEnabled(pathname);

  /* ---------- chat helpers ---------- */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setIsThinking(true);

    const apiMessages = [
      { role: "system", content: chatbotConfig.systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMsg.content },
    ];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `出错啦喵：${err.error || "请稍后再试"}`,
          },
        ]);
        setLoading(false);
        setIsThinking(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setIsThinking(false);

      if (!reader) {
        setLoading(false);
        return;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;
          if (trimmed.startsWith("data: ")) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                setMessages((prev) => {
                  const next = [...prev];
                  next[next.length - 1] = {
                    role: "assistant",
                    content: assistantContent,
                  };
                  return next;
                });
              }
            } catch {
              /* ignore malformed JSON */
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "网络开小差了，请稍后再试喵~" },
      ]);
    } finally {
      setLoading(false);
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ---------- cat activity engine ---------- */
  const scheduleNextState = useCallback(() => {
    if (!isActive.current || open) return;

    const cfg = STATE_CONFIG[catState];
    const delay = randInt(cfg.duration[0], cfg.duration[1]);

    activityTimer.current = setTimeout(() => {
      if (!isActive.current || open) return;

      const next = weightedRandom(cfg.next, cfg.weights);

      if (next === "walk") {
        const target = randomPoint();
        const dist = Math.hypot(target.x - pos.x, target.y - pos.y);
        // only walk if meaningful distance
        if (dist > 40) {
          const speed = 140; // px/sec
          const dur = Math.max(800, Math.min(3500, (dist / speed) * 1000));
          setFacing(target.x > pos.x ? "right" : "left");
          setMoveDuration(dur);
          setPos(target);
          setCatState("walk");

          // after movement finishes, switch to idle/sit
          activityTimer.current = setTimeout(() => {
            if (!isActive.current || open) return;
            const afterWalk = weightedRandom(
              ["idle", "sit"],
              [60, 40]
            ) as CatState;
            setCatState(afterWalk);
            setBubbleText("");
            scheduleNextState();
          }, dur + 100);
          return;
        }
      }

      if (next === "sleep") {
        setBubbleText("Zzz…");
      } else {
        setBubbleText("");
      }

      setCatState(next);
      scheduleNextState();
    }, delay);
  }, [catState, open, pos]);

  /* init position on mount */
  useEffect(() => {
    if (!enabled) return;
    const start = randomPoint();
    setPos(start);
    scheduleNextState();
    return () => {
      isActive.current = false;
      if (activityTimer.current) clearTimeout(activityTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  /* pause activity when panel opens, resume on close */
  useEffect(() => {
    if (open) {
      if (activityTimer.current) clearTimeout(activityTimer.current);
      setBubbleText("");
    } else {
      isActive.current = true;
      scheduleNextState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* handle resize */
  useEffect(() => {
    const onResize = () => {
      const zone = getSafeZone();
      setPos((p) => ({
        x: Math.min(Math.max(p.x, zone.minX), zone.maxX),
        y: Math.min(Math.max(p.y, zone.minY), zone.maxY),
      }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ---------- render ---------- */
  if (!enabled) return null;

  const positionClass =
    chatbotConfig.buttonPosition === "left"
      ? "left-4 md:left-8"
      : "right-4 md:right-8";

  const avatarSrc = isThinking
    ? chatbotConfig.thinkingImage
    : chatbotConfig.avatarImage;

  return (
    <>
      {/* Inline keyframes for cat animations */}
      <style>{`
        @keyframes cat-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes cat-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes cat-walk-bob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-2px) rotate(-1deg); }
          75% { transform: translateY(-2px) rotate(1deg); }
        }
        .cat-anim-float { animation: cat-float 2.5s ease-in-out infinite; }
        .cat-anim-breathe { animation: cat-breathe 3s ease-in-out infinite; }
        .cat-anim-walk { animation: cat-walk-bob 0.4s ease-in-out infinite; }
        .cat-sit {
          transform: scaleY(0.82) translateY(6px);
          transition: transform 0.6s ease;
        }
      `}</style>

      {/* ===== Wandering cat (visible when chat closed) ===== */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed z-50"
          style={{
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            transition: `left ${moveDuration}ms ease-in-out, top ${moveDuration}ms ease-in-out`,
          }}
          aria-label="打开AI助手"
        >
          <div
            className={[
              "relative w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden",
              "shadow-2xl ring-2 ring-white/80 bg-white cursor-pointer",
              "hover:scale-110 transition-transform duration-300",
              catState === "idle" && "cat-anim-float",
              catState === "sleep" && "cat-anim-breathe opacity-60",
              catState === "walk" && "cat-anim-walk",
              catState === "sit" && "cat-sit",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              transform:
                catState !== "sit"
                  ? `scaleX(${facing === "left" ? -1 : 1})`
                  : undefined,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageForState(catState)}
              alt="梦梦"
              className="w-full h-full object-cover"
            />
          </div>

          {/* activity bubble */}
          {bubbleText && (
            <span className="absolute -top-2 -right-1 bg-white text-slate-600 text-xs px-2 py-0.5 rounded-full shadow border border-slate-100 whitespace-nowrap animate-bounce">
              {bubbleText}
            </span>
          )}

          {/* online indicator */}
          {catState !== "sleep" && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-500"></span>
            </span>
          )}
        </button>
      )}

      {/* ===== Chat panel ===== */}
      {open && (
        <div
          className={`fixed bottom-4 md:bottom-8 ${positionClass} z-50 flex flex-col w-[90vw] max-w-[380px] h-[60vh] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/60 bg-white shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={chatbotConfig.avatarImage}
                alt="梦梦"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">梦梦 AI助手</p>
              <p className="text-[11px] text-white/80 truncate">
                梦之城AI赋能中心
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="关闭"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-slate-200 bg-white shrink-0 mt-0.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={chatbotConfig.avatarImage}
                      alt="梦梦"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-sky-500 text-white rounded-br-md"
                      : "bg-white text-slate-700 border border-slate-200 rounded-bl-md shadow-sm"
                  }`}
                >
                  {msg.content || (
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    </span>
                  )}
                </div>
              </div>
            ))}

            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-slate-200 bg-white shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={chatbotConfig.thinkingImage}
                    alt="思考中"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-3.5 py-2.5 shadow-sm">
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 px-3 py-2.5 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息…"
                className="flex-1 min-w-0 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="shrink-0 rounded-full p-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105"
                aria-label="发送"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
