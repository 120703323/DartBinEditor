import { useEffect, useRef } from "react"
import katex from "katex"
import "katex/dist/katex.min.css"

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

export function useMathRenderer(containerRef: React.RefObject<HTMLDivElement | null>) {
  const renderedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const renderMath = () => {
      const paragraphs = container.querySelectorAll<HTMLElement>("p")
      for (const p of paragraphs) {
        const text = p.textContent || ""
        const blockMatch = text.match(/^\s*\$\$([\s\S]+?)\$\$\s*$/)
        if (!blockMatch) continue

        const hash = simpleHash(text)
        if (renderedRef.current.has(hash)) continue
        renderedRef.current.add(hash)

        try {
          const html = katex.renderToString(blockMatch[1].trim(), {
            displayMode: true,
            throwOnError: false,
          })

          const div = document.createElement("div")
          div.className = "katex-block"
          div.innerHTML = html

          p.after(div)
        } catch {
          // Keep original text on error
        }
      }
    }

    const debouncedRender = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(renderMath, 300)
    }

    const observer = new MutationObserver(debouncedRender)
    observer.observe(container, { childList: true, subtree: true, characterData: true })

    renderMath()

    return () => {
      observer.disconnect()
      if (debounceTimer) clearTimeout(debounceTimer)
    }
  }, [containerRef])
}
