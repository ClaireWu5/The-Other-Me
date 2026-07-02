"use client";

import { motion, AnimatePresence } from "framer-motion";

/**
 * 潜意识档案馆 —— 从右侧滑出的毛玻璃侧边栏
 * props:
 *  - open: boolean
 *  - onClose()
 *  - items: 备忘录数组（按时间倒序）
 *  - onSelect(item): 点击查看某条
 */
export default function ArchiveDrawer({ open, onClose, items = [], onSelect }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
            style={{ backdropFilter: "blur(2px)" }}
          />

          {/* 抽屉 */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}
            className="fixed right-0 top-0 z-50 flex h-full w-[85%] max-w-sm flex-col border-l border-white/10 bg-white/[0.06] backdrop-blur-2xl"
            style={{ WebkitBackdropFilter: "blur(24px)" }}
          >
            <div className="flex items-center justify-between px-6 pt-8 pb-4">
              <h3 className="text-base font-medium tracking-wide text-white">
                潜意识档案
              </h3>
              <button
                onClick={onClose}
                className="text-white/50 transition-colors hover:text-white"
                aria-label="关闭"
              >
                ✕
              </button>
            </div>

            <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-8">
              {items.length === 0 ? (
                <p className="mt-16 text-center text-sm text-white/30">
                  还没有存入的备忘录。
                  <br />
                  与另一个我对话后，记忆会沉淀在这里。
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => onSelect && onSelect(item)}
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition-colors hover:bg-white/[0.08]"
                      >
                        <p className="mb-1 text-[11px] tracking-wider text-white/35">
                          {formatDate(item.ts)} · {item.userMbti} ↔ {item.mirrorMbti}
                        </p>
                        <p className="line-clamp-2 text-sm leading-relaxed text-white/85">
                          {item.memo?.topic || "（无议题）"}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function formatDate(ts) {
  try {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  } catch (e) {
    return "";
  }
}
