# DartBinEditor

> 面向写作者和开发者的 AI 原生文本编辑器。
>
> Typora 的书写手感 × Obsidian 的知识连接 × VS Code 的开发能力 × AI 原生的内容创作生态。

---

## 定位

| 维度 | 说明 |
|------|------|
| **目标用户** | 写作者、知识工作者、开发者 |
| **技术栈** | Tauri v2 (Rust) + React + TipTap + Tailwind |
| **商业模式** | 核心功能开源免费 · AI 等增值服务付费 |
| **支持平台** | Windows · macOS · Linux |

---

## 路线图

| Phase | 内容 | 状态 |
|-------|------|------|
| **Phase 1** | 核心 Markdown 编辑器（WYSIWYG + 知识管理 + 搜索） | 🏗 开发中 |
| **Phase 2** | 多格式支持（PDF · TXT · EPUB · DOCX） | 📋 规划 |
| **Phase 3** | AI 能力注入（AI 写作 · 润色 · 自媒体生成） | 📋 规划 |
| **Phase 4** | 小说生态（阅读器 · TTS · 插图 · 视频生成） | 📋 规划 |

---

## Phase 1 核心功能

- **所见即所得编辑** — 基于 TipTap 的内联渲染，输入即预览
- **源码模式** — CodeMirror 6 纯文本编辑
- **文件管理** — 文件树 · 多标签页 · 本地 .md 存储
- **全文搜索** — Tantivy 引擎，毫秒级响应
- **双向链接** — `[[wiki-link]]` + 反向链接面板
- **标签系统** — `#标签` 聚合与筛选
- **代码高亮** — 100+ 语言语法高亮（syntect）
- **大纲视图** — 自动生成文档结构
- **命令面板** — Ctrl+Shift+P 搜索执行所有操作
- **主题系统** — 暗色/亮色 + CSS 自定义
- **导出** — PDF / HTML
- **更多** — Mermaid 图表 · LaTeX 公式 · Markdown Lint · 自动保存

---

## 快速开始

```bash
# 前端依赖
npm install

# 开发（同时启动前端 dev server + Tauri 窗口）
npm run tauri dev

# 构建生产版本
npm run tauri build
```

---

## 技术架构

```
Frontend:  React 18 · TypeScript · TipTap · CodeMirror 6
           Tailwind CSS · Radix UI · Shadcn · Zustand
                │
        Tauri v2 IPC (invoke / events / channels)
                │
Rust:      pulldown-cmark · syntect · tantivy · git2
           lopdf · epub-rs · reqwest (SSE) · tokio
```

---

## 设计体系

参阅 [DESIGN.md](./DESIGN.md) — 「Ink & Circuit」设计概念。

- **配色：** 墨蓝（主色）· 琥珀（AI）· 暖灰（辅助）
- **字体：** DM Sans · Literata · JetBrains Mono
- **主题：** 暖白纸色（亮）/ 深石板（暗）

---

## 贡献

本项目仍在早期开发阶段。欢迎提交 Issue 和 PR。

---

## 许可

核心功能基于开源许可发布。详见 [LICENSE](./LICENSE)。
