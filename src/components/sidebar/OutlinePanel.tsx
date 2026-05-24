import { useEffect, useState, useRef } from "react"
import { useEditorStore } from "../../stores/editor"
import { getCurrentDocText } from "../../hooks/useFileAutoSave"

interface Heading {
  level: number
  text: string
  index: number
  lineNum?: number
}

export function OutlinePanel() {
  const { activeFile, isSourceMode } = useEditorStore()
  const [headings, setHeadings] = useState<Heading[]>([])
  const observerRef = useRef<MutationObserver | null>(null)
  const timerRef = useRef<number | null>(null)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!activeFile) {
      setHeadings([])
      return
    }

    const extractHeadings = () => {
      if (isSourceMode) {
        const text = getCurrentDocText()
        if (!text) {
          setHeadings([])
          return
        }

        const lines = text.split("\n")
        const result: Heading[] = []
        let headingIndex = 0

        lines.forEach((line, lineNum) => {
          const match = line.match(/^(#{1,6})\s+(.+)$/)
          if (match) {
            result.push({
              level: match[1].length,
              text: match[2].trim(),
              index: headingIndex++,
              lineNum,
            })
          }
        })

        setHeadings(result)
      } else {
        const container = document.querySelector("[data-milkdown-root]")
        if (!container) {
          setHeadings([])
          return
        }

        const elements = container.querySelectorAll("h1, h2, h3, h4, h5, h6")
        const result: Heading[] = []

        elements.forEach((el, index) => {
          const level = parseInt(el.tagName[1])
          const text = el.textContent?.trim() || ""
          if (text) {
            result.push({ level, text, index })
          }
        })

        setHeadings(result)
      }
    }

    const setupObserver = () => {
      if (isSourceMode) {
        extractHeadings()
        intervalRef.current = window.setInterval(extractHeadings, 1000)
      } else {
        const container = document.querySelector("[data-milkdown-root]")
        if (container) {
          extractHeadings()
          const observer = new MutationObserver(() => {
            extractHeadings()
          })
          observer.observe(container, { childList: true, subtree: true, characterData: true })
          observerRef.current = observer
        }
      }
    }

    timerRef.current = window.setTimeout(setupObserver, 300)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [activeFile, isSourceMode])

  const scrollToHeading = (heading: Heading) => {
    if (isSourceMode) {
      const container = document.querySelector(".cm-content")
      if (!container) return

      const cmLines = container.querySelectorAll(".cm-line")
      for (const lineEl of cmLines) {
        const text = lineEl.textContent || ""
        if (text.trim() === heading.text.trim() || text.includes(heading.text)) {
          lineEl.scrollIntoView({ behavior: "smooth", block: "center" })
          return
        }
      }

      const scrollable = document.querySelector("[data-scroll-wrapper]") as HTMLElement
      if (scrollable && heading.lineNum !== undefined) {
        const cmContent = scrollable.querySelector(".cm-content") as HTMLElement
        if (cmContent) {
          const lineHeight = parseFloat(getComputedStyle(cmContent).lineHeight) || 20
          scrollable.scrollTop = heading.lineNum * lineHeight - scrollable.clientHeight / 3
        }
      }
    } else {
      const container = document.querySelector("[data-milkdown-root]")
      if (!container) return

      const elements = container.querySelectorAll("h1, h2, h3, h4, h5, h6")
      const target = elements[heading.index] as HTMLElement | undefined
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  if (!activeFile) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-2 py-3">
          <span className="text-xs font-ui uppercase tracking-widest text-muted-foreground">
            大纲
          </span>
        </div>
        <div className="text-xs text-muted-foreground px-2 py-8 text-center">
          打开文件查看大纲
        </div>
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
      <div className="flex-1 overflow-y-auto sidebar-scrollbar">
        {headings.length === 0 ? (
          <div className="text-xs text-muted-foreground px-2 py-8 text-center">
            文档中没有标题
          </div>
        ) : (
          headings.map((heading) => (
            <button
              key={`${heading.index}-${heading.text}`}
              onClick={() => scrollToHeading(heading)}
              className="w-full text-left px-3 py-1.5 text-sm font-ui rounded-md transition-colors text-foreground/70 hover:text-foreground hover:bg-muted"
              style={{ paddingLeft: `${12 + (heading.level - 1) * 12}px` }}
            >
              <span className="truncate">{heading.text}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
