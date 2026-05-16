import { useEditorStore } from "../../stores/editor"
import { Toggle } from "../ui/toggle"

export function EditorToolbar() {
  const { isSourceMode, toggleSourceMode } = useEditorStore()

  return (
    <div className="flex items-center gap-1 px-4 h-10 bg-muted/50 border-b border-border">
      <span className="text-xs text-muted-foreground font-ui uppercase tracking-widest mr-auto">
        {isSourceMode ? "源码模式" : "WYSIWYG"}
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
