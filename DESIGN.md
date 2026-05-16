# Design System — DartBinEditor

**概念：Ink & Circuit（墨水与电路）**

一个兼顾温暖书写体验与精准开发工具的设计体系。文案创作区的温润墨感 + 工具面板的精密电路感 + AI 交互的琥珀光晕。

---

## 设计理念

DartBinEditor 的 UI 需要同时服务两种心智模式：

| 模式 | 场景 | 视觉感受 |
|------|------|---------|
| **写作模式** | 写文章、做笔记、阅读 | 温润、安静、纸张质感、低干扰 |
| **工具模式** | 搜索文件、查看图谱、Git 操作、代码编辑 | 精准、清晰、结构化、响应迅速 |
| **AI 模式** | AI 对话、生成内容、改写 | 琥珀色光晕、流动感、智能氛围 |

三种模式无缝切换，通过色彩和微交互自然地引导注意力。

---

## 技术栈

- **框架：** React 18 + TypeScript + Tauri v2
- **样式：** Tailwind CSS v4
- **组件：** Shadcn/ui（Radix UI 原语）
- **图标：** Lucide React
- **字体：**
  - UI / 正文：**DM Sans** — 干净但温暖，替代冰冷的 Inter
  - 显示/标题：**Literata** — 为长文阅读设计的衬线体
  - 代码/技术标签：**JetBrains Mono** — 开发者首选，中文支持良好
  - 中文后备：**Noto Sans SC**（UI）/ **Noto Serif SC**（阅读）
- **暗色模式：** 系统跟随 + 手动切换，class 驱动
- **工具函数：** `cn()` 来自 `@/lib/utils`

---

## 视觉方向

### 色彩体系

使用 OKLCH 色空间，确保跨设备色彩一致性。

#### 主色调

| 名称 | OKLCH 值 | 用途 |
|------|---------|------|
| **墨蓝 (Ink Blue)** | `oklch(0.55 0.15 260)` | 主色，按钮/链接/焦点 |
| **琥珀 (Amber)** | `oklch(0.72 0.18 70)` | AI 交互色，命令提示，高亮 |
| **墨绿 (Ink Teal)** | `oklch(0.6 0.12 185)` | 图谱连接，成功状态 |
| **暖灰 (Warm Gray)** | `oklch(0.5 0.02 85)` | 次要文本、禁用状态 |

#### Light Mode

| Token | OKLCH | 用途 |
|-------|-------|------|
| `background` | `oklch(0.97 0.01 85)` | 暖白纸色背景 |
| `foreground` | `oklch(0.15 0.03 250)` | 深墨色文字 |
| `card` | `oklch(0.99 0.005 85 / 85%)` | 半透面板 |
| `card-foreground` | `oklch(0.2 0.03 250)` | 面板文字 |
| `primary` | `oklch(0.55 0.15 260)` | 墨蓝色主按钮 |
| `primary-foreground` | `oklch(0.98 0.01 85)` | 主按钮文字 |
| `accent` | `oklch(0.72 0.18 70)` | 琥珀色强调/AI |
| `accent-foreground` | `oklch(0.15 0.03 250)` | 强调文字 |
| `editor-surface` | `oklch(1 0 0)` | 编辑区纯白底 |
| `code-surface` | `oklch(0.945 0.008 260)` | 代码块底色 |
| `muted` | `oklch(0.92 0.01 85)` | 次要表面 |
| `muted-foreground` | `oklch(0.55 0.025 85)` | 辅助文字 |
| `border` | `oklch(0.85 0.015 85 / 60%)` | 边框色 |
| `ring` | `oklch(0.55 0.15 260)` | 焦点环（墨蓝） |
| `destructive` | `oklch(0.58 0.21 31)` | 删除/错误 |
| `sidebar-bg` | `oklch(0.94 0.008 88)` | 侧栏暖灰背景 |
| `graph-grid` | `oklch(0.9 0.015 220 / 40%)` | 图谱网格线 |

#### Dark Mode

| Token | OKLCH | 用途 |
|-------|-------|------|
| `background` | `oklch(0.12 0.015 255)` | 深石板背景 |
| `foreground` | `oklch(0.93 0.01 88)` | 暖白文字 |
| `card` | `oklch(0.16 0.02 255 / 80%)` | 半透深色面板 |
| `card-foreground` | `oklch(0.93 0.01 88)` | 面板文字 |
| `primary` | `oklch(0.65 0.18 260)` | 亮墨蓝 |
| `primary-foreground` | `oklch(0.15 0.02 255)` | 主按钮文字 |
| `accent` | `oklch(0.75 0.2 70)` | 琥珀色强调/AI |
| `accent-foreground` | `oklch(0.12 0.01 70)` | 强调文字 |
| `editor-surface` | `oklch(0.14 0.02 260)` | 编辑区深色底 |
| `code-surface` | `oklch(0.1 0.015 260 / 50%)` | 代码块底色 |
| `muted` | `oklch(0.18 0.02 255 / 60%)` | 次要表面 |
| `muted-foreground` | `oklch(0.65 0.03 88)` | 辅助文字 |
| `border` | `oklch(0.25 0.02 255 / 50%)` | 边框色 |
| `ring` | `oklch(0.65 0.18 260)` | 焦点环（亮墨蓝） |
| `destructive` | `oklch(0.68 0.21 31)` | 删除/错误 |
| `sidebar-bg` | `oklch(0.1 0.015 260 / 70%)` | 侧栏背景 |
| `graph-grid` | `oklch(0.3 0.04 260 / 25%)` | 图谱网格线 |

---

## 排版

| Token | 字体 | 用途 |
|-------|------|------|
| `--font-ui` | DM Sans | UI 控件、标签、按钮、侧栏 |
| `--font-display` | Literata | 标题、文章标题、欢迎页 |
| `--font-code` | JetBrains Mono | 代码块、技术标签、行号 |
| `--font-body` | DM Sans | 编辑区正文 |
| `--font-cn-ui` | Noto Sans SC | 中文 UI 回退 |
| `--font-cn-body` | Noto Serif SC | 中文阅读回退 |

### 字号层级

```
text-xs   → 12px 技术标签、行号
text-sm   → 14px 侧栏文件列表、状态栏
text-base → 16px UI 正文、编辑区
text-lg   → 18px 小标题
text-xl   → 20px 卡片标题
text-2xl  → 24px 章节标题
text-3xl+ → 30px+ 页面主标题 (display)
```

### 排版规则

- **UI 标签**：`font-ui text-xs uppercase tracking-widest` — 小号大写，宽松间距
- **显示标题**：`font-display text-3xl font-semibold leading-tight`
- **编辑区正文**：`font-body text-base leading-7` — 舒适的阅读行高
- **代码块**：`font-code text-sm leading-6` — 代码专用
- **侧栏文件**：`font-ui text-sm` — 干净的文件列表

---

## 布局

### 主窗口布局

```
┌────────────────────────────────────────────────┐
│ 自定义标题栏 (Tauri)                            │
├──────┬─────────────────────────────────────────┤
│      │  ┌─ 标签栏 ──────────────────────────┐  │
│ 侧栏 │  │  file1.md | file2.md | +          │  │
│      │  ├────────────────────────────────────┤  │
│ 可   │  │  编辑区 (TipTap WYSIWYG)           │  │
│ 折   │  │  → 实时内联渲染                    │  │
│ 叠   │  │  → 沉浸式书写                      │  │
│      │  │  → 代码高亮                        │  │
│      │  │                                    │  │
│ • 文件│  └────────────────────────────────────┘  │
│ • 搜索│  ┌─ 状态栏 ──────────────────────────┐  │
│ • 大纲│  │ Ln 10  Col 42  UTF-8  Words 128   │  │
│ • 标签└──┴────────────────────────────────────┘  │
├────────────────────────────────────────────────┤
│ 底部面板 (可伸缩)                                │
│ 反向链接 | 搜索结果 | Git | AI 对话              │
└────────────────────────────────────────────────┘
```

### 布局规则

- 侧栏默认宽度 260px，可折叠，可拖拽调整
- 编辑区占据剩余空间，内容居中区域最大 780px（阅读宽度）
- 底部面板默认收起，展开高度 280px
- 标签栏高度 40px，状态栏高度 28px
- 所有面板都支持拖拽调整大小

---

## 组件样式

### 按钮

```
Primary:   bg-primary text-primary-foreground rounded-lg px-4 py-2 
           hover:brightness-110 active:scale-[0.98]

Secondary: bg-muted text-foreground rounded-lg px-4 py-2
           hover:bg-border

Ghost:     text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg px-2 py-1

Icon:      p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground
```

### 卡片 / 面板

```tsx
<div className="rounded-xl bg-card backdrop-blur-sm border border-border/50 shadow-sm">
```

- 编辑器面板：无边框、无背景干扰
- 侧栏卡片：半透明毛玻璃效果
- 搜索预览卡片：带阴影，悬浮抬起

### 输入框

```tsx
<input className="rounded-lg bg-editor-surface border border-border/60
                  focus:border-ring focus:ring-[2px] focus:ring-ring/30
                  placeholder:text-muted-foreground/60 ..." />
```

### 侧栏（文件树/搜索/大纲）

- 背景色 `bg-sidebar-bg`，与主编辑区明显区分
- 文件项 hover 有淡底色
- 当前激活文件项有 `bg-primary/10 text-primary` 高亮
- 图标和文字间距有序，不拥挤

### 标签页

- 顶部标签栏：`h-10 bg-muted/50` 底色
- 激活标签：`bg-editor-surface` 白色切角
- 未激活标签：hover 显示关闭按钮
- 文件修改标识：圆点表示未保存

### AI 面板

- 琥珀色边框发光：`border-accent/30 shadow-[0_0_12px_-4px_var(--accent)]`
- 消息气泡：用户消息用 `bg-primary/10`，AI 消息用 `bg-accent/10`
- 流式打字效果：文字渐入动画
- 模型切换器：上方下拉，显示模型名称和状态

---

## 交互细节

### 过渡动画

```
| 场景 | 动画 | 时长 | 缓动 |
|------|------|------|------|
| 侧栏展开/收起 | width + opacity | 200ms | ease-out |
| 标签页切换 | opacity | 150ms | ease |
| 底部面板展开 | height | 250ms | ease-out |
| AI 消息流式出现 | 逐字 opacity 渐入 | — | linear |
| 搜索结果显示 | stagger 50ms | 200ms | ease-out |
| 悬浮按钮提升 | translateY(-1px) | 150ms | ease-out |
| 模态框出现 | scale(0.96→1) + opacity | 200ms | ease-out |
```

### 反馈

- 所有可点击元素有 hover 状态
- 保存操作：毫秒级自动保存，无需手动点击
- 长操作（搜索、AI 请求）：底部面板显示进度/加载状态
- 焦点环始终可见：`focus-visible:ring-2 focus-visible:ring-ring/50`

### 键盘快捷键

- VS Code 风格快捷键体系（`Ctrl+S` 保存，`Ctrl+P` 搜索文件等）
- 命令面板（`Ctrl+Shift+P`）贯穿所有操作
- 快捷键提示在菜单项和悬浮提示中显示

---

## 文档结构

```
app/
├── globals.css        # 所有 CSS 变量 + Tailwind @theme
├── layout.tsx         # 根布局 + 主题提供商
├── page.tsx           # 默认空白/欢迎页
├── editor/
│   └── page.tsx       # 编辑器主页面
├── settings/
│   └── page.tsx       # 设置页面
└── components/
    ├── ui/            # Shadcn 组件原语
    ├── editor/        # 编辑器相关组件
    ├── sidebar/       # 侧栏组件（文件树/搜索/大纲/标签）
    ├── panels/        # 底部面板组件
    └── ai/            # AI 相关组件
```

---

## 无障碍

- 所有交互元素有可见焦点环
- 半透明面板保持文字对比度 ≥ 4.5:1
- 提供 `aria-label` 或 `aria-labelledby` 用于图标按钮
- 快捷键无冲突，确保键盘可完全操作
- 动画尊重 `prefers-reduced-motion`
