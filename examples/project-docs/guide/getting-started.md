# Getting Started Guide

## Quick Start

Follow these steps to get up and running in 5 minutes.

### Step 1: Installation

```bash
npm install -g dart-bin-editor
```

### Step 2: Create a New Project

```bash
mkdir my-notes
cd my-notes
dart-bin-editor init
```

### Step 3: Start Writing

```bash
dart-bin-editor open .
```

## Features Overview

### WYSIWYG Editing

DartBinEditor provides a **What You See Is What You Get** editing experience. All Markdown syntax is rendered inline as you type.

| Markdown | Rendered As |
|----------|-------------|
| `**bold**` | **bold** |
| `*italic*` | *italic* |
| `` `code` `` | `code` |
| `~~strikethrough~~` | ~~strikethrough~~ |

### Source Mode

Toggle between WYSIWYG and source code view with the `</>` button in the toolbar.

### File Management

- **File Tree**: Navigate files in the sidebar
- **Multi-tab**: Open multiple files simultaneously
- **Auto-save**: Changes are saved automatically after 1 second of inactivity

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New file |
| `Ctrl+O` | Open file |
| `Ctrl+S` | Save |
| `Ctrl+W` | Close tab |
| `Ctrl+Q` | Quit |

### Navigation

| Shortcut | Action |
|----------|--------|
| `Ctrl+P` | Search files |
| `Ctrl+Shift+P` | Command palette |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab` | Previous tab |

### Editing

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+D` | Duplicate line |
| `Alt+Up/Down` | Move line |
| `Ctrl+/` | Toggle comment |

## Configuration

### Theme Settings

You can customize the appearance in the settings panel:

```json
{
  "theme": {
    "mode": "dark",
    "fontFamily": "DM Sans",
    "fontSize": 16,
    "lineHeight": 1.75,
    "maxWidth": 780
  }
}
```

### Auto-Save Configuration

```json
{
  "autoSave": {
    "enabled": true,
    "delayMs": 1000,
    "onFocusLoss": true
  }
}
```

## Troubleshooting

### Common Issues

#### Editor not loading

1. Clear the application cache
2. Restart the application
3. Reinstall if the issue persists

#### File changes not detected

Make sure file watching is enabled in settings:

```json
{
  "fileWatching": {
    "enabled": true,
    "debounceMs": 300
  }
}
```

## Next Steps

- Read the [API Reference](../api/commands.md) for command details
- Explore the [Markdown Showcase](../../markdown-syntax-showcase/README.md) for syntax examples
- Check the configuration guide for advanced settings

---

*Last updated: 2026-05-16*
