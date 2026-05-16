import { useEffect } from "react"
import mermaid from "mermaid"

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  securityLevel: "loose",
  fontFamily: "sans-serif",
})

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

export function useMermaidRenderer(containerRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const renderDiagrams = async () => {
      const blocks = container.querySelectorAll<HTMLElement>("pre code.language-mermaid")

      for (const codeEl of blocks) {
        const pre = codeEl.closest("pre")
        if (!pre) continue
        const wrapper = pre.closest(".code-block") || pre.parentElement
        if (!wrapper) continue

        const source = (codeEl.textContent || "").trim()
        if (!source) continue

        const hash = simpleHash(source)
        const id = `mermaid-${hash}`

        if (wrapper.querySelector(`[data-mermaid-id="${id}"]`)) continue

        try {
          const { svg } = await mermaid.render(id, source)

          const div = document.createElement("div")
          div.className = "mermaid-container"
          div.setAttribute("data-mermaid-id", id)
          div.innerHTML = svg

          const prevError = wrapper.querySelector(`[data-mermaid-id="error-${hash}"]`)
          if (prevError) prevError.remove()

          pre.after(div)
        } catch (err) {
          const errorDiv = document.createElement("div")
          errorDiv.className = "mermaid-error"
          errorDiv.setAttribute("data-mermaid-id", `error-${hash}`)
          errorDiv.textContent = `Diagram render failed: ${err instanceof Error ? err.message : String(err)}`

          const existingError = wrapper.querySelector(`[data-mermaid-id="error-${hash}"]`)
          if (!existingError) {
            pre.after(errorDiv)
          }
        }
      }
    }

    const debouncedRender = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(renderDiagrams, 300)
    }

    const observer = new MutationObserver(debouncedRender)
    observer.observe(container, { childList: true, subtree: true })

    renderDiagrams()

    return () => {
      observer.disconnect()
      if (debounceTimer) clearTimeout(debounceTimer)
    }
  }, [containerRef])
}
