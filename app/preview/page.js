"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import WatercolorBackground from "@/components/WatercolorBackground";

const TEST_SESSION = {
  name: "预览用户",
  userMbti: "ENTP",
  mirrorMbti: "ISFJ",
};

const TEST_TURNS = [
  "我最近想辞职做一个自己的产品，但又担心只是被新鲜感推着走。",
  "我最怕继续待下去会越来越麻木，可一想到收入不稳定又会退回来。",
  "如果只能先做一步，我想知道哪一步既诚实又不会太冒进。",
];

export default function PreviewPage() {
  const [status, setStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [memo, setMemo] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    runPreview();
  }, []);

  async function runPreview() {
    setRunning(true);
    setError("");
    setMessages([]);
    setMemo(null);
    setFallback(false);

    try {
      const llmStatus = await fetchJson("/api/llm/status");
      setStatus(llmStatus);

      const conversation = [];
      const icebreaker = await postJson("/api/chat", {
        name: TEST_SESSION.name,
        userMbti: TEST_SESSION.userMbti,
        mirrorMbti: TEST_SESSION.mirrorMbti,
        mode: "icebreaker",
      });
      setFallback(Boolean(icebreaker.fallback));
      conversation.push({ role: "assistant", content: icebreaker.reply || "" });
      setMessages([...conversation]);

      for (const turn of TEST_TURNS) {
        conversation.push({ role: "user", content: turn });
        setMessages([...conversation]);

        const response = await postJson("/api/chat", {
          userMbti: TEST_SESSION.userMbti,
          mirrorMbti: TEST_SESSION.mirrorMbti,
          messages: conversation,
        });
        setFallback((prev) => prev || Boolean(response.fallback));
        conversation.push({ role: "assistant", content: response.reply || "" });
        setMessages([...conversation]);
      }

      const memoResponse = await postJson("/api/memo", {
        userMbti: TEST_SESSION.userMbti,
        mirrorMbti: TEST_SESSION.mirrorMbti,
        messages: conversation,
      });
      setFallback((prev) => prev || Boolean(memoResponse.fallback));
      setMemo(memoResponse.memo || null);
    } catch (e) {
      setError(e?.message || "预览生成失败");
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="min-h-screen px-5 py-6 text-white">
      <WatercolorBackground tone="soft" id="preview" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-5xl flex-col gap-5">
        <header className="flex items-center justify-between gap-4">
          <Logo size="sm" animated={false} />
          <button
            onClick={runPreview}
            disabled={running}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-md transition-colors hover:bg-white/15 disabled:text-white/40"
          >
            {running ? "生成中..." : "重新生成"}
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-lg border border-white/20 bg-white/[0.07] p-4 backdrop-blur-md">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-white/70">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
                {fallback ? "本地占位" : status?.configured ? "真实 API" : "未配置 API"}
              </span>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
                {status?.model || "读取中"}
              </span>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-white/75">
              <Block label="测试人格" value={TEST_SESSION.userMbti + " -> " + TEST_SESSION.mirrorMbti} />
              <Block label="接口地址" value={status?.baseUrl || "读取中"} />
              <Block label="测试情境" value="辞职做自己的产品，在冲动、自由和现实稳定之间摇摆。" />
            </div>

            {error && (
              <p className="mt-5 rounded-lg border border-red-200/20 bg-red-500/15 p-3 text-sm text-red-50">
                {error}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-white/20 bg-white/[0.07] p-4 backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between text-sm text-white/60">
              <span>AI 对话预览</span>
              <span>{messages.length} 条</span>
            </div>
            <div className="flex max-h-[58vh] flex-col gap-4 overflow-y-auto pr-1 no-scrollbar">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={message.role === "user" ? "text-right" : "text-left"}
                >
                  <p
                    className={
                      "inline-block max-w-[88%] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-relaxed " +
                      (message.role === "user"
                        ? "bg-white/10 text-white/65"
                        : "bg-white/20 text-white")
                    }
                  >
                    {message.content}
                  </p>
                </motion.div>
              ))}
              {running && (
                <p className="text-lg text-white/40">
                  <span className="cursor-blink">▍</span>
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-white/20 bg-white/[0.07] p-4 backdrop-blur-md">
          <div className="mb-4 text-sm text-white/60">整合备忘录预览</div>
          {memo ? (
            <div className="grid gap-3 md:grid-cols-4">
              <MemoField label="主题" value={memo.topic} />
              <MemoField label="当前声音" value={memo.userVoice} />
              <MemoField label="镜像声音" value={memo.mirrorVoice} />
              <MemoField label="下一步" value={memo.action} />
            </div>
          ) : (
            <p className="text-sm text-white/45">等待生成结果...</p>
          )}
        </section>
      </div>
    </main>
  );
}

function Block({ label, value }) {
  return (
    <div>
      <div className="mb-1 text-xs text-white/40">{label}</div>
      <div className="break-words text-white/80">{value}</div>
    </div>
  );
}

function MemoField({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/10 p-3">
      <div className="mb-2 text-xs text-white/40">{label}</div>
      <p className="text-sm leading-relaxed text-white/80">{value}</p>
    </div>
  );
}

async function fetchJson(url) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "请求失败");
  }
  return data;
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || "请求失败");
  }
  return data;
}
