"use client";

import { motion } from "framer-motion";

/**
 * oOM Logo —— 纯文本排版，两行居中，形成颜文字质感：
 *   oO
 *    M
 * size: "sm" | "md" | "lg"
 */
export default function Logo({ size = "lg", animated = true, tone = "light" }) {
  const sizeMap = {
    sm: { first: "text-2xl", second: "text-base", gap: "-mt-1" },
    md: { first: "text-5xl", second: "text-2xl", gap: "-mt-2" },
    lg: { first: "text-8xl md:text-9xl", second: "text-4xl md:text-5xl", gap: "-mt-3" },
  };
  const s = sizeMap[size] || sizeMap.lg;

  // 亮背景用深色文字，暗背景用白色文字
  const firstColor = tone === "dark" ? "text-[#1c1e26]" : "text-white";
  const secondColor = tone === "dark" ? "text-[#1c1e26]/70" : "text-white/80";

  const Wrapper = animated ? motion.div : "div";
  const animProps = animated
    ? {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 1.2, ease: "easeOut" },
      }
    : {};

  return (
    <Wrapper
      {...animProps}
      className="flex flex-col items-center leading-none select-none font-rounded"
    >
      <span className={`${s.first} font-light tracking-tight ${firstColor}`}>
        <span className="lowercase">o</span>
        <span className="uppercase">O</span>
      </span>
      <span className={`${s.second} ${s.gap} font-light tracking-widest ${secondColor} ml-2`}>
        M
      </span>
    </Wrapper>
  );
}
