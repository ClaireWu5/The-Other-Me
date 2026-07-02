"use client";

import { motion } from "framer-motion";

/**
 * The Aura —— 全局动态水彩模糊背景
 * 深色底 (#0a0a0a) + 4 个低饱和度光晕在背景中极其缓慢地漂浮交融，
 * 叠加极强毛玻璃模糊 (blur ~100px)，营造水彩晕染质感。
 */
export default function AuraBackground() {
  const blobs = [
    {
      // 雾霾蓝
      color: "rgba(107, 140, 174, 0.45)",
      size: 520,
      initial: { top: "8%", left: "12%" },
      animate: {
        x: [0, 80, -40, 0],
        y: [0, 60, 100, 0],
        scale: [1, 1.15, 0.95, 1],
      },
      duration: 26,
    },
    {
      // 琥珀黄
      color: "rgba(212, 165, 116, 0.38)",
      size: 460,
      initial: { top: "50%", left: "62%" },
      animate: {
        x: [0, -90, 50, 0],
        y: [0, -50, 40, 0],
        scale: [1, 0.9, 1.2, 1],
      },
      duration: 32,
    },
    {
      // 水绿
      color: "rgba(127, 176, 160, 0.4)",
      size: 500,
      initial: { top: "62%", left: "10%" },
      animate: {
        x: [0, 70, 120, 0],
        y: [0, -70, -30, 0],
        scale: [1, 1.1, 0.85, 1],
      },
      duration: 29,
    },
    {
      // 灰紫
      color: "rgba(145, 132, 168, 0.42)",
      size: 440,
      initial: { top: "18%", left: "58%" },
      animate: {
        x: [0, -60, -110, 0],
        y: [0, 80, 30, 0],
        scale: [1, 1.18, 1, 1],
      },
      duration: 35,
    },
  ];

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 overflow-hidden"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            top: blob.initial.top,
            left: blob.initial.left,
            background: `radial-gradient(circle at center, ${blob.color} 0%, transparent 70%)`,
            filter: "blur(60px)",
          }}
          animate={blob.animate}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      ))}

      {/* 顶层极强毛玻璃模糊，让光晕彼此交融晕染 */}
      <div
        className="absolute inset-0"
        style={{ backdropFilter: "blur(100px)", WebkitBackdropFilter: "blur(100px)" }}
      />

      {/* 轻微暗角 / 噪点氛围，压低背景避免过亮 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 40%, rgba(10,10,10,0.55) 100%)",
        }}
      />
    </div>
  );
}
