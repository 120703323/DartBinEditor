import { useEffect, useState, useCallback } from "react"
import { invoke } from "@tauri-apps/api/core"
import { open } from "@tauri-apps/plugin-dialog"
import { useEditorStore } from "../../stores/editor"

interface FsEntry {
  name: string
  path: string
  is_dir: boolean
  is_file: boolean
}

export function FileTree() {
  const { openFile, activeFile, currentDir, setCurrentDir } = useEditorStore()
  const [entries, setEntries] = useState<FsEntry[]>([])
  const [loading, setLoading] = useState(true)

  const loadDir = useCallback(async () => {
    setLoading(true)
    try {
      const result = await invoke<FsEntry[]>("list_directory", { path: currentDir })
      const filtered = result.filter(
        (e) => (e.is_dir) || (e.is_file && e.name.endsWith(".md"))
      )
      setEntries(filtered)
    } catch {
      setEntries([])
    }
    setLoading(false)
  }, [currentDir])

  useEffect(() => {
    loadDir()
  }, [loadDir])

  const handleFileClick = async (entry: FsEntry) => {
    if (entry.is_dir) {
      setCurrentDir(entry.path)
    } else {
      openFile(entry.path)
    }
  }

  const handleOpenFile = async () => {
    try {
      const result = await open({
        multiple: false,
        filters: [{ name: "Markdown", extensions: ["md", "markdown"] }],
      })
      if (result) {
        openFile(result)
      }
    } catch (e) {
      console.error("Open file dialog failed:", e)
    }
  }

  const handleOpenFolder = async () => {
    try {
      const result = await open({ directory: true, multiple: false })
      if (result) {
        setCurrentDir(result)
      }
    } catch (e) {
      console.error("Open folder dialog failed:", e)
    }
  }

  const canGoUp = currentDir !== "." && currentDir !== ""

  const handleGoUp = () => {
    // 支持正斜杠和反斜杠
    const separator = currentDir.includes("\\") ? "\\" : "/"
    const parent = currentDir.split(separator).slice(0, -1).join(separator) || "."
    setCurrentDir(parent)
  }

  const formatPath = (path: string) => {
    if (path === ".") return "."
    
    // 支持正斜杠和反斜杠
    const separator = path.includes("\\") ? "\\" : "/"
    const parts = path.split(separator).filter(Boolean)
    
    if (parts.length <= 3) return path
    const first = parts[0]
    const last2 = parts.slice(-2).join(separator)
    return `${first}${separator}...${separator}${last2}`
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-2 py-2 border-b border-border/50">
        <span className="text-xs font-ui uppercase tracking-widest text-muted-foreground">
          文件
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleOpenFile}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground"
            aria-label="Open file"
            title="打开文件"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </button>
          <button
            onClick={handleOpenFolder}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground"
            aria-label="Open folder"
            title="打开文件夹"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <button
            onClick={loadDir}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground"
            aria-label="Refresh"
            title="刷新"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border/30">
        {canGoUp && (
          <button
            onClick={handleGoUp}
            className="p-1 rounded hover:bg-muted text-muted-foreground"
            aria-label="Go up"
            title="上级目录"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        )}
        <span className="text-[11px] font-ui text-muted-foreground truncate" title={currentDir}>
          {formatPath(currentDir)}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto sidebar-scrollbar">
        {loading ? (
          <div className="text-xs text-muted-foreground px-2 py-1">加载中...</div>
        ) : entries.length === 0 ? (
          <div className="text-xs text-muted-foreground px-2 py-8 text-center">
            当前目录没有 .md 文件
          </div>
        ) : (
          entries.map((entry) => (
            <button
              key={entry.path}
              onClick={() => handleFileClick(entry)}
              className={`
                w-full text-left px-3 py-1.5 text-sm font-ui rounded-md transition-colors
                flex items-center gap-2
                ${activeFile === entry.path
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/80 hover:bg-muted"
                }
              `}
            >
              {entry.is_dir ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 text-muted-foreground">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              )}
              <span className="truncate">{entry.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
