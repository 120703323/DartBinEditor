import { useEffect, useState, useCallback } from "react"
import { useEditorStore } from "../../stores/editor"

interface TagWithLine {
  name: string
  line: number
  count: number
}

export function TagPanel() {
  const { activeFile, fileTags, setFileTags } = useEditorStore()
  const [tags, setTags] = useState<TagWithLine[]>([])
  const [newTag, setNewTag] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  // Parse #tag from content with line numbers
  const parseTags = useCallback((content: string): TagWithLine[] => {
    const tagMap: Record<string, TagWithLine> = {}
    const lines = content.split("\n")

    lines.forEach((line, index) => {
      const tagPattern = /#([\p{L}\p{N}_-]+)/gu
      let match
      while ((match = tagPattern.exec(line)) !== null) {
        const tagName = match[1].toLowerCase()
        if (!tagMap[tagName]) {
          tagMap[tagName] = { name: tagName, line: index + 1, count: 0 }
        }
        tagMap[tagName].count++
      }
    })

    return Object.values(tagMap).sort((a, b) => b.count - a.count)
  }, [])

  // Load tags for current file
  useEffect(() => {
    if (!activeFile) {
      setTags([])
      return
    }

    // First check stored tags
    const storedTags = fileTags[activeFile]
    if (storedTags && storedTags.length > 0) {
      // Convert stored tags to TagWithLine format
      const tagMap: Record<string, TagWithLine> = {}
      storedTags.forEach(tagName => {
        tagMap[tagName] = { name: tagName, line: 0, count: 1 }
      })
      setTags(Object.values(tagMap))
    }

    // Then extract from content
    const sourceTextarea = document.querySelector(".monaco-editor textarea") as HTMLTextAreaElement
    if (sourceTextarea) {
      const content = sourceTextarea.value || ""
      const extractedTags = parseTags(content)
      // Merge with stored tags
      setTags(prev => {
        const merged = [...prev]
        extractedTags.forEach(et => {
          if (!merged.find(t => t.name === et.name)) {
            merged.push(et)
          }
        })
        return merged.sort((a, b) => b.count - a.count)
      })
    }
  }, [activeFile, fileTags, parseTags])

  // Jump to tag location
  const jumpToTag = (line: number) => {
    const sourceTextarea = document.querySelector(".monaco-editor textarea") as HTMLTextAreaElement
    const markdownPreview = document.querySelector(".markdown-preview")

    if (sourceTextarea) {
      const lines = sourceTextarea.value.split("\n")
      let charIndex = 0
      for (let i = 0; i < line - 1 && i < lines.length; i++) {
        charIndex += lines[i].length + 1
      }
      sourceTextarea.focus()
      sourceTextarea.setSelectionRange(charIndex, charIndex + lines[line - 1].length)
      sourceTextarea.scrollIntoView({ behavior: "smooth", block: "center" })
    } else if (markdownPreview) {
      const paragraphs = markdownPreview.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li")
      const target = paragraphs[Math.min(line - 1, paragraphs.length - 1)]
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" })
        target.classList.add("highlight-heading")
        setTimeout(() => target.classList.remove("highlight-heading"), 1500)
      }
    }
  }

  // Add new tag
  const handleAddTag = () => {
    if (!activeFile || !newTag.trim()) return

    const tagName = newTag.trim().toLowerCase().replace(/^#/, "")
    if (!tagName) return

    const currentTags = fileTags[activeFile] || []
    if (!currentTags.includes(tagName)) {
      const updatedTags = [...currentTags, tagName]
      setFileTags(activeFile, updatedTags)
      setTags(prev => [...prev, { name: tagName, line: 0, count: 1 }])
    }

    setNewTag("")
    setIsAdding(false)
  }

  // Remove tag
  const handleRemoveTag = (tagName: string) => {
    if (!activeFile) return

    const currentTags = fileTags[activeFile] || []
    const updatedTags = currentTags.filter(t => t !== tagName)
    setFileTags(activeFile, updatedTags)
    setTags(prev => prev.filter(t => t.name !== tagName))
  }

  // Auto-save tags when content changes (extract #tags from content)
  useEffect(() => {
    const sourceTextarea = document.querySelector(".monaco-editor textarea") as HTMLTextAreaElement
    if (!sourceTextarea || !activeFile) return

    const handleInput = () => {
      const content = sourceTextarea.value
      const extractedTags = parseTags(content)

      // Save extracted tags
      const tagNames = extractedTags.map(t => t.name)
      const currentTags = fileTags[activeFile] || []
      const mergedTags = [...new Set([...currentTags.filter(t => tagNames.includes(t)), ...tagNames])]

      if (JSON.stringify(mergedTags.sort()) !== JSON.stringify([...currentTags].sort())) {
        setFileTags(activeFile, mergedTags)
      }

      setTags(extractedTags)
    }

    sourceTextarea.addEventListener("input", handleInput)
    return () => sourceTextarea.removeEventListener("input", handleInput)
  }, [activeFile, fileTags, parseTags, setFileTags])

  if (!activeFile) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-2 py-3">
          <span className="text-xs font-ui uppercase tracking-widest text-muted-foreground">
            标签
          </span>
        </div>
        <div className="text-xs text-muted-foreground px-2 py-8 text-center">
          打开文件查看标签
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-2 py-3 flex items-center justify-between">
        <span className="text-xs font-ui uppercase tracking-widest text-muted-foreground">
          标签
        </span>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1 rounded hover:bg-muted text-muted-foreground"
          title="添加标签"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Add tag input */}
      {isAdding && (
        <div className="px-2 pb-2">
          <div className="flex items-center gap-1">
            <span className="text-primary">#</span>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTag()
                if (e.key === "Escape") {
                  setIsAdding(false)
                  setNewTag("")
                }
              }}
              placeholder="标签名"
              className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:border-primary"
              autoFocus
            />
            <button
              onClick={handleAddTag}
              className="p-1 rounded hover:bg-muted text-primary"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2">
        {tags.length === 0 ? (
          <div className="text-xs text-muted-foreground py-8 text-center">
            文档没有标签
            <br />
            <span className="text-[10px]">使用 #标签 或点击+添加</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 py-1">
            {tags.map((tag) => (
              <span
                key={tag.name}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-ui group cursor-pointer hover:bg-primary/20"
                onClick={() => tag.line > 0 && jumpToTag(tag.line)}
                title={tag.line > 0 ? `跳转到行 ${tag.line}` : "在正文中搜索"}
              >
                <span>#{tag.name}</span>
                {tag.count > 1 && (
                  <span className="text-[10px] opacity-70">×{tag.count}</span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveTag(tag.name)
                  }}
                  className="ml-0.5 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="px-2 py-2 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground">
          标签格式: <code className="bg-muted px-1 rounded">#标签名</code>
        </p>
      </div>
    </div>
  )
}
