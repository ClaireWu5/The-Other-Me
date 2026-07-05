/**
 * Shared OpenAI-compatible LLM client.
 */

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4o-mini";

export function getLlmConfig() {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = normalizeBaseUrl(process.env.LLM_BASE_URL || DEFAULT_BASE_URL);
  const model = process.env.LLM_MODEL || DEFAULT_MODEL;

  return {
    apiKey,
    baseUrl,
    model,
    configured: Boolean(apiKey && apiKey !== "your_api_key_here"),
  };
}

export function getPublicLlmStatus() {
  const config = getLlmConfig();
  return {
    configured: config.configured,
    baseUrl: config.baseUrl,
    model: config.model,
  };
}

export async function createChatCompletion({
  messages,
  temperature = 0.7,
  maxTokens = 300,
  responseFormat,
}) {
  const config = getLlmConfig();

  if (!config.configured) {
    throw new Error("LLM_API_KEY is not configured.");
  }

  const payload = {
    model: config.model,
    temperature,
    max_tokens: maxTokens,
    messages,
  };

  if (responseFormat) {
    payload.response_format = responseFormat;
  }

  const res = await fetch(config.baseUrl + "/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + config.apiKey,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(45000),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error("LLM 接口错误: " + res.status + " " + errText);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || "";
}

function normalizeBaseUrl(baseUrl) {
  return baseUrl.replace(/\/+$/, "");
}
