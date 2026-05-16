import { useEffect, useState, useCallback } from "react"
import { invoke } from "@tauri-apps/api/core"
import { useEditorStore } from "../../stores/editor"

interface FsEntry {
  name: string
  path: string
  is_dir: boolean
  is_file: boolean
}

export function FileTree() {
  const { openFile, activeFile } = useEditorStore()
  const [entries, setEntries] = useState<FsEntry[]>([])
  const [loading, setLoading] = useState(true)

  const loadDir = useCallback(async () => {
    try {
      const result = await invoke<FsEntry[]>("list_directory", { path: "." })
      setEntries(result.filter((e) => e.is_file && e.name.endsWith(".md")))
    } catch {
      setEntries([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadDir()
  }, [loadDir])

  const handleFileClick = async (entry: FsEntry) => {
    if (!entry.is_file) return
    openFile(entry.path)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-2 py-3">
        <span className="text-xs font-ui uppercase tracking-widest text-muted-foreground">
          文件
        </span>
        <button
          onClick={loadDir}
          className="p-1 rounded hover:bg-muted text-muted-foreground"
          aria-label="Refresh"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="truncate">{entry.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
