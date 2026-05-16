import { useEffect, useRef, useCallback } from "react"
import { invoke } from "@tauri-apps/api/core"
import { useEditorStore } from "../stores/editor"

export function useFileAutoSave(htmlContent: string | undefined) {
  const { activeFile } = useEditorStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedContentRef = useRef(htmlContent)

  useEffect(() => {
    savedContentRef.current = htmlContent
  }, [htmlContent])

  const save = useCallback(async () => {
    if (!activeFile || savedContentRef.current === undefined) return
    try {
      await invoke("write_file", {
        path: activeFile,
        content: savedContentRef.current,
      })
    } catch (e) {
      console.error("Auto-save failed:", e)
    }
  }, [activeFile])

  useEffect(() => {
    if (!activeFile) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      save()
    }, 1000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [htmlContent, activeFile, save])

  const saveNow = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    await save()
  }, [save])

  return { saveNow }
}
