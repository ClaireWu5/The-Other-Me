"use client";

import { motion } from "framer-motion";

/**
 * WatercolorBackground —— 通用「水彩滴入清水」流体背景
 *
 * 视觉目标：
 *  - 四团 MBTI 色（深靛蓝 / 灰紫 / 水绿 / 赭橙）像颜料滴入水中：
 *    彼此靠近时边缘会"粘连融合"，远离时又"各自独立成形" —— 融合又独立。
 *  - 明显但优雅的极缓流动 + 旋涡呼吸（位移 / 缩放 / 旋转 / 液滴形变叠加）。
 *  - 几颗小水珠 / 星光点缀。
 *
 * 实现关键：
 *  - 用 SVG "gooey" 滤镜（feGaussianBlur + feColorMatrix 提高 alpha 对比）
 *    制造真正的"液体粘连/分离"效果，而不是把所有色团糊成一片。
 *  - 每团颜料用不规则且随时间变化的 borderRadius，模拟真实液滴形变。
 *  - 通过 tone prop 复用于首页（bright）与对话页（soft），保证视觉连贯不跳跃。
 *
 * @param {"bright"|"soft"} tone  bright=首页较亮基底；soft=对话页略柔和但仍明亮
 * @param {string} id  滤镜唯一 id（同页多实例时避免冲突）
 */
export default function WatercolorBackground({ tone = "bright", id = "wc" }) {
  const gooId = `goo-${id}`;

  // 基底：两页同色系，仅明度不同 —— 让首页↔对话页过渡丝滑
  const baseGradient =
    tone === "soft"
      ? // 对话页：略柔和沉静，但依旧明亮通透（不再纯黑）
        "radial-gradient(125% 125% at 50% 38%, #aeb6c6 0%, #949cb0 55%, #7d8497 100%)"
      : // 首页：明亮清透
        "radial-gradient(120% 120% at 50% 40%, #b7bece 0%, #9aa2b6 55%, #838b9f 100%)";

  const vignette =
    tone === "soft"
      ? "radial-gradient(circle at center, transparent 52%, rgba(60,66,86,0.32) 100%)"
      : "radial-gradient(circle at center, transparent 55%, rgba(60,66,86,0.24) 100%)";

  // 四团颜料对应 MBTI 四个维度轴
  const paints = [
    {
      // 深靛蓝 —— E/I
      color: "rgba(46, 82, 168, 0.9)",
      size: 460,
      initial: { top: "6%", left: "10%" },
      animate: {
        x: [0, 150, 60, 120, 0],
        y: [0, 90, 180, 70, 0],
        scale: [1, 1.15, 0.92, 1.08, 1],
        borderRadius: [
          "42% 58% 63% 37% / 41% 44% 56% 59%",
          "60% 40% 42% 58% / 55% 48% 52% 45%",
          "38% 62% 55% 45% / 62% 38% 62% 38%",
          "50% 50% 48% 52% / 45% 55% 45% 55%",
          "42% 58% 63% 37% / 41% 44% 56% 59%",
        ],
      },
      duration: 30,
    },
    {
      // 灰紫 —— S/N
      color: "rgba(140, 102, 186, 0.88)",
      size: 420,
      initial: { top: "8%", left: "52%" },
      animate: {
        x: [0, -130, 40, -90, 0],
        y: [0, 120, 60, 150, 0],
        scale: [1, 0.9, 1.2, 1.0, 1],
        borderRadius: [
          "55% 45% 40% 60% / 50% 60% 40% 50%",
          "40% 60% 62% 38% / 42% 46% 54% 58%",
          "63% 37% 45% 55% / 58% 42% 58% 42%",
          "48% 52% 55% 45% / 52% 48% 52% 48%",
          "55% 45% 40% 60% / 50% 60% 40% 50%",
        ],
      },
      duration: 36,
    },
    {
      // 水绿 —— T/F
      color: "rgba(52, 174, 146, 0.88)",
      size: 440,
      initial: { top: "46%", left: "14%" },
      animate: {
        x: [0, 140, 70, 170, 0],
        y: [0, -110, -40, -130, 0],
        scale: [1, 1.14, 0.9, 1.12, 1],
        borderRadius: [
          "48% 52% 58% 42% / 55% 45% 55% 45%",
          "62% 38% 40% 60% / 45% 58% 42% 55%",
          "40% 60% 55% 45% / 60% 40% 60% 40%",
          "52% 48% 46% 54% / 48% 52% 48% 52%",
          "48% 52% 58% 42% / 55% 45% 55% 45%",
        ],
      },
      duration: 33,
    },
    {
      // 赭橙 —— J/P
      color: "rgba(220, 128, 60, 0.86)",
      size: 400,
      initial: { top: "48%", left: "54%" },
      animate: {
        x: [0, -140, -50, -160, 0],
        y: [0, -90, -150, -60, 0],
        scale: [1, 1.18, 0.9, 1.1, 1],
        borderRadius: [
          "60% 40% 45% 55% / 45% 55% 45% 55%",
          "42% 58% 60% 40% / 58% 42% 58% 42%",
          "55% 45% 38% 62% / 40% 60% 40% 60%",
          "50% 50% 52% 48% / 52% 48% 52% 48%",
          "60% 40% 45% 55% / 45% 55% 45% 55%",
        ],
      },
      duration: 39,
    },
  ];

  // 水珠点缀
  const droplets = [
    { top: "22%", left: "30%", size: 10, delay: 0 },
    { top: "68%", left: "72%", size: 7, delay: 2 },
    { top: "40%", left: "80%", size: 5, delay: 4 },
    { top: "78%", left: "24%", size: 8, delay: 1 },
    { top: "16%", left: "66%", size: 5, delay: 3 },
    { top: "58%", left: "44%", size: 6, delay: 5 },
  ];

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 overflow-hidden"
      style={{ background: baseGradient }}
    >
      {/* SVG gooey 滤镜定义：让色团靠近时融合、远离时独立 */}
      <svg
        className="absolute h-0 w-0"
        style={{ position: "absolute" }}
        aria-hidden
      >
        <defs>
          <filter id={gooId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="26" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11"
              result="goo"
            />
            {/* 把原图叠回，保留每团颜料的核心色，实现"融合又独立" */}
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* 颜料流体层：应用 gooey 滤镜 */}
      <div
        className="absolute inset-0"
        style={{
          filter: `url(#${gooId}) saturate(1.1)`,
        }}
      >
        {paints.map((p, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: p.size,
              height: p.size,
              top: p.initial.top,
              left: p.initial.left,
              background: `radial-gradient(circle at 42% 38%, ${p.color} 0%, ${p.color.replace(
                /0\.\d+\)/,
                "0.55)"
              )} 45%, transparent 70%)`,
            }}
            animate={p.animate}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 轻毛玻璃收边，制造湿润晕染（比之前更轻，保留色团独立感） */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />

      {/* 水珠 / 星光点缀 */}
      {droplets.map((d, i) => (
        <motion.div
          key={`drop-${i}`}
          className="absolute rounded-full"
          style={{
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            background:
              "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0) 70%)",
            boxShadow:
              "0 1px 4px rgba(40,46,66,0.3), inset 0 0 3px rgba(255,255,255,0.9)",
          }}
          animate={{
            opacity: [0.4, 0.9, 0.4],
            scale: [1, 1.25, 1],
            y: [0, -6, 0],
          }}
          transition={{
            duration: 6 + i,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* 极轻暗角，收拢视觉、提升文字可读性 */}
      <div className="absolute inset-0" style={{ background: vignette }} />
    </div>
  );
}
