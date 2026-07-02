"use client";

/**
 * 极简会话状态：把用户的 Name / MBTI / MirrorMBTI 暂存到 sessionStorage，
 * 供 Onboarding -> Chat 页面间传递。
 */

const KEY = "oom_session";

export function saveSession(data) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    // ignore
  }
}

export function loadSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch (e) {
    // ignore
  }
}
