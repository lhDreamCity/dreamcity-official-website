"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { chatbotConfig, isChatbotEnabled } from "@/app/lib/chatbot-config";

interface Message {
  role: "user" | "assistant";
  content: string;
}

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

  const enabled = isChatbotEnabled(pathname);

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

  if (!enabled) return null;

  const positionClass =
    chatbotConfig.buttonPosition === "left"
      ? "left-4 md:left-8"
      : "right-4 md:right-8";

  return (
    <>
      {/* 原地坐姿 + 呼吸动画 */}
      <style>{`
        @keyframes mengmeng-breathe {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.03); }
        }
        @keyframes mengmeng-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .mengmeng-idle { animation: mengmeng-breathe 3s ease-in-out infinite; }
        .mengmeng-hover { animation: mengmeng-float 1.2s ease-in-out infinite; }
      `}</style>

      {/* ===== 坐着的猫（聊天关闭时显示） ===== */}
      {!open && (
        <div className={`fixed bottom-5 ${positionClass} z-50 group flex items-end gap-2`}>
          {/* 悬浮招呼语 */}
          <span className="pointer-events-none mb-3 max-w-[200px] translate-y-1 rounded-2xl rounded-br-sm border border-slate-100 bg-white px-3 py-1.5 text-[12px] text-slate-600 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            {chatbotConfig.greeting}
          </span>

          {/* 猫本体 */}
          <button
            onClick={() => setOpen(true)}
            aria-label="打开AI助手"
            className="group/cat relative h-16 w-16 shrink-0 cursor-pointer"
          >
            <div className="mengmeng-idle h-16 w-16 overflow-hidden rounded-full bg-white shadow-2xl ring-2 ring-white/80 transition-transform duration-300 group-hover/cat:scale-105 group-hover/cat:mengmeng-hover">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={chatbotConfig.avatarImage}
                alt="梦梦"
                className="h-full w-full object-cover"
              />
            </div>
            {/* 在线指示 */}
            <span className="absolute bottom-0.5 right-0.5 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-sky-500"></span>
            </span>
          </button>
        </div>
      )}

      {/* ===== 聊天面板 ===== */}
      {open && (
        <div
          className={`fixed bottom-4 md:bottom-8 ${positionClass} z-50 flex h-[60vh] max-h-[520px] w-[90vw] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl`}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-3 text-white">
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-white/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={chatbotConfig.avatarImage}
                alt="梦梦"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">梦梦 AI助手</p>
              <p className="truncate text-[11px] text-white/80">梦之城AI赋能中心</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 transition-colors hover:bg-white/20"
              aria-label="关闭"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-3"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.role === "assistant" && (
                  <div className="mt-0.5 h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={chatbotConfig.avatarImage}
                      alt="梦梦"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-md bg-sky-500 text-white"
                      : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                  }`}
                >
                  {msg.content || (
                    <span className="inline-flex gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]" />
                    </span>
                  )}
                </div>
              </div>
            ))}

            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-2">
                <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={chatbotConfig.avatarImage}
                    alt="思考中"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.1s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-2.5">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入消息…"
                className="min-w-0 flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="shrink-0 rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 p-2.5 text-white shadow-md transition-all hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="发送"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
