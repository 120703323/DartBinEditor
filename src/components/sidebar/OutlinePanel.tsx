import { useEffect, useState } from "react"
import { useEditorStore } from "../../stores/editor"

interface Heading {
  level: number
  text: string
  id: string
}

export function OutlinePanel() {
  const { activeFile } = useEditorStore()
  const [headings, setHeadings] = useState<Heading[]>([])

  useEffect(() => {
    if (!activeFile) {
      setHeadings([])
      return
    }

    const editorEl = document.querySelector(".tiptap-editor")
    if (!editorEl) {
      setHeadings([])
      return
    }

    const hTags = editorEl.querySelectorAll("h1, h2, h3")
    const extracted: Heading[] = []
    hTags.forEach((el, i) => {
      const tag = el.tagName.toLowerCase()
      extracted.push({
        level: parseInt(tag[1]),
        text: el.textContent || "",
        id: `heading-${i}`,
      })
    })
    setHeadings(extracted)
  }, [activeFile])

  useEffect(() => {
    const editorEl = document.querySelector(".tiptap-editor")
    if (!editorEl) return

    const observer = new MutationObserver(() => {
      const hTags = editorEl.querySelectorAll("h1, h2, h3")
      const extracted: Heading[] = []
      hTags.forEach((el, i) => {
        const tag = el.tagName.toLowerCase()
        extracted.push({
          level: parseInt(tag[1]),
          text: el.textContent || "",
          id: `heading-${i}`,
        })
      })
      setHeadings(extracted)
    })

    observer.observe(editorEl, { childList: true, subtree: true, characterData: true })
    return () => observer.disconnect()
  }, [])

  const scrollToHeading = (index: number) => {
    const editorEl = document.querySelector(".tiptap-editor")
    if (!editorEl) return
    const hTags = editorEl.querySelectorAll("h1, h2, h3")
    const target = hTags[index]
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  if (!activeFile) {
    return (
      <div className="text-xs text-muted-foreground px-2 py-8 text-center">
        打开文件查看大纲
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-2 py-3">
        <span className="text-xs font-ui uppercase tracking-widest text-muted-foreground">
          大纲
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {headings.length === 0 ? (
          <div className="text-xs text-muted-foreground px-2 py-8 text-center">
            文档中没有标题
          </div>
        ) : (
          headings.map((h, i) => (
            <button
              key={h.id}
              onClick={() => scrollToHeading(i)}
              className={`
                w-full text-left px-3 py-1 text-sm font-ui rounded-md transition-colors
                text-foreground/70 hover:text-foreground hover:bg-muted
              `}
              style={{ paddingLeft: `${12 + (h.level - 1) * 16}px` }}
            >
              <span className="text-xs text-muted-foreground mr-1 font-code">
                H{h.level}
              </span>
              {h.text}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
