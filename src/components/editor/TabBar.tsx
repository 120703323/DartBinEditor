import { useEditorStore } from "../../stores/editor"

export function TabBar() {
  const { openFiles, activeFile, setActiveFile, closeFile } = useEditorStore()

  if (openFiles.length === 0) return null

  return (
    <div className="flex items-center h-10 bg-muted/50 border-b border-border overflow-x-auto">
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
              className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
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
  )
}
