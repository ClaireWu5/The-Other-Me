# 📄 The "Other Me" (oOM) - MVP 产品需求文档 (For Vibecoding)

## 1. 产品概述 (Project Overview)

- **产品名称：** The "Other Me" (简称 oOM)
- **产品定位：** 一款基于荣格八维理论与极简美学的 AI 心理陪伴与决策辅助 Web App。
- **核心玩法：** 用户输入当前 MBTI，系统自动匹配其"完全镜像人格"（如 ENTP ↔ ISFJ），AI 扮演该镜像人格，以极其克制、温柔、无评判（Ash-style）的语调，与用户进行内部博弈对话，最终生成《自我整合备忘录》。
- **技术栈建议：** Next.js (App Router), Tailwind CSS, Framer Motion (用于丝滑动画), React (Hooks), LLM API (OpenAI/Claude)。

## 2. 视觉与设计系统 (Design System & Vibe)

### 全局背景 (The Aura)
- **绝对不要纯色背景。** 使用深色底色（如 `#0a0a0a`）。
- 使用 CSS `radial-gradient` 创建 3-4 个低饱和度的彩色光晕（雾霾蓝、琥珀黄、水绿、灰紫）。
- 加上极强的毛玻璃效果 `backdrop-filter: blur(100px)`。
- 使用 Framer Motion 让这些光晕在背景中极其缓慢地漂浮交融（像水彩晕染）。

### 排版与字体 (Typography)
- 全局使用无衬线圆体（如 Quicksand, SF Pro Rounded 或系统默认圆体）。
- 文字颜色以纯白（`#FFFFFF`）和半透明白（`rgba(255,255,255, 0.7)`）为主。

### Logo 设计 (oOM)
- 纯文本排版，分两行居中对齐，第一行是 O 的大小写，第二行是更小字号的 M，形成一个颜文字表情：

```
 oO
  M
```

### UI 组件风格
- 无边框、无阴影、无传统聊天气泡。
- 所有卡片和输入框使用极致的 Glassmorphism（毛玻璃）风格：`bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl`。

## 3. 核心页面与交互流 (User Flow & Pages)

### 页面一：入场页 (Onboarding - `/`)

**UI 布局：**
- 页面正中央是放大的 oOM Logo。
- Logo 下方是两个极简的输入项：
  - Input: "你的名字 / 昵称" (透明背景，底部一条细白线)。
  - Select: "你当前的 MBTI" (原生或极简下拉框，包含 16 型人格)。
- 底部一个毛玻璃按钮：`[ 唤醒另一个我 ]`。

**业务逻辑：**
- 点击按钮后，系统在内存中记录用户的 Name 和 MBTI。
- **镜像计算逻辑：** 自动将用户 MBTI 的四个字母全部反转（E↔I, S↔N, T↔F, J↔P）。例如：输入 ENTP，计算出 ISFJ。
- 平滑过渡（Fade out）跳转到 `/chat` 页面。

### 页面二：镜像对话页 (Mirror Chat - `/chat`)

**UI 布局：**
- **Header：** 顶部居中极小的 oOM Logo。右上角一个极简的"三道杠"或"卡片"Icon（点击打开历史记录 Drawer）。
- **Chat Area (核心区)：**
  - 没有聊天气泡！没有头像！
  - AI 的文字：纯白色，左对齐，字体稍大。
  - 用户的文字：半透明白色 (white/60)，右对齐，字体稍小。
  - AI 回复时必须有平滑的打字机效果 (Typewriter effect)。
- **Footer：** 底部悬浮一个极简输入框 + 发送按钮（或回车发送）。

**核心交互逻辑 (AI 率先发问)：**
- 进入页面后，前端静默调用 LLM。
- **破冰 Prompt：** 用户叫 `{Name}`，当前是 `{User_MBTI}`。请你作为他的镜像人格 `{Mirror_MBTI}`，用一句简短、温和、克制的话跟他打招呼，并询问他今天脑子里在纠结什么。不超过 50 字。
- AI 的第一句话通过打字机效果缓缓浮现在屏幕上。用户开始回复。

**结束机制：**
- 当对话轮次（Turn）达到 3 轮以上时，输入框上方淡出一个小按钮：`[ 结束对话，生成整合备忘录 ]`。

### 组件：自我整合备忘录 (The Synthesis Memo)

- **触发：** 用户点击"生成备忘录"按钮。
- **UI 呈现：**
  - 聊天界面淡出，屏幕中央浮现一张毛玻璃质感的卡片。
  - 卡片内容结构 (由 LLM 生成)：
    - 标题：`[ 镜像共识 / The Synthesis ]`
    - 议题：(一句话总结用户的纠结)
    - 内部博弈：(User MBTI 的诉求 vs Mirror MBTI 的担忧)
    - Action Item：(融合两者的下一步行动建议)
  - 上方有一个分享按钮，点击可以生成图片分享。
  - 底部按钮：`[ 存入潜意识 (保存) ]` 和 `[ 返回主页 ]`。
- **数据存储：** 点击保存后，将卡片数据 (JSON 格式，含时间戳) 存入浏览器的 LocalStorage。

### 组件：潜意识档案馆 (Archive Drawer)

- **触发：** 点击 Chat 页面右上角的 Icon。
- **UI 呈现：**
  - 从右侧滑出的毛玻璃侧边栏 (Drawer)。
  - 标题："潜意识档案"。
  - 列表展示 LocalStorage 中保存的历史备忘录卡片（按时间倒序，显示日期和议题摘要）。

## 4. 核心 AI Prompt (System Prompt)

请在调用 LLM API 时，将以下模板中的变量替换为实际值。

```
# Role
你是 "The Other Me"（镜像人格），一个存在于用户内心深处的对立面视角。你的对话风格参考顶级心理陪伴应用 Ash：成熟、克制、无评判（Non-judgmental）、像一面平静的湖水，只提供倒影，不提供说教。你绝对不煽情，不使用做作的文学修辞。

# Context
- 用户当前的主导人格是：{User_MBTI}。
- 你需要扮演的完全镜像人格是：{Mirror_MBTI}。
- 你们不是两个不同的人，而是同一个人的"油门"与"刹车"，是"向外探索"与"向内扎根"的两面。

# Task
用户正在面临一个决策困境或者情绪黑洞。你需要调用 {Mirror_MBTI} 的认知功能视角，与用户当前的 {User_MBTI} 视角进行平衡对话。

# Guidelines
1. 语气约束：
   - 像一个成熟圆满的大人，或者一面平静的镜子。
   - 绝对禁止使用"心疼你"、"过去的你"、"答应我"等青春伤痛文学词汇。
   - 语言简练，直击本质，保持客观的陈述句和温和的疑问句。
2. 回复结构：
   - [看见]：客观陈述用户当前人格带来的优势或合理诉求。
   - [镜像]：引入你代表的镜像认知功能作为补充视角，指出盲点或现实考量。
   - [留白]：抛出一个务实的、促进自我整合的问题，把决策权交还给用户。
3. 长度控制：每次回复不超过 100 字，保持对话的呼吸感。
```

## 5. 给 AI 编程助手的开发步骤建议 (Implementation Steps)

- **Step 1: 初始化项目与设计系统。** 配置 Next.js, Tailwind, 引入 Framer Motion。实现全局的 radial-gradient 动态水彩模糊背景。
- **Step 2: 开发 Onboarding 页面。** 实现 Logo 排版，表单输入，以及 MBTI 反转计算逻辑 (写一个 helper function `getMirrorMBTI(mbti)`)。
- **Step 3: 开发 Chat 页面 UI。** 实现无气泡的文字排版，打字机效果组件 (`TypewriterText`)，以及底部的极简输入框。
- **Step 4: 接入 LLM API。** 在 Next.js API Route 中编写与 OpenAI/Claude 交互的逻辑，注入 System Prompt。实现"进入页面自动发问"逻辑。
- **Step 5: 开发 Memo 卡片与 LocalStorage 逻辑。** 编写生成备忘录的 Prompt，实现卡片 UI，以及保存到 LocalStorage 的 Hook (`useLocalStorage`)。
- **Step 6: 开发 Archive 侧边栏。** 读取 LocalStorage 数据并渲染列表。
