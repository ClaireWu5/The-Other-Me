"use client";

import { useEffect, useState } from "react";

/**
 * 打字机效果组件：把 text 逐字缓缓浮现。
 * onDone: 打字结束回调（用于滚动 / 显示光标等）
 * speed: 每字间隔 ms
 */
export default function TypewriterText({
  text = "",
  speed = 45,
  className = "",
  onDone,
  onTick,
}) {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplay("");
    setDone(false);
    if (!text) return;

    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setDisplay(text.slice(0, i));
      if (onTick) onTick();
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
        if (onDone) onDone();
      }
    }, speed);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);

  return (
    <span className={className}>
      {display}
      {!done && <span className="cursor-blink text-white/50">▍</span>}
    </span>
  );
}
