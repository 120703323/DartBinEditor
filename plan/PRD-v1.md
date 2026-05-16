# DartBinEditor 产品需求文档 v1.0

| 版本 | 日期 | 备注 |
|------|------|------|
| v1.0 | 2026-05-16 | 首次定稿 |

---

## 1. 产品概述

| 项目 | 内容 |
|------|------|
| **产品名称** | DartBinEditor |
| **产品定位** | 面向写作者和开发者的 AI 原生文本编辑器 |
| **一句话差异化** | Typora 的书写手感 + Obsidian 的知识连接 + VS Code 的开发能力 + AI 原生的内容创作生态 |
| **目标用户** | 写作者 + 开发者（兼顾） |
| **商业模式** | 核心开源免费，AI 等增值功能订阅付费 / BYOK（Bring Your Own Key） |
| **目标平台** | Windows / macOS / Linux 全覆盖 |

---

## 2. 技术架构

```
┌─ Frontend ───────────────────────────────────────────────┐
│  React 18 + TypeScript                                    │
│  TipTap (WYSIWYG 编辑) + CodeMirror 6 (源码模式)          │
│  Tailwind CSS + Radix UI + Shadcn/ui                      │
│  Zustand (全局状态) + TanStack Query (API 请求)            │
│  Vite (构建工具)                                           │
├─ Tauri v2 IPC (invoke / events / channels) ──────────────┤
├─ Rust Backend ────────────────────────────────────────────┤
│  pulldown-cmark    → Markdown 解析/序列化                  │
│  syntect           → 代码语法高亮                          │
│  tantivy           → 全文搜索引擎                          │
│  git2              → Git 版本控制集成                      │
│  lopdf             → PDF 元数据处理                        │
│  epub-rs           → EPUB 解析                            │
│  reqwest + SSE     → AI API 流式客户端                    │
│  tauri-plugin-store → 设置持久化                          │
│  tauri-plugin-fs   → 文件系统操作                         │
│  thiserror + serde → 错误处理与序列化                     │
│  tokio + tracing   → 异步运行时与日志                     │
└──────────────────────────────────────────────────────────┘
```

### 渲染架构

```
编辑时：TipTap 前端渲染（零 IPC 延迟，保证打字流畅）
保存时：TipTap 节点 → Markdown → Rust pulldown-cmark 二次校验
        同时更新 Tantivy 全文索引
预览/导出：Rust 端统一渲染，确保输出一致性
```

---

## 3. 分阶段功能规划

### Phase 1 — 核心 Markdown 编辑器（MVP）

**目标**：打造具备竞争力的基础编辑器，可达 Typora + Obsidian 80% 体验。

#### P0（必须，MVP 不可缺失）

| 功能 | 借鉴来源 | 详细说明 |
|------|---------|---------|
| WYSIWYG 内联渲染 | Typora | 隐藏 Markdown 标记符号，输入即渲染，零延迟前端渲染 |
| 源码模式 | Typora / VS Code | 切换到纯文本编辑模式，显示原始语法标记 |
| 文件树侧边栏 | Obsidian / VS Code | 可折叠/展开的目录树，支持新建/重命名/删除文件 |
| 多标签页 | VS Code | 每个文件独立标签，支持拖拽排序 |
| 本地 .md 文件存储 | Obsidian | 直接读写磁盘 Markdown 文件，不以数据库封装，无供应商锁定 |
| 全文搜索 | VS Code / Obsidian | 即时搜索所有文件标题和内容，支持正则，Rust tantivy 后端 |
| 自动保存 | VS Code | 编辑暂停 1s 后自动保存，搭配崩溃恢复机制 |
| 代码块语法高亮 | VS Code / Typora | Rust syntect 引擎，支持 100+ 编程语言 |
| 图片拖拽/粘贴 | Typora | 拖入图片自动复制到附件目录并插入引用 |
| 大纲视图 | VS Code | 基于标题层级自动生成文档大纲 |
| 暗色/亮色主题 | 通用 | 系统跟随 + 手动切换 |
| CSS 主题支持 | Typora | 用户可自定义 CSS 覆盖编辑器样式 |
| 导出 PDF / HTML | Typora | Rust 端导出，排版一致 |

#### P1（重要，MVP 建议包含）

| 功能 | 借鉴来源 | 详细说明 |
|------|---------|---------|
| 双向链接 [[wiki-link]] | Obsidian | 标准 `[[文件名]]` 语法，点击跳转 |
| 反向链接面板 | Obsidian | 自动检测哪些文件引用了当前文件 |
| 标签系统 | Obsidian | `#标签` 语法，标签聚合视图 |
| 命令面板 (Ctrl+Shift+P) | VS Code | 所有操作可搜索执行 |
| TOC 自动生成 | VS Code | 基于标题自动生成并插入目录 |
| 打字机模式 | iA Writer | 编辑行始终居中垂直 |
| 专注模式 | iA Writer | 当前行/段落高亮，其余淡出 |
| Mermaid 图表 | Typora | 流程图/时序图/甘特图等内联渲染 |
| LaTeX 数学公式 | Typora | `$...$` 和 `$$...$$` 内联渲染 |
| 字体/行距/页宽自定义 | Typora / iA Writer | 编辑区完全可自定义排版 |
| 自动补全 Markdown 语法 | VS Code | 输入 `-` 自动生成列表，`>` 自动生成引用等 |
| Markdown Lint | VS Code | 自动检测格式问题 |

#### P2（后续迭代补充）

| 功能 | 借鉴来源 | 说明 |
|------|---------|------|
| 图谱视图 | Obsidian | 知识网络可视化，节点和连接线 |
| Git 集成 | VS Code | 暂存/提交/diff，git2 后端 |
| Pandoc 导出 | Zettlr | DOCX / EPUB / LaTeX 等高级导出 |
| YAML Front Matter 支持 | 通用 | 文章元数据（标题/日期/标签等） |
| 社区主题市场 | Typora / VS Code | 用户可分享和下载主题 |

#### MVP 默认布局

```
┌──────────────────────────────────────────────────────┐
│ 标题栏 (自定义)                                       │
├──────────┬───────────────────────────────────────────┤
│          │                                           │
│ 侧边栏    │         编辑器区域（TipTap）              │
│ (可折叠)  │   ┌──────────────────────────────────┐   │
│          │   │  标签页: file1.md | file2.md x    │   │
│ 文件树    │   ├──────────────────────────────────┤   │
│ 搜索     │   │  所见即所得编辑区                   │   │
│ 大纲     │   │  → 实时渲染 Markdown               │   │
│ 标签     │   │  → 沉浸写作体验                    │   │
│          │   │  → 代码块高亮                      │   │
│          │   └──────────────────────────────────┘   │
│          │                                           │
│          │  状态栏: 行号 Ln 10 | Col 42 | UTF-8      │
├──────────┴───────────────────────────────────────────┤
│ 底部面板 (可展开)                                     │
│ 反向链接 / 搜索结果 / Git 输出 / AI 对话              │
└──────────────────────────────────────────────────────┘
```

---

### Phase 2 — 多格式扩展

| 格式 | 支持内容 | 实现方式 |
|------|---------|---------|
| **PDF** | 只读渲染 + 注释高亮 + 导出 | pdf.js（前端渲染）+ lopdf（Rust 元数据处理） |
| **TXT** | 编辑 + 编码自动检测/转换（UTF-8/GBK/Shift-JIS 等） | Rust `encoding_rs` 库 |
| **EPUB** | 沉浸阅读模式 + 书签 + 阅读进度 | Rust `epub-rs` 解析 |
| **DOCX** | 导入（读取）+ 导出 | Python Pandoc 子进程桥接 或 纯 Rust 进度实现 |
| **格式互转** | MD↔PDF, EPUB↔TXT, MD↔DOCX | 统一导出 Pipeline |
| **编码检测** | 打开文件自动检测编码，状态栏显示 | Rust `chardetng` |

---

### Phase 3 — AI 能力注入

**架构**：所有 AI 请求通过 Rust 后端 `reqwest` 流式代理，前端通过 Tauri Channel 接收 SSE 流。

```
AI 模块
├── AI 侧栏对话
│   ├── 上下文感知当前文档内容
│   ├── 多轮对话
│   └── 可插入回答到编辑区
│
├── 内联 AI（选中文本操作）
│   ├── 改写 / 润色 / 翻译 / 总结 / 续写
│   ├── 弹出气泡菜单
│   └── 支持自定义 Prompt
│
├── 斜杠命令 (/)
│   ├── /continue 继续写作
│   ├── /outline 生成大纲
│   ├── /meeting 会议纪要模板
│   ├── /brainstorm 脑暴大纲
│   └── 用户自定义模板
│
├── 多模型支持
│   ├── 云端：GPT-5, Claude 4, DeepSeek V4, Gemini 3
│   ├── 本地：Ollama, llama.cpp
│   ├── 用户自定义 API Endpoint + Key
│   └── 运行时一键切换模型
│
├── 自媒体创作
│   ├── 小红书洗稿：风格转换 + 话题标签 + emoji 风格
│   ├── 公众号文章生成：段落间距 + 排版优化
│   ├── AI 标题生成器：多标题候选
│   └── SEO 关键词分析
│
└── 计费 / 用量
    ├── 免费用户：每日一定额度 AI 调用
    ├── Pro 订阅：无限制 + 本地模型优先
    └── BYOK（Bring Your Own Key）：自带 API Key 不计入
```

---

### Phase 4 — 小说与内容创作生态

```
小说模块
├── 沉浸式阅读器
│   ├── 滚动模式 / 翻页模式
│   ├── 字体/字号/行距/背景色完全自定义
│   ├── 夜间 / 护眼 / 纸墨 多主题
│   ├── 书签管理 + 阅读进度（基于目录）
│   ├── 阅读笔记 + 批注高亮
│   └── 阅读统计（今日阅读时长/速度等）
│
├── TTS 有声小说
│   ├── Edge TTS（免费高质量中文语音）
│   ├── 多角色声音（对话场景区分男女声）
│   ├── 语速（0.5x–2.0x）/ 音调调节
│   ├── 章节连续播放 / 后台播放
│   ├── 背景音效（雨声/咖啡厅/白噪音等）
│   ├── 音频导出 MP3
│   └── 字幕同步显示
│
├── AI 小说插图
│   ├── 选中段落 → AI 生成配图
│   ├── 风格选择：水墨 / 动漫 / 写实 / 油画 / 像素
│   ├── 插图库管理（自动关联章节）
│   ├── 接入 Stable Diffusion（本地）/ DALL-E / Midjourney API
│   └── 拖拽调整插图位置
│
└── AI 视频生成
    ├── 章节 → 短视频自动化（TTS + 插图动画 + 字幕）
    ├── 视频模板：小红书竖版 / 抖音 / b 站横版
    ├── 自动配音 + AI 语音
    ├── 字幕自动生成 + 样式编辑
    └── 导出 MP4
```

---

## 4. 核心竞争力矩阵

| 维度 | Typora | Obsidian | VS Code | **DartBinEditor** |
|------|:------:|:--------:|:-------:|:-----------------:|
| WYSIWYG 内联渲染 | ✅ 标杆 | ❌ 分栏 | ❌ 分栏 | ✅ 标杆级 |
| 知识图谱/双向链接 | ❌ | ✅ 最强 | ❌ | ✅ 核心内置 |
| 开发者工具 / Git | ❌ | ❌ | ✅ 最强 | ✅ 内置 |
| 多格式（PDF/EPUB/DOCX） | ❌ 仅 MD | ❌ 仅 MD | ❌ 需扩展 | ✅ 全格式 |
| AI 原生集成 | ❌ 无 | ❌ 需插件 | ⚠️ Copilot(付费) | ✅ 多模型原生 |
| 小说生态（TTS/插图/视频） | ❌ | ❌ | ❌ | ✅ 完整闭环 |
| 自媒体洗稿/文案生成 | ❌ | ❌ | ❌ | ✅ AI 驱动 |
| 本地优先 / 隐私 | ✅ | ✅ | ✅ | ✅ |
| 开源免费 | ❌ $14.99 | ✅ 免费 | ✅ 免费 | ✅ 核心免费 |

---

## 5. Rust 依赖清单

```toml
[dependencies]
# Tauri 核心
tauri = { version = "2", features = [] }
tauri-plugin-store = "2"
tauri-plugin-fs = "2"

# Markdown 处理
pulldown-cmark = "0.12"
syntect = "6"                    # 语法高亮

# 全文搜索
tantivy = "0.22"

# Git
git2 = "0.19"

# 文件编码
encoding_rs = "0.8"
chardetng = "0.1"

# PDF / EPUB
lopdf = "0.34"
epub-rs = "1.0"

# AI / HTTP
reqwest = { version = "0.12", features = ["stream", "json"] }

# 序列化/错误处理
serde = { version = "1", features = ["derive"] }
serde_json = "1"
thiserror = "2"
anyhow = "1"

# 异步 / 日志
tokio = { version = "1", features = ["full"] }
tracing = "0.1"
tracing-subscriber = "0.3"
```

---

## 6. 前端依赖清单

```json
{
  "dependencies": {
    "react": "^19",
    "react-dom": "^19",
    "@tiptap/react": "^2",
    "@tiptap/starter-kit": "^2",
    "@tiptap/extension-markdown": "^2",
    "@tiptap/extension-code-block-lowlight": "^2",
    "@tiptap/extension-image": "^2",
    "@tiptap/extension-table": "^2",
    "@tiptap/extension-underline": "^2",
    "codemirror": "^6",
    "@codemirror/lang-markdown": "^6",
    "zustand": "^5",
    "@tanstack/react-query": "^5",
    "@tauri-apps/api": "^2",
    "@tauri-apps/plugin-store": "^2",
    "@tauri-apps/plugin-fs": "^2",
    "tailwindcss": "^4",
    "@radix-ui/react-dialog": "^1",
    "@radix-ui/react-dropdown-menu": "^1",
    "@radix-ui/react-tabs": "^1",
    "@radix-ui/react-tooltip": "^1",
    "lucide-react": "^0.400"
  }
}
```

---

## 7. 非功能需求

| 指标 | 要求 |
|------|------|
| 冷启动速度 | ≤2 秒 |
| 大文件编辑 | 10MB+ 文件流畅不卡顿（按需加载 + 虚拟渲染） |
| 搜索速度 | 10 万文件标题搜索 < 1s，全文搜索 < 3s |
| 内存占用（空载） | < 200MB |
| 内存占用（大项目） | < 500MB |
| 安装包体积 | < 50MB（不含 AI 模型） |
| 隐私 | 全本地存储，无遥测，无强制云端，AI 可配置纯本地模型 |
| 国际化 | 优先中文体验，中英双语 UI |
| 扩展性 | 架构预留插件系统接口（Phase 4 后） |

---

## 8. 开发阶段规划

```
Phase 1 — MVP (3-4 个月)
├── 第 1-2 周：项目脚手架搭建
│   ├── Tauri v2 项目初始化
│   ├── Rust 基础模块（文件系统、配置、日志）
│   ├── React + TipTap + Tailwind 前端框架搭建
│   └── CI/CD 基础（GitHub Actions 跨平台构建）
│
├── 第 3-6 周：编辑器核心
│   ├── TipTap WYSIWYG 渲染引擎
│   ├── 文件树 + 多标签页
│   ├── 自动保存 + 崩溃恢复
│   ├── 基础主题系统（暗色/亮色/CSS 自定义）
│   └── Markdown Lint + 自动补全
│
├── 第 7-10 周：知识管理与搜索
│   ├── 本地文件管理 + Tantivy 全文索引
│   ├── 双向链接 [[wiki-link]] 解析与跳转
│   ├── 反向链接面板
│   ├── 标签系统
│   ├── 大纲视图
│   ├── 命令面板
│   └── 搜索 UI
│
├── 第 11-12 周：导出与润色
│   ├── 导出 PDF / HTML
│   ├── 代码块语法高亮（syntect）
│   ├── Mermaid / LaTeX 渲染
│   └── 打包测试 + 跨平台兼容性测试
│
└── 第 13-16 周：公测准备
    ├── 用户反馈采集
    ├── 性能优化
    ├── bug 修复
    └── 开源仓库发布

Phase 2 — 多格式 (2-3 个月)
├── PDF 阅读与注释
├── TXT 编码检测与编辑
├── EPUB 阅读器
├── Pandoc 集成 / 格式互转
└── 统一导出 Pipeline

Phase 3 — AI (2-3 个月)
├── Rust AI Client（多模型、SSE 流式）
├── AI 侧栏对话
├── 内联 AI 操作（改写/翻译/润色）
├── 斜杠命令模板
├── 自媒体洗稿/文案生成
└── 计费系统

Phase 4 — 小说生态 (3-4 个月)
├── 沉浸式阅读器
├── TTS 有声播放
├── AI 插图生成
├── AI 视频生成
└── 插件系统骨架
```
