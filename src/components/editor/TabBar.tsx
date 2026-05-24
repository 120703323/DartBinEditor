import { useRef, useState, useEffect } from "react"
import { useEditorStore } from "../../stores/editor"

export function TabBar() {
  const { openFiles, activeFile, setActiveFile, closeFile } = useEditorStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener("scroll", checkScroll)
      return () => el.removeEventListener("scroll", checkScroll)
    }
  }, [openFiles])

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const amount = direction === "left" ? -200 : 200
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" })
  }

  if (openFiles.length === 0) return null

  const isSingleTab = openFiles.length === 1

  return (
    <div className="flex items-center h-10 bg-muted/50 border-b border-border">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="px-1 h-full text-muted-foreground hover:text-foreground hover:bg-muted/30 shrink-0"
          aria-label="向左滚动"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex-1 flex items-center overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {openFiles.map((path) => {
          const name = path.split("\\").pop() || path.split("/").pop() || path
          const isActive = path === activeFile
          return (
            <div
              key={path}
              onClick={() => setActiveFile(path)}
              className={`
                group flex items-center gap-1.5 px-3 h-full cursor-pointer select-none
                text-sm font-ui border-r border-border/50
                transition-colors shrink-0
                ${isActive
                  ? "bg-editor-surface text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }
              `}
            >
              <span className="truncate max-w-32">{name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeFile(path)
                }}
                className={`p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-opacity ${
                  isSingleTab || isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
                aria-label={`Close ${name}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>

      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="px-1 h-full text-muted-foreground hover:text-foreground hover:bg-muted/30 shrink-0"
          aria-label="向右滚动"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>
  )
}
