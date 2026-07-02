"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { toPng } from "html-to-image";

/**
 * 自我整合备忘录卡片
 * props:
 *  - memo: { topic, userVoice, mirrorVoice, action }
 *  - userMbti, mirrorMbti
 *  - onSave(): 存入潜意识
 *  - onHome(): 返回主页
 *  - saved: 是否已保存
 */
export default function SynthesisMemo({
  memo,
  userMbti,
  mirrorMbti,
  onSave,
  onHome,
  saved,
}) {
  const cardRef = useRef(null);
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#0a0a0a",
      });
      const link = document.createElement("a");
      link.download = `oOM-synthesis-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      // ignore
    } finally {
      setSharing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="flex w-full max-w-md flex-col items-center"
    >
      {/* 分享按钮 */}
      <div className="mb-4 flex w-full justify-end">
        <button
          onClick={handleShare}
          disabled={sharing}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 backdrop-blur-md transition-colors hover:bg-white/10"
        >
          {sharing ? "生成中…" : "↗ 分享为图片"}
        </button>
      </div>

      {/* 卡片本体（用于截图） */}
      <div
        ref={cardRef}
        className="w-full rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl"
        style={{ WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="mb-6 text-center">
          <p className="text-xs tracking-[0.3em] text-white/40">THE SYNTHESIS</p>
          <h2 className="mt-2 text-lg font-medium text-white">镜像共识</h2>
        </div>

        <div className="flex flex-col gap-6">
          <Section label="议题">
            <p className="text-base leading-relaxed text-white">{memo.topic}</p>
          </Section>

          <Section label="内部博弈">
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                <p className="mb-1 text-[11px] tracking-widest text-white/40">
                  {userMbti} · 诉求
                </p>
                <p className="text-sm leading-relaxed text-white/85">
                  {memo.userVoice}
                </p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3">
                <p className="mb-1 text-[11px] tracking-widest text-white/40">
                  {mirrorMbti} · 担忧
                </p>
                <p className="text-sm leading-relaxed text-white/85">
                  {memo.mirrorVoice}
                </p>
              </div>
            </div>
          </Section>

          <Section label="Action Item">
            <p className="text-base leading-relaxed text-white">{memo.action}</p>
          </Section>
        </div>

        <div className="mt-8 text-center">
          <span className="text-[11px] tracking-widest text-white/25">
            oOM · The Other Me
          </span>
        </div>
      </div>

      {/* 底部操作 */}
      <div className="mt-6 flex w-full gap-3">
        <button
          onClick={onSave}
          disabled={saved}
          className={`flex-1 rounded-2xl border px-5 py-3 text-sm backdrop-blur-md transition-all ${
            saved
              ? "border-white/5 bg-white/[0.03] text-white/40"
              : "border-white/20 bg-white/10 text-white hover:bg-white/15"
          }`}
        >
          {saved ? "已存入潜意识" : "存入潜意识"}
        </button>
        <button
          onClick={onHome}
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/80 backdrop-blur-md transition-colors hover:bg-white/10"
        >
          返回主页
        </button>
      </div>
    </motion.div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <p className="mb-2 text-[11px] tracking-[0.25em] text-white/40">{label}</p>
      {children}
    </div>
  );
}
