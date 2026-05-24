import { useEffect, useRef, useCallback } from "react"
import { useEditorStore } from "../../stores/editor"

interface SearchMatch {
  index: number
  text: string
  line: number
}

export function FloatingSearch() {
  const { isSearchOpen, setSearchOpen, searchQuery, setSearchQuery, activeFile } = useEditorStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const matchesRef = useRef<SearchMatch[]>([])
  const currentIndexRef = useRef(0)
  const contentRef = useRef("")

  // Parse content for search matches
  const findMatches = useCallback((query: string, content: string): SearchMatch[] => {
    if (!query.trim()) return []
    const matches: SearchMatch[] = []
    const lines = content.split("\n")
    const lowerQuery = query.toLowerCase()

    lines.forEach((line, lineIndex) => {
      const lowerLine = line.toLowerCase()
      let index = 0
      while ((index = lowerLine.indexOf(lowerQuery, index)) !== -1) {
        matches.push({
          index: matches.length,
          text: line.trim(),
          line: lineIndex + 1,
        })
        index += 1
      }
    })

    return matches
  }, [])

  // Jump to match
  const jumpToMatch = useCallback((content: string, line: number) => {
    const editorEl = document.querySelector(".markdown-preview")
    if (!editorEl) return

    // Find the heading or paragraph at the line
    const allElements = editorEl.querySelectorAll("h1, h2, h3, p, li")
    let elementIndex = 0
    let currentLine = 1

    // Simple line counting based on content structure
    const walk = (node: Node, targetLine: number): boolean => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || ""
        const lines = text.split("\n").length - 1
        if (currentLine + lines >= targetLine) {
          const parent = node.parentElement
          if (parent) {
            parent.scrollIntoView({ behavior: "smooth", block: "center" })
            parent.classList.add("highlight-search")
            setTimeout(() => parent.classList.remove("highlight-search"), 1500)
          }
          return true
        }
        currentLine += lines
      } else {
        for (const child of Array.from(node.childNodes)) {
          if (walk(child, targetLine)) return true
        }
      }
      return false
    }

    walk(editorEl, line)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSearchOpen(false)
      setSearchQuery("")
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      currentIndexRef.current = (currentIndexRef.current + 1) % matchesRef.current.length
      const match = matchesRef.current[currentIndexRef.current]
      if (match) jumpToMatch(contentRef.current, match.line)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      currentIndexRef.current = (currentIndexRef.current - 1 + matchesRef.current.length) % matchesRef.current.length
      const match = matchesRef.current[currentIndexRef.current]
      if (match) jumpToMatch(contentRef.current, match.line)
    } else if (e.key === "Enter") {
      const match = matchesRef.current[currentIndexRef.current]
      if (match) jumpToMatch(contentRef.current, match.line)
    }
  }, [setSearchOpen, setSearchQuery, jumpToMatch])

  // Get content from editor
  const getContent = useCallback(() => {
    const editorEl = document.querySelector(".markdown-preview")
    return editorEl?.textContent || ""
  }, [])

  // Update matches when query changes
  useEffect(() => {
    if (!searchQuery) {
      matchesRef.current = []
      return
    }
    contentRef.current = getContent()
    matchesRef.current = findMatches(searchQuery, contentRef.current)
    currentIndexRef.current = 0
  }, [searchQuery, findMatches, getContent])

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus()
    }
  }, [isSearchOpen])

  if (!isSearchOpen) return null

  const matches = matchesRef.current
  const currentMatch = matches[currentIndexRef.current]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={() => {
          setSearchOpen(false)
          setSearchQuery("")
        }}
      />

      {/* Search panel */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 w-96 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
        <div className="flex items-center px-3 py-2 border-b border-border">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground mr-2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索文档内容..."
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <span className="text-xs text-muted-foreground ml-2">
            {matches.length > 0 ? `${currentIndexRef.current + 1}/${matches.length}` : "0/0"}
          </span>
          <button
            onClick={() => {
              setSearchOpen(false)
              setSearchQuery("")
            }}
            className="ml-2 p-1 rounded hover:bg-muted text-muted-foreground"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Matches list */}
        {matches.length > 0 && (
          <div className="max-h-64 overflow-y-auto">
            {matches.map((match, i) => (
              <button
                key={match.index}
                onClick={() => {
                  currentIndexRef.current = i
                  jumpToMatch(contentRef.current, match.line)
                }}
                className={`w-full text-left px-3 py-2 text-sm border-b border-border/50 last:border-0 ${
                  i === currentIndexRef.current
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-muted"
                }`}
              >
                <div className="text-xs text-muted-foreground mb-0.5">
                  行 {match.line}
                </div>
                <div className="truncate text-xs">{match.text}</div>
              </button>
            ))}
          </div>
        )}

        {/* Hint */}
        <div className="px-3 py-2 bg-muted/50 text-xs text-muted-foreground flex gap-4">
          <span>↑↓ 导航</span>
          <span>Enter 跳转</span>
          <span>Esc 关闭</span>
        </div>
      </div>
    </>
  )
}