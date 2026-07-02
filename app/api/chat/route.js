import { NextResponse } from "next/server";
import { buildChatSystemPrompt } from "@/lib/prompts";

export const runtime = "nodejs";

/**
 * POST /api/chat
 * body: { userMbti, mirrorMbti, messages: [{role, content}] }
 * 返回: { reply: string }
 *
 * 兼容 OpenAI Chat Completions 协议（OpenAI / DeepSeek / Moonshot 等）。
 * 若未配置 API Key，回退到本地占位回复，保证 Demo 可跑。
 */
export async function POST(req) {
  try {
    const { userMbti, mirrorMbti, messages = [], mode } = await req.json();

    const systemPrompt = buildChatSystemPrompt({ userMbti, mirrorMbti });
    const apiKey = process.env.LLM_API_KEY;
    const baseUrl = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.LLM_MODEL || "gpt-4o-mini";

    // 无 Key 时的优雅回退，方便无网/无 Key 演示
    if (!apiKey || apiKey === "your_api_key_here") {
      return NextResponse.json({
        reply:
          mode === "icebreaker"
            ? icebreakerFallback(mirrorMbti)
            : fallbackReply(messages, mirrorMbti),
        fallback: true,
      });
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 300,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: `LLM 接口错误: ${res.status} ${errText}` },
        { status: 500 }
      );
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() || "";
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json(
      { error: e?.message || "服务器错误" },
      { status: 500 }
    );
  }
}

/**
 * 破冰开场兜底 —— 无 API Key 时使用。
 * 注意：此刻用户还没说过任何话，必须是"主动开场"，绝不能说"我听见了"。
 */
function icebreakerFallback(mirrorMbti) {
  const openers = [
    `我是你的另一面，那个更接近 ${mirrorMbti} 的你。此刻，有什么念头正在你心里盘旋？`,
    `我住在你思考的另一端。说说看，现在最让你放不下的，是什么？`,
    `我是你不常听见的那个声音。今天，是什么在你心里绕来绕去？`,
  ];
  return openers[Math.floor(Math.random() * openers.length)];
}

/**
 * 常规回复兜底 —— 无 API Key 时使用。
 */
function fallbackReply(messages, mirrorMbti) {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return icebreakerFallback(mirrorMbti);
  }
  const replies = [
    `我明白你为什么这么想。作为 ${mirrorMbti} 的那一面，我也看到你或许忽略的另一侧。如果放到明天早晨再看，你最不想后悔的是哪一步？`,
    `你的顾虑是成立的。换成 ${mirrorMbti} 的视角，我更在意的是：这个选择里，哪一部分其实是你在替别人做决定？`,
    `这里面有你想要的，也有你在回避的。若把"应该"两个字拿掉，你真正想走的，是哪条路？`,
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}
