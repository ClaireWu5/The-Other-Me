/**
 * MBTI 相关工具函数
 */

export const MBTI_TYPES = [
  "ISTJ", "ISFJ", "INFJ", "INTJ",
  "ISTP", "ISFP", "INFP", "INTP",
  "ESTP", "ESFP", "ENFP", "ENTP",
  "ESTJ", "ESFJ", "ENFJ", "ENTJ",
];

const MIRROR_MAP = {
  E: "I",
  I: "E",
  S: "N",
  N: "S",
  T: "F",
  F: "T",
  J: "P",
  P: "J",
};

/**
 * 计算完全镜像人格：将四个字母全部反转
 * 例如：ENTP -> ISFJ
 * @param {string} mbti
 * @returns {string}
 */
export function getMirrorMBTI(mbti) {
  if (!mbti || typeof mbti !== "string") return "";
  return mbti
    .toUpperCase()
    .split("")
    .map((c) => MIRROR_MAP[c] || c)
    .join("");
}
