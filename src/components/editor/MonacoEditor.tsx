import { useCallback, useEffect, useState, useRef } from "react"
import { MilkdownEditor } from "./MilkdownEditor"
import { SimpleMarkdownEditor } from "./SimpleMarkdownEditor"
import { invoke } from "@tauri-apps/api/core"
import { useEditorStore } from "../../stores/editor"
import { useFileAutoSave, updateStats, setCurrentDocText } from "../../hooks/useFileAutoSave"
import "./MonacoEditor.css"

const ZOOM_MIN = 60
const ZOOM_MAX = 200
const ZOOM_STEP = 10

export function MonacoEditor() {
  const { activeFile, isSourceMode, typewriterMode, focusMode, zoom, setZoom } = useEditorStore()
  const [content, setContent] = useState("")
  const [loadingFile, setLoadingFile] = useState<string | null>(null)
  const contentRef = useRef("")
  const loadSeqRef = useRef(0)
  const scrollPosRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const getContent = useCallback(() => contentRef.current, [])
  const { scheduleSave, markClean } = useFileAutoSave(activeFile, getContent)

  // Ctrl+Wheel zoom
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      const current = useEditorStore.getState().zoom
      const next = e.deltaY < 0
        ? Math.min(current + ZOOM_STEP, ZOOM_MAX)
        : Math.max(current - ZOOM_STEP, ZOOM_MIN)
      setZoom(next)
    }

    el.addEventListener("wheel", handleWheel, { passive: false })
    return () => el.removeEventListener("wheel", handleWheel)
  }, [setZoom])

  const loadFile = useCallback(async (path: string) => {
    const seq = ++loadSeqRef.current
    setLoadingFile(path)
    try {
      const text = await invoke<string>("read_file", { path })
      if (seq !== loadSeqRef.current) return
      contentRef.current = text
      setContent(text)
      setCurrentDocText(text)
      updateStats(text.split("\n").length, text.trim() ? text.trim().split(/\s+/).length : 0)
      markClean(text)
    } catch {
      if (seq !== loadSeqRef.current) return
      contentRef.current = ""
      setContent("")
      updateStats(0, 0)
    } finally {
      if (seq === loadSeqRef.current) {
        setLoadingFile(null)
      }
    }
  }, [markClean])

  useEffect(() => {
    if (!activeFile) {
      contentRef.current = ""
      setContent("")
      setLoadingFile(null)
      return
    }
    loadFile(activeFile)
  }, [activeFile, loadFile])

  const handleChange = useCallback((markdown: string) => {
    contentRef.current = markdown
    setCurrentDocText(markdown)
    scheduleSave()
    updateStats(markdown.split("\n").length, markdown.trim() ? markdown.trim().split(/\s+/).length : 0)
  }, [scheduleSave])

  if (!activeFile) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-ui">DartBinEditor</p>
          <p className="text-sm mt-2">从侧边栏选择一个文件开始编辑</p>
        </div>
      </div>
    )
  }

  if (loadingFile) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-sm font-ui">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`h-full w-full ${typewriterMode ? "typewriter-mode" : ""} ${focusMode ? "focus-mode" : ""}`}>
      <div
        data-scroll-wrapper
        className="h-full w-full origin-top-left transition-transform duration-100 overflow-auto"
        style={{ transform: `scale(${zoom / 100})`, width: `${10000 / zoom}%`, height: `${10000 / zoom}%` }}
      >
        {isSourceMode ? (
          <SimpleMarkdownEditor key={activeFile} content={content} onChange={handleChange} scrollPosRef={scrollPosRef} />
        ) : (
          <MilkdownEditor key={activeFile} content={content} onChange={handleChange} scrollPosRef={scrollPosRef} />
        )}
      </div>
    </div>
  )
}
