# Tauri Commands API Reference

## Overview

This document lists all available Tauri commands exposed by the DartBinEditor Rust backend.

## File System Commands

### `read_file`

Reads the contents of a file.

**Signature:**

```rust
#[tauri::command]
fn read_file(path: String) -> Result<String, FsError>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | `string` | Absolute path to the file |

**Returns:** `string` - File contents as UTF-8 text.

**Example:**

```typescript
const content = await invoke("read_file", { path: "/home/user/doc.md" });
```

### `write_file`

Writes content to a file, creating parent directories if needed.

**Signature:**

```rust
#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), FsError>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | `string` | Absolute path to the file |
| `content` | `string` | Content to write |

**Example:**

```typescript
await invoke("write_file", {
  path: "/home/user/doc.md",
  content: "# Hello World\n\nThis is a test."
});
```

### `list_directory`

Lists all entries in a directory, sorted with directories first.

**Signature:**

```rust
#[tauri::command]
fn list_directory(path: String) -> Result<Vec<FsEntry>, FsError>
```

**Returns:** Array of `FsEntry` objects:

```typescript
interface FsEntry {
  name: string;    // File or directory name
  path: string;    // Full path
  is_dir: boolean; // Whether it's a directory
  is_file: boolean; // Whether it's a file
}
```

## Search Commands

### `search_files`

Searches the full-text index for matching documents.

**Signature:**

```rust
#[tauri::command]
fn search_files(query: String) -> Result<Vec<SearchResult>, SearchError>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | `string` | Search query (supports Tantivy query syntax) |

**Returns:** Array of `SearchResult`:

```typescript
interface SearchResult {
  path: string;    // File path
  title: string;   // Document title (filename without extension)
  snippet: string; // HTML snippet with highlighted matches
  score: number;   // Relevance score
}
```

### `rebuild_index`

Rebuilds the full-text search index by scanning all `.md` files.

**Signature:**

```rust
#[tauri::command]
fn rebuild_index(root_path: String) -> Result<usize, SearchError>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `root_path` | `string` | Root directory to scan |

**Returns:** `number` - Number of files indexed.

## Syntax Highlighting

### `highlight_code`

Highlights code using the syntect engine.

**Signature:**

```rust
#[tauri::command]
fn highlight_code(code: String, lang: String, dark_mode: bool) -> Result<String, SyntaxError>
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `code` | `string` | Source code to highlight |
| `lang` | `string` | Programming language identifier |
| `dark_mode` | `boolean` | Whether to use dark theme |

**Returns:** `string` - HTML with syntax-highlighted spans.

## Export Commands

### `export_html`

Converts a Markdown file to a styled HTML document.

**Signature:**

```rust
#[tauri::command]
fn export_html(file_path: String) -> Result<String, ExportError>
```

### `export_pdf`

Converts a Markdown file to HTML optimized for PDF printing.

**Signature:**

```rust
#[tauri::command]
fn export_pdf(file_path: String) -> Result<String, ExportError>
```

### `save_export`

Saves exported content to a file.

**Signature:**

```rust
#[tauri::command]
fn save_export(path: String, content: String) -> Result<(), ExportError>
```

## Error Handling

All commands return errors as serialized strings. Handle them in TypeScript:

```typescript
try {
  const result = await invoke("read_file", { path: "nonexistent.md" });
} catch (error) {
  console.error("Command failed:", error);
  // Shows: "IO error: The system cannot find the file specified"
}
```

## Error Types

| Error Type | Source | Common Causes |
|------------|--------|---------------|
| `FsError` | File system | File not found, permission denied |
| `SearchError` | Full-text search | Invalid query syntax, index not built |
| `SyntaxError` | Code highlighting | Unknown language, theme not found |
| `ExportError` | Export module | File not found, write permission denied |

## State Management

The application manages shared state via `AppState`:

```rust
pub struct AppState {
    pub active_file: Option<String>,
}
```

This is accessible but not exposed as a command directly. Use the frontend store (Zustand) for state management.
