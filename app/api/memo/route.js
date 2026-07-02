import { NextResponse } from "next/server";
import { buildChatSystemPrompt, buildMemoPrompt } from "@/lib/prompts";

export const runtime = "nodejs";

/**
 * POST /api/memo
 * body: { userMbti, mirrorMbti, messages: [{role, content}] }
 * 返回: { memo: { topic, userVoice, mirrorVoice, action } }
 */
export async function POST(req) {
  try {
    const { userMbti, mirrorMbti, messages = [] } = await req.json();

    const systemPrompt = buildChatSystemPrompt({ userMbti, mirrorMbti });
    const memoPrompt = buildMemoPrompt({ userMbti, mirrorMbti });

    const apiKey = process.env.LLM_API_KEY;
    const baseUrl = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.LLM_MODEL || "gpt-4o-mini";

    if (!apiKey || apiKey === "your_api_key_here") {
      return NextResponse.json({ memo: fallbackMemo(userMbti, mirrorMbti), fallback: true });
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.6,
        max_tokens: 500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
          { role: "user", content: memoPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `LLM 接口错误: ${res.status} ${errText}` }, { status: 500 });
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content?.trim() || "{}";
    const memo = safeParseMemo(raw, userMbti, mirrorMbti);
    return NextResponse.json({ memo });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "服务器错误" }, { status: 500 });
  }
}

function safeParseMemo(raw, userMbti, mirrorMbti) {
  try {
    // 去除可能的 ```json ``` 包裹
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const obj = JSON.parse(cleaned);
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
    userVoice: `${userMbti}：想抓住当下的可能，不愿被犹豫拖住。`,
    mirrorVoice: `${mirrorMbti}：提醒你为选择留一点余地与根基。`,
    action: "先做一件可逆的小事，用行动收集信息，明早再决定方向。",
  };
}
