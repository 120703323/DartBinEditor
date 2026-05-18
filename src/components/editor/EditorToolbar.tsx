import { useEditorStore } from "../../stores/editor"
import { Toggle } from "../ui/toggle"

export function EditorToolbar() {
  const { isSourceMode, toggleSourceMode, toggleSidebar } = useEditorStore()

  return (
    <div className="flex items-center gap-1 px-2 h-10 bg-muted/50 border-b border-border">
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
        aria-label="Toggle sidebar"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <span className="text-xs text-muted-foreground font-ui uppercase tracking-widest ml-2 mr-auto">
        {isSourceMode ? "源码模式" : "阅读模式"}
      </span>

      <Toggle
        pressed={isSourceMode}
        onPressedChange={toggleSourceMode}
        aria-label="Toggle source mode"
        size="sm"
      >
        {"</>"}
      </Toggle>
    </div>
  )
}
