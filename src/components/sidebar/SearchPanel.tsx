import { useState, useEffect, useCallback, useRef } from "react"
import { invoke } from "@tauri-apps/api/core"
import { useEditorStore } from "../../stores/editor"

interface SearchResult {
  path: string
  title: string
  snippet: string
  score: number
}

export function SearchPanel() {
  const { openFile, setSearchQuery, setSearchResults } = useEditorStore()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const performSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([])
        setSearchResults([])
        return
      }
      setLoading(true)
      try {
        const res = await invoke<SearchResult[]>("search_files", { query: q })
        setResults(res)
        setSearchResults(res)
        setSelectedIndex(-1)
      } catch {
        setResults([])
        setSearchResults([])
      }
      setLoading(false)
    },
    [setSearchResults],
  )

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchQuery(query)
      performSearch(query)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, performSearch, setSearchQuery])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, -1))
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      const result = results[selectedIndex]
      if (result) openFile(result.path)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-2 pt-3 pb-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="搜索文件内容..."
          className="w-full px-3 py-1.5 text-sm bg-muted rounded-md border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-ui"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-xs text-muted-foreground px-2 py-1">搜索中...</div>
        ) : query && results.length === 0 ? (
          <div className="text-xs text-muted-foreground px-2 py-8 text-center">
            没有找到结果
          </div>
        ) : !query ? (
          <div className="text-xs text-muted-foreground px-2 py-8 text-center">
            输入关键词搜索 .md 文件
          </div>
        ) : (
          <>
            <div className="text-xs text-muted-foreground px-2 py-1">
              找到 {results.length} 个结果
            </div>
            {results.map((result, index) => (
              <button
                key={result.path}
                onClick={() => openFile(result.path)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full text-left px-3 py-2 text-sm font-ui rounded-md transition-colors ${
                  index === selectedIndex
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/80 hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="truncate font-medium">{result.title}</span>
                </div>
                <div
                  className="text-xs text-muted-foreground line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: result.snippet }}
                />
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
