import { useEffect, useRef, useCallback, useState } from "react"
import { EditorView, keymap, placeholder } from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { defaultKeymap, historyKeymap, history } from "@codemirror/commands"
import { invoke } from "@tauri-apps/api/core"
import { marked } from "marked"
import { useEditorStore } from "../../stores/editor"
import { useFileAutoSave } from "../../hooks/useFileAutoSave"
import "./CodeMirrorEditor.css"

export function CodeMirrorEditor() {
  const { activeFile, isSourceMode } = useEditorStore()
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [content, setContent] = useState("")
  const [userEdited, setUserEdited] = useState(false)
  const isLoadingRef = useRef(false)

  const loadFile = useCallback(async (path: string) => {
    isLoadingRef.current = true
    try {
      const text = await invoke<string>("read_file", { path })
      setContent(text)
      if (viewRef.current) {
        viewRef.current.dispatch({
          changes: { from: 0, to: viewRef.current.state.doc.length, insert: text },
        })
      }
    } catch {
      setContent("")
      if (viewRef.current) {
        viewRef.current.dispatch({
          changes: { from: 0, to: viewRef.current.state.doc.length, insert: "" },
        })
      }
    } finally {
      isLoadingRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!activeFile) {
      setContent("")
      setUserEdited(false)
      return
    }
    loadFile(activeFile)
  }, [activeFile, loadFile])

  useEffect(() => {
    if (!editorContainerRef.current || viewRef.current) return

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        setContent(update.state.doc.toString())
        setUserEdited(true)
      }
    })

    const state = EditorState.create({
      doc: content,
      extensions: [
        keymap.of([...defaultKeymap, ...historyKeymap]),
        history(),
        markdown({ base: markdownLanguage }),
        EditorView.lineWrapping,
        placeholder("开始写作..."),
        updateListener,
        EditorView.theme({
          "&": { height: "100%" },
          ".cm-scroller": { overflow: "auto", fontFamily: "'Literata', Georgia, serif", lineHeight: "1.75" },
          ".cm-content": { padding: "24px", maxWidth: "780px", margin: "0 auto" },
          ".cm-gutters": { display: "none" },
          ".cm-focused": { outline: "none" },
          ".cm-cursor": { borderLeftColor: "#3b82f6" },
          ".cm-selectionBackground": { backgroundColor: "#dbeafe80 !important" },
        }),
      ],
    })

    const view = new EditorView({ state, parent: editorContainerRef.current })
    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [])

  useFileAutoSave(content, userEdited)

  const previewHtml = content ? (marked.parse(content) as string) : ""

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

  const sourceContainerStyle = { position: "relative" as const, height: "100%" as const }
  const previewStyle = { height: "100%" as const, overflow: "auto" as const, display: isSourceMode ? "none" : "block" as const }

  return (
    <>
      <div ref={editorContainerRef} className="h-full" style={{ ...sourceContainerStyle, display: isSourceMode ? "block" : "none" }} />
      <div
        className="markdown-preview h-full overflow-y-auto bg-background"
        style={{ ...previewStyle, display: isSourceMode ? "none" : "block" }}
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />
    </>
  )
}