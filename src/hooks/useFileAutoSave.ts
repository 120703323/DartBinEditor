import { useEffect, useRef, useCallback } from "react"
import { invoke } from "@tauri-apps/api/core"

let savedContentMap = new Map<string, string>()
let timers = new Map<string, ReturnType<typeof setTimeout>>()

const manualSaveRef: { current: (() => Promise<void>) | null } = { current: null }

let currentDocText = ""

export function getCurrentDocText() {
  return currentDocText
}

export function setCurrentDocText(text: string) {
  currentDocText = text
}

export function triggerManualSave() {
  if (manualSaveRef.current) manualSaveRef.current()
}

export function useFileAutoSave(activeFile: string | null, getContent: () => string) {
  const contentGetterRef = useRef(getContent)
  contentGetterRef.current = getContent
  const activeFileRef = useRef(activeFile)
  activeFileRef.current = activeFile

  const doSave = useCallback(async (label: string) => {
    const file = activeFileRef.current
    const content = contentGetterRef.current()
    if (!file || content === undefined) return

    if (label === "auto") {
      const lastSaved = savedContentMap.get(file)
      if (content === lastSaved) return
    }

    try {
      await invoke("write_file", { path: file, content })
      savedContentMap.set(file, content)
      const time = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      const el = document.getElementById("save-status")
      if (el) {
        el.textContent = `已${label === "manual" ? "手动" : "自动"}保存 ${time}`
        el.className = "text-green-500"
      }
    } catch (e) {
      console.error("Save failed:", e)
      const el = document.getElementById("save-status")
      if (el) {
        el.textContent = "保存失败"
        el.className = "text-red-500"
      }
    }
  }, [])

  const scheduleSave = useCallback(() => {
    const file = activeFileRef.current
    if (!file) return
    const content = contentGetterRef.current()
    const lastSaved = savedContentMap.get(file)
    if (content === lastSaved) return
    if (timers.has(file)) clearTimeout(timers.get(file))
    timers.set(file, setTimeout(() => doSave("auto"), 10000))
  }, [doSave])

  const markClean = useCallback((content: string) => {
    const file = activeFileRef.current
    if (file) {
      savedContentMap.set(file, content)
      const time = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      const el = document.getElementById("save-status")
      if (el) {
        el.textContent = `已自动保存 ${time}`
        el.className = "text-green-500"
      }
    }
  }, [])

  useEffect(() => {
    manualSaveRef.current = () => doSave("manual")
    return () => {
      manualSaveRef.current = null
      const file = activeFileRef.current
      if (file && timers.has(file)) {
        clearTimeout(timers.get(file))
        timers.delete(file)
      }
    }
  }, [doSave])

  return { scheduleSave, markClean }
}

export function updateStats(lines: number, words: number) {
  const linesEl = document.getElementById("stats-lines")
  const wordsEl = document.getElementById("stats-words")
  if (linesEl) linesEl.textContent = `${lines} 行`
  if (wordsEl) wordsEl.textContent = `${words} 字`
}
