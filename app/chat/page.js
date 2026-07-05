"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import WatercolorBackground from "@/components/WatercolorBackground";
import TypewriterText from "@/components/TypewriterText";
import SynthesisMemo from "@/components/SynthesisMemo";
import ArchiveDrawer from "@/components/ArchiveDrawer";
import useLocalStorage from "@/lib/useLocalStorage";
import { loadSession } from "@/lib/session";

export default function ChatPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]); // {role:'assistant'|'user', content, typed}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [apiError, setApiError] = useState("");

  // 备忘录状态
  const [memo, setMemo] = useState(null);
  const [memoSaved, setMemoSaved] = useState(false);
  const [generatingMemo, setGeneratingMemo] = useState(false);

  const [archive, setArchive] = useLocalStorage("oom_archive", []);

  const scrollRef = useRef(null);
  const bootstrapped = useRef(false);

  // 用户回合数：用户消息条数
  const userTurns = messages.filter((m) => m.role === "user").length;
  const canGenerate = userTurns >= 3 && !memo;

  // 初始化：读取 session，若无则回首页
  useEffect(() => {
    const s = loadSession();
    if (!s || !s.mbti) {
      router.replace("/");
      return;
    }
    setSession(s);
  }, [router]);

  // 进入页面自动破冰
  useEffect(() => {
    if (!session || bootstrapped.current) return;
    bootstrapped.current = true;
    fetchIcebreaker(session);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  };

  async function fetchIcebreaker(s) {
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: s.name,
          userMbti: s.mbti,
          mirrorMbti: s.mirror,
          mode: "icebreaker",
        }),
      });
      const data = await readJsonResponse(res);
      const reply =
        data.reply || "我是你的另一面。此刻，有什么念头正在你心里盘旋？";
      setMessages([{ role: "assistant", content: reply, typed: false }]);
    } catch (e) {
      setApiError(getFriendlyApiError(e));
      setMessages([
        {
          role: "assistant",
          content: "我是你的另一面。此刻，有什么念头正在你心里盘旋？",
          typed: false,
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading || !session) return;
    setInput("");

    const nextMessages = [...messages, { role: "user", content: text, typed: true }];
    setMessages(nextMessages);
    scrollToBottom();
    setLoading(true);
    setApiError("");

    try {
      // 构造给后端的对话历史（去掉 typed 标记）
      const history = nextMessages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMbti: session.mbti,
          mirrorMbti: session.mirror,
          messages: history,
        }),
      });
      const data = await readJsonResponse(res);
      const reply = data.reply || "……";
      setMessages((prev) => [...prev, { role: "assistant", content: reply, typed: false }]);
    } catch (e) {
      setApiError(getFriendlyApiError(e));
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "连接真实 AI 时出了点问题。检查网络或 API 配置后，我们可以从这里继续。", typed: true },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  async function generateMemo() {
    if (!session || generatingMemo) return;
    setGeneratingMemo(true);
    setApiError("");
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMbti: session.mbti,
          mirrorMbti: session.mirror,
          messages: history,
        }),
      });
      const data = await readJsonResponse(res);
      if (data.memo) {
        setMemo(data.memo);
        setMemoSaved(false);
      }
    } catch (e) {
      setApiError(getFriendlyApiError(e));
    } finally {
      setGeneratingMemo(false);
    }
  }

  function saveMemo() {
    if (!memo || memoSaved || !session) return;
    const entry = {
      id: `${Date.now()}`,
      ts: Date.now(),
      userMbti: session.mbti,
      mirrorMbti: session.mirror,
      memo,
    };
    setArchive((prev) => [entry, ...(prev || [])]);
    setMemoSaved(true);
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!session) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="flex h-screen flex-col"
    >
      <WatercolorBackground tone="soft" id="chat" />
      {/* Header */}
      <header className="relative z-10 flex items-center justify-center px-6 pt-6 pb-2">
        <Logo size="sm" animated={false} />
        <button
          onClick={() => setDrawerOpen(true)}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-white/60 transition-colors hover:text-white"
          aria-label="打开档案"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* 主区域：对话 or 备忘录 */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!memo ? (
            <motion.div
              key="chat"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex h-full flex-col"
            >
              {/* 对话滚动区 —— 无气泡、无头像 */}
              <div
                ref={scrollRef}
                className="no-scrollbar flex-1 overflow-y-auto px-6 py-6"
              >
                <div className="mx-auto flex max-w-lg flex-col gap-8">
                  {messages.map((m, i) => (
                    <MessageLine
                      key={i}
                      message={m}
                      isLast={i === messages.length - 1}
                      onTyped={() => {
                        setMessages((prev) =>
                          prev.map((x, xi) => (xi === i ? { ...x, typed: true } : x))
                        );
                      }}
                      onTick={scrollToBottom}
                    />
                  ))}

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-left text-lg text-white/40"
                    >
                      <span className="cursor-blink">▍</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Footer 输入区 */}
              <div className="px-6 pb-8 pt-2">
                <div className="mx-auto flex max-w-lg flex-col items-center gap-4">
                  <AnimatePresence>
                    {canGenerate && (
                      <motion.button
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        onClick={generateMemo}
                        disabled={generatingMemo}
                        className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs text-white/70 backdrop-blur-md transition-colors hover:bg-white/10"
                      >
                        {generatingMemo ? "正在整合…" : "结束对话，生成整合备忘录"}
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {apiError && (
                    <p className="w-full rounded-2xl border border-red-200/20 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-50/85">
                      {apiError}
                    </p>
                  )}

                  <div
                    className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md"
                    style={{ WebkitBackdropFilter: "blur(12px)" }}
                  >
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="把纠结说给另一个我听…"
                      className="flex-1 bg-transparent text-sm text-white outline-none"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || loading}
                      className={`text-sm transition-colors ${
                        input.trim() && !loading
                          ? "text-white hover:text-white"
                          : "text-white/30"
                      }`}
                      aria-label="发送"
                    >
                      ↑
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="memo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex h-full items-center justify-center overflow-y-auto px-6 py-8 no-scrollbar"
            >
              <SynthesisMemo
                memo={memo}
                userMbti={session.mbti}
                mirrorMbti={session.mirror}
                saved={memoSaved}
                onSave={saveMemo}
                onHome={() => router.push("/")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 档案抽屉 */}
      <ArchiveDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={archive || []}
        onSelect={(item) => {
          setMemo(item.memo);
          setMemoSaved(true);
          setDrawerOpen(false);
        }}
      />
    </motion.div>
  );
}

/**
 * 单条消息：AI 白色左对齐 + 打字机；用户 半透明白右对齐
 */
function MessageLine({ message, isLast, onTyped, onTick }) {
  if (message.role === "assistant") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-left"
      >
        <p className="whitespace-pre-wrap text-lg leading-relaxed text-white">
          {message.typed ? (
            message.content
          ) : (
            <TypewriterText text={message.content} onDone={onTyped} onTick={onTick} />
          )}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-right"
    >
      <p className="whitespace-pre-wrap text-base leading-relaxed text-white/60">
        {message.content}
      </p>
    </motion.div>
  );
}


async function readJsonResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "请求失败");
  }
  return data;
}

function getFriendlyApiError(error) {
  const message = String(error?.message || "");
  if (message.includes("Connect Timeout") || message.includes("fetch failed")) {
    return "真实 AI 接口连接超时。通常是当前网络无法访问 API 地址，或需要把 LLM_BASE_URL 换成你的服务商地址。";
  }
  if (message.includes("401") || message.includes("Unauthorized")) {
    return "API Key 没有通过验证。请确认 Key、Base URL 和模型名属于同一个服务商。";
  }
  if (message.includes("404") || message.includes("model")) {
    return "模型名或接口地址可能不匹配。请确认 LLM_MODEL 和 LLM_BASE_URL。";
  }
  return "真实 AI 接口暂时没有返回有效结果。请检查网络、API Key、Base URL 或模型名。";
}
