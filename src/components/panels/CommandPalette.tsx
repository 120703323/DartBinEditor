import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "../../lib/utils"
import { useEditorStore } from "../../stores/editor"

interface Command {
  id: string
  label: string
  shortcut?: string
  category: string
  action: () => void
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const {
    theme,
    setTheme,
    toggleSidebar,
    toggleSourceMode,
    toggleTypewriterMode,
    toggleFocusMode,
  } = useEditorStore()

  const commands: Command[] = [
    {
      id: "toggle-dark-mode",
      label: "切换暗色模式",
      shortcut: "Ctrl+Shift+L",
      category: "视图",
      action: () => setTheme(theme === "dark" ? "light" : "dark"),
    },
    {
      id: "toggle-sidebar",
      label: "切换侧边栏",
      shortcut: "Ctrl+B",
      category: "视图",
      action: toggleSidebar,
    },
    {
      id: "toggle-source-mode",
      label: "切换源码模式",
      category: "视图",
      action: toggleSourceMode,
    },
    {
      id: "save-file",
      label: "保存文件",
      category: "文件",
      action: () => {},
    },
    {
      id: "search-files",
      label: "搜索文件",
      shortcut: "Ctrl+P",
      category: "文件",
      action: () => {},
    },
    {
      id: "new-file",
      label: "新建文件",
      category: "文件",
      action: () => {},
    },
    {
      id: "export-pdf",
      label: "导出 PDF",
      category: "文件",
      action: () => {},
    },
    {
      id: "export-html",
      label: "导出 HTML",
      category: "文件",
      action: () => {},
    },
    {
      id: "typewriter-mode",
      label: "打字机模式",
      category: "视图",
      action: toggleTypewriterMode,
    },
    {
      id: "focus-mode",
      label: "专注模式",
      category: "视图",
      action: toggleFocusMode,
    },
  ]

  const filtered = search.trim()
    ? commands.filter((cmd) =>
        cmd.label.toLowerCase().includes(search.toLowerCase())
      )
    : commands

  const selected = filtered[selectedIndex]

  const close = useCallback(() => {
    setIsOpen(false)
    setSearch("")
    setSelectedIndex(0)
  }, [])

  const execute = useCallback(
    (cmd: Command) => {
      cmd.action()
      close()
    },
    [close]
  )

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMeta = navigator.platform.includes("Mac") ? e.metaKey : e.ctrlKey
      if (isMeta && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0)
      setSearch("")
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const item = listRef.current.children[selectedIndex] as HTMLElement | undefined
      item?.scrollIntoView({ block: "nearest" })
    }
  }, [selectedIndex])

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
        break
      case "Enter":
        e.preventDefault()
        if (selected) execute(selected)
        break
      case "Escape":
        e.preventDefault()
        close()
        break
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={close}
    >
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-200 ease-out"
        style={{ opacity: isOpen ? 1 : 0 }}
      />

      <div
        className={cn(
          "relative w-full max-w-lg rounded-xl border border-border shadow-2xl",
          "bg-card text-card-foreground overflow-hidden",
          "transition-all duration-200 ease-out"
        )}
        style={{
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "scale(1)" : "scale(0.96)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-border">
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="输入命令搜索..."
            className={cn(
              "w-full bg-transparent border-none outline-none",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "font-ui"
            )}
          />
        </div>

        <div
          ref={listRef}
          className="max-h-72 overflow-y-auto py-1"
        >
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              没有匹配的命令
            </div>
          )}

          {filtered.map((cmd, i) => {
            const isSelected = i === selectedIndex
            return (
              <button
                key={cmd.id}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 text-left",
                  "transition-colors duration-100",
                  isSelected
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
                onMouseEnter={() => setSelectedIndex(i)}
                onClick={() => execute(cmd)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-medium text-muted-foreground/60 uppercase w-10 flex-shrink-0">
                    {cmd.category}
                  </span>
                  <span className="text-sm truncate">{cmd.label}</span>
                </div>
                {cmd.shortcut && (
                  <kbd className={cn(
                    "flex-shrink-0 ml-4 px-1.5 py-0.5 rounded text-[10px] font-medium tracking-wider",
                    "bg-muted text-muted-foreground font-code",
                    isSelected && "bg-primary/15 text-primary"
                  )}>
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            )
          })}
        </div>

        <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
          <span>
            <kbd className="px-1 py-0.5 rounded bg-muted font-code">↑↓</kbd> 导航
          </span>
          <span>
            <kbd className="px-1 py-0.5 rounded bg-muted font-code">↵</kbd> 执行
          </span>
          <span>
            <kbd className="px-1 py-0.5 rounded bg-muted font-code">Esc</kbd> 关闭
          </span>
        </div>
      </div>
    </div>
  )
}
