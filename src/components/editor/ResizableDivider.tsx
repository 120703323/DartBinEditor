import { useCallback, useRef, useState } from "react"
import { useEditorStore } from "../../stores/editor"

const MIN_WIDTH = 160
const MAX_WIDTH = 480

export function ResizableDivider() {
  const { isSidebarOpen, sidebarWidth, setSidebarWidth } = useEditorStore()
  const [isDragging, setIsDragging] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(0)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      startXRef.current = e.clientX
      startWidthRef.current = sidebarWidth
      setIsDragging(true)

      const handleMouseMove = (e: MouseEvent) => {
        const delta = e.clientX - startXRef.current
        const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta))
        setSidebarWidth(newWidth)
      }

      const handleMouseUp = () => {
        setIsDragging(false)
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "col-resize"
      document.body.style.userSelect = "none"
    },
    [sidebarWidth, setSidebarWidth]
  )

  if (!isSidebarOpen) return null

  return (
    <div
      className={`w-1 flex-shrink-0 cursor-col-resize transition-colors ${
        isDragging
          ? "bg-primary"
          : "hover:bg-primary/50 bg-transparent"
      }`}
      style={{ zIndex: 10 }}
      onMouseDown={handleMouseDown}
    />
  )
}