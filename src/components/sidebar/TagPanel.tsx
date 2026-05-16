import { useEffect, useState } from "react"
import { useEditorStore } from "../../stores/editor"

export function TagPanel() {
  const { activeFile } = useEditorStore()
  const [tags, setTags] = useState<Record<string, number>>({})

  useEffect(() => {
    const editorEl = document.querySelector(".tiptap-editor")
    if (!editorEl) return

    const text = editorEl.textContent || ""
    const tagPattern = /#([\p{L}\p{N}_-]+)/gu
    const found: Record<string, number> = {}
    let match

    while ((match = tagPattern.exec(text)) !== null) {
      const tag = match[1].toLowerCase()
      found[tag] = (found[tag] || 0) + 1
    }

    setTags(found)
  }, [activeFile])

  const tagEntries = Object.entries(tags).sort((a, b) => b[1] - a[1])

  return (
    <div className="flex flex-col h-full">
      <div className="px-2 py-3">
        <span className="text-xs font-ui uppercase tracking-widest text-muted-foreground">
          标签
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-2">
        {tagEntries.length === 0 ? (
          <div className="text-xs text-muted-foreground py-8 text-center">
            当前文档没有标签
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tagEntries.map(([tag, count]) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs text-foreground/80 font-ui"
                title={`${count} 次出现`}
              >
                <span>#{tag}</span>
                <span className="text-muted-foreground text-[10px]">{count}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
