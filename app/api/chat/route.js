import { NextResponse } from "next/server";
import { buildChatSystemPrompt, buildIcebreakerPrompt } from "@/lib/prompts";
import { createChatCompletion, getLlmConfig, getPublicLlmStatus } from "@/lib/llm";

export const runtime = "nodejs";

/**
 * POST /api/chat
 * body: { name, userMbti, mirrorMbti, mode, messages: [{role, content}] }
 * 返回: { reply: string, fallback?: boolean, llm: { configured, baseUrl, model } }
 */
export async function POST(req) {
  try {
    const { name, userMbti, mirrorMbti, messages = [], mode } = await req.json();
    const systemPrompt = buildChatSystemPrompt({ userMbti, mirrorMbti });
    const llm = getPublicLlmStatus();

    if (!getLlmConfig().configured) {
      return NextResponse.json({
        reply:
          mode === "icebreaker"
            ? icebreakerFallback(mirrorMbti)
            : fallbackReply(messages, mirrorMbti),
        fallback: true,
        llm,
      });
    }

    const modelMessages =
      mode === "icebreaker"
        ? [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: buildIcebreakerPrompt({
                name: name || "你",
                userMbti,
                mirrorMbti,
              }),
            },
          ]
        : [{ role: "system", content: systemPrompt }, ...normalizeMessages(messages)];

    const rawReply = await createChatCompletion({
      messages: modelMessages,
      temperature: mode === "icebreaker" ? 0.65 : 0.7,
      maxTokens: mode === "icebreaker" ? 120 : 300,
    });
    const reply = stripPromptScaffolding(rawReply);

    return NextResponse.json({ reply, fallback: false, llm });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "服务器错误" },
      { status: 500 }
    );
  }
}

function normalizeMessages(messages) {
  return (messages || [])
    .filter((message) => ["user", "assistant", "system"].includes(message?.role))
    .map((message) => ({
      role: message.role,
      content: String(message.content || ""),
    }))
    .filter((message) => message.content.trim());
}

function stripPromptScaffolding(text) {
  return String(text || "")
    .split("\n")
    .map((line) =>
      line.replace(/^\s*(?:\[(?:看见|镜像|留白)\]|(?:看见|镜像|留白))[：:]\s*/u, "")
    )
    .filter(Boolean)
    .join("\n")
    .trim();
}

/**
 * 破冰开场兜底：无 API Key 时使用。
 */
function icebreakerFallback(mirrorMbti) {
  const openers = [
    "我是你的另一面，那个更接近 " + mirrorMbti + " 的你。此刻，有什么念头正在你心里盘旋？",
    "我住在你思考的另一端。说说看，现在最让你放不下的，是什么？",
    "我是你不常听见的那个声音。今天，是什么在你心里绕来绕去？",
  ];
  return openers[Math.floor(Math.random() * openers.length)];
}

/**
 * 常规回复兜底：无 API Key 时使用。
 */
function fallbackReply(messages, mirrorMbti) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return icebreakerFallback(mirrorMbti);
  }
  const replies = [
    "我明白你为什么这么想。作为 " + mirrorMbti + " 的那一面，我也看到你或许忽略的另一侧。如果放到明天早晨再看，你最不想后悔的是哪一步？",
    "你的顾虑是成立的。换成 " + mirrorMbti + " 的视角，我更在意的是：这个选择里，哪一部分其实是你在替别人做决定？",
    "这里面有你想要的，也有你在回避的。若把\"应该\"两个字拿掉，你真正想走的，是哪条路？",
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}
