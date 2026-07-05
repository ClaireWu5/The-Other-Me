import { NextResponse } from "next/server";
import { buildChatSystemPrompt, buildMemoPrompt } from "@/lib/prompts";
import { createChatCompletion, getLlmConfig, getPublicLlmStatus } from "@/lib/llm";

export const runtime = "nodejs";

/**
 * POST /api/memo
 * body: { userMbti, mirrorMbti, messages: [{role, content}] }
 * 返回: { memo: { topic, userVoice, mirrorVoice, action } }
 */
export async function POST(req) {
  try {
    const { userMbti, mirrorMbti, messages = [] } = await req.json();
    const llm = getPublicLlmStatus();

    if (!getLlmConfig().configured) {
      return NextResponse.json({
        memo: fallbackMemo(userMbti, mirrorMbti),
        fallback: true,
        llm,
      });
    }

    const systemPrompt = buildChatSystemPrompt({ userMbti, mirrorMbti });
    const memoPrompt = buildMemoPrompt({ userMbti, mirrorMbti });
    const raw = await createChatCompletion({
      temperature: 0.6,
      maxTokens: 500,
      responseFormat: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        ...normalizeMessages(messages),
        { role: "user", content: memoPrompt },
      ],
    });

    return NextResponse.json({
      memo: safeParseMemo(raw, userMbti, mirrorMbti),
      fallback: false,
      llm,
    });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "服务器错误" }, { status: 500 });
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

function safeParseMemo(raw, userMbti, mirrorMbti) {
  try {
    const fence = String.fromCharCode(96, 96, 96);
    let cleaned = raw.trim();
    if (cleaned.startsWith(fence)) {
      const firstBreak = cleaned.indexOf("\n");
      cleaned = firstBreak >= 0 ? cleaned.slice(firstBreak + 1) : cleaned.slice(fence.length);
      if (cleaned.endsWith(fence)) {
        cleaned = cleaned.slice(0, -fence.length);
      }
    }

    const obj = JSON.parse(cleaned.trim());
    return {
      topic: obj.topic || "",
      userVoice: obj.userVoice || "",
      mirrorVoice: obj.mirrorVoice || "",
      action: obj.action || "",
    };
  } catch (e) {
    return fallbackMemo(userMbti, mirrorMbti);
  }
}

function fallbackMemo(userMbti, mirrorMbti) {
  return {
    topic: "在前进与停留之间的一次自我权衡。",
    userVoice: userMbti + "：想抓住当下的可能，不愿被犹豫拖住。",
    mirrorVoice: mirrorMbti + "：提醒你为选择留一点余地与根基。",
    action: "先做一件可逆的小事，用行动收集信息，明早再决定方向。",
  };
}
