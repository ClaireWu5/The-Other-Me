# oOM · The Other Me

一款基于荣格八维理论与极简美学的 AI 心理陪伴与决策辅助 Web App。

输入你当前的 MBTI，系统自动匹配"完全镜像人格"（如 `ENTP ↔ ISFJ`），AI 扮演该镜像人格，以极其克制、温柔、无评判（Ash-style）的语调，与你进行内部博弈对话，最终生成《自我整合备忘录》。

## 技术栈

- **Next.js 14** (App Router)
- **Tailwind CSS 3**
- **Framer Motion**（丝滑动画 / 动态水彩背景）
- LLM API（OpenAI 兼容协议：OpenAI / DeepSeek / Moonshot 等）

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（可选，不配也能跑 Demo）
cp .env.example .env
# 编辑 .env 填入你的 LLM_API_KEY / LLM_BASE_URL / LLM_MODEL

# 3. 启动开发服务器
npm run dev
```

打开 http://localhost:3000

> 💡 未配置 API Key 时，接口会自动回退到本地占位回复，保证黑客松现场无网/无 Key 也能演示完整流程。

## 目录结构

```
app/
  layout.js              # 全局布局 + Quicksand 字体 + Aura 背景
  globals.css            # 全局样式
  page.js                # 入场页 (Onboarding /)
  chat/page.js           # 镜像对话页 (/chat)
  api/chat/route.js      # 对话 LLM 接口
  api/memo/route.js      # 备忘录生成接口
components/
  AuraBackground.js      # 动态水彩模糊背景
  Logo.js                # oOM 颜文字 Logo
  TypewriterText.js      # 打字机效果
  SynthesisMemo.js       # 自我整合备忘录卡片（含分享为图片）
  ArchiveDrawer.js       # 潜意识档案馆侧边栏
lib/
  mbti.js                # MBTI 类型 + getMirrorMBTI() 镜像计算
  prompts.js             # 所有 LLM Prompt 模板
  session.js             # 跨页面会话暂存
  useLocalStorage.js     # LocalStorage Hook
```

## 核心交互流

1. **入场页**：输入昵称 + 选择 MBTI → 系统反转四个字母算出镜像人格 → 淡出跳转 `/chat`
2. **对话页**：进入即自动破冰（AI 率先发问），无气泡纯文字排版 + 打字机效果
3. **生成备忘录**：对话 3 轮后浮现按钮 → 生成《镜像共识》卡片（可保存 / 分享为图片）
4. **档案馆**：右上角图标滑出侧边栏，查看历史备忘录
