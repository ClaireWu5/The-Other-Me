"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import WatercolorBackground from "@/components/WatercolorBackground";
import { MBTI_TYPES, getMirrorMBTI } from "@/lib/mbti";
import { saveSession } from "@/lib/session";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mbti, setMbti] = useState("");
  const [leaving, setLeaving] = useState(false);

  const canSubmit = name.trim().length > 0 && mbti.length === 4;

  const handleAwaken = () => {
    if (!canSubmit) return;
    const mirror = getMirrorMBTI(mbti);
    saveSession({
      name: name.trim(),
      mbti,
      mirror,
      ts: Date.now(),
    });
    setLeaving(true);
    setTimeout(() => router.push("/chat"), 700);
  };

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.main
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="flex min-h-screen flex-col items-center justify-center px-6"
        >
          <WatercolorBackground tone="bright" id="home" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 flex w-full max-w-sm flex-col items-center"
          >
            {/* Logo */}
            <div className="mb-14">
              <Logo size="lg" tone="light" />
            </div>

            {/* 表单 */}
            <div className="flex w-full flex-col gap-9">
              {/* 名字输入 —— 透明背景 + 底部细白线 */}
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="你的名字 / 昵称"
                  maxLength={20}
                  className="w-full bg-transparent border-0 border-b border-white/30 pb-2 text-center text-lg text-white outline-none transition-colors placeholder:text-white/50 focus:border-white/70"
                />
              </div>

              {/* MBTI 下拉 —— 极简毛玻璃 */}
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <select
                    value={mbti}
                    onChange={(e) => setMbti(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-center text-base text-white outline-none backdrop-blur-md transition-colors focus:border-white/40"
                    style={{ WebkitBackdropFilter: "blur(12px)" }}
                  >
                    <option value="" disabled>
                      你当前的 MBTI
                    </option>
                    {MBTI_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/50">
                    ▾
                  </span>
                </div>

                {/* 镜像预览 */}
                <AnimatePresence>
                  {mbti && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center text-xs text-white/60"
                    >
                      另一个我 · {getMirrorMBTI(mbti)}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* 唤醒按钮 */}
            <motion.button
              onClick={handleAwaken}
              disabled={!canSubmit}
              whileTap={canSubmit ? { scale: 0.97 } : {}}
              className={`mt-16 w-full rounded-2xl border px-6 py-4 text-base tracking-wide backdrop-blur-md transition-all duration-300 ${
                canSubmit
                  ? "border-white/25 bg-white/15 text-white hover:bg-white/25"
                  : "border-white/10 bg-white/[0.06] text-white/40"
              }`}
              style={{ WebkitBackdropFilter: "blur(12px)" }}
            >
              开始向内探索
            </motion.button>
          </motion.div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}
