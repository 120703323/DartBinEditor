# DartBinEditor — Project Context for AI Coding Agents

## Project Overview

We are building **DartBinEditor**, an AI-native text editor with Tauri v2 (Rust backend + React frontend). The product blends Typora's WYSIWYG writing experience, Obsidian's knowledge management, VS Code's developer tooling, and AI-powered content creation into a single cross-platform desktop app.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Editor Engine | TipTap (ProseMirror) + CodeMirror 6 |
| Styling | Tailwind CSS v4 + Radix UI + Shadcn/ui |
| State | Zustand + TanStack Query |
| Desktop | Tauri v2 (Win/Mac/Linux) |
| Rust Crates | pulldown-cmark, syntect, tantivy, git2, lopdf, epub-rs, reqwest |

## Key Architecture Decisions

1. **Rendering**: TipTap frontend rendering during editing (zero IPC latency). On save, serialize to Markdown → Rust `pulldown-cmark` validates + updates Tantivy full-text index.
2. **Storage**: Direct local `.md` file operations — no database wrapper, no vendor lock-in.
3. **AI**: All AI requests proxy through Rust `reqwest` with SSE streaming. Frontend receives via Tauri Channel.
4. **Permissions**: Tauri v2 denies everything by default — add capabilities in `src-tauri/capabilities/default.json`.

## Phase 1 (MVP) Scope

Core Markdown editor with:
- WYSIWYG inline rendering (TipTap)
- Source mode (CodeMirror 6)
- File tree + multi-tab
- Full-text search (tantivy)
- Bidirectional links `[[wiki-link]]` + backlinks panel
- Tag system
- Auto-save + crash recovery
- Code syntax highlighting (syntect)
- Outline view / TOC generation
- Command palette (Ctrl+Shift+P)
- Dark/light theme + CSS customization
- Export PDF / HTML

## Design System

Refer to `DESIGN.md` — "Ink & Circuit" concept:
- DM Sans (UI), Literata (display), JetBrains Mono (code)
- Ink blue (primary), Amber (AI/accent), Warm gray (muted)
- Light: warm paper background / Dark: deep slate background
- Glass-morphism panels, clean editor surface
- VS Code-style keyboard shortcuts
- Focus rings on all interactive elements

## File Structure

```
src/
├── App.tsx                   # Root layout
├── components/
│   ├── ui/                   # Shadcn primitives
│   ├── editor/               # TipTap editor, source mode
│   ├── sidebar/              # File tree, search, outline, tags
│   ├── panels/               # Bottom panels (backlinks, search results, AI)
│   └── ai/                   # AI chat, inline actions
├── stores/                   # Zustand stores
├── hooks/                    # Custom hooks
└── lib/                      # Utilities (cn, constants)

src-tauri/
├── src/
│   ├── main.rs               # Thin entry point
│   ├── lib.rs                # All app logic, command registration
│   ├── commands/             # Tauri commands per module
│   ├── search/               # Tantivy full-text search
│   ├── markdown/             # pulldown-cmark processing
│   ├── git/                  # git2 integration
│   └── ai/                   # AI client (SSE streaming)
├── capabilities/
│   └── default.json          # Permissions
└── tauri.conf.json           # App config
```

## Common Patterns

### Tauri Command Pattern
```rust
#[tauri::command]
fn my_command(name: String) -> Result<String, AppError> {
    Ok(format!("Hello, {}!", name))
}

// In lib.rs:
tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![my_command])
```

### Error Handling
```rust
#[derive(Debug, thiserror::Error)]
enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
}

impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where S: serde::ser::Serializer {
        serializer.serialize_str(self.to_string().as_ref())
    }
}
```

### State Management
```rust
use std::sync::Mutex;
use tauri::State;

struct EditorState {
    active_file: Option<String>,
}

#[tauri::command]
fn get_active(state: State<'_, Mutex<EditorState>>) -> Option<String> {
    state.lock().unwrap().active_file.clone()
}

// In lib.rs:
.manage(Mutex::new(EditorState { active_file: None }))
```

## CRITICAL RULES

1. **Register every command** in `generate_handler![]` — unregistered commands silently fail.
2. **Never use borrowed types** (`&str`) in async commands — use owned types.
3. **Add capabilities** before using any plugin features.
4. **All app logic in `lib.rs`**, `main.rs` is a thin passthrough (required for mobile builds).
5. **Return `Result<T, E>`** from commands for proper error handling.
6. **Run `cargo clippy --all-targets --all-features -- -D warnings`** after Rust changes.
7. **Follow DESIGN.md** for all UI — consistent design system is critical.
8. **Do NOT commit** unless explicitly asked.
