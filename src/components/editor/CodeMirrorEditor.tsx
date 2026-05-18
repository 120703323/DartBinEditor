import { useEffect, useRef, useState } from "react"
import { EditorView, keymap, placeholder } from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { defaultKeymap, historyKeymap, history as historyExtension } from "@codemirror/commands"
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
  const initRef = useRef(false)

  // Create editor once on mount
  useEffect(() => {
    if (!editorContainerRef.current || viewRef.current) return

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !isLoadingRef.current) {
        setUserEdited(true)
        setContent(update.state.doc.toString())
      }
    })

    const state = EditorState.create({
      doc: "",
      extensions: [
        keymap.of([...defaultKeymap, ...historyKeymap]),
        historyExtension(),
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
    initRef.current = true

    return () => {
      view.destroy()
      viewRef.current = null
      initRef.current = false
    }
  }, [])

  // Load file when activeFile changes
  useEffect(() => {
    if (!activeFile) {
      setContent("")
      setUserEdited(false)
      if (viewRef.current) {
        viewRef.current.dispatch({
          changes: { from: 0, to: viewRef.current.state.doc.length, insert: "" },
        })
      }
      return
    }

    isLoadingRef.current = true
    invoke<string>("read_file", { path: activeFile })
      .then((text) => {
        setContent(text)
        setUserEdited(false)
        if (viewRef.current) {
          viewRef.current.dispatch({
            changes: { from: 0, to: viewRef.current.state.doc.length, insert: text },
          })
        }
      })
      .catch(() => {
        setContent("")
        if (viewRef.current) {
          viewRef.current.dispatch({
            changes: { from: 0, to: viewRef.current.state.doc.length, insert: "" },
          })
        }
      })
      .finally(() => {
        isLoadingRef.current = false
      })
  }, [activeFile])

  useFileAutoSave(content, userEdited)

  const previewHtml = content ? (marked(content) as string) : ""

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

  if (isSourceMode) {
    return (
      <div style={{ position: "absolute", inset: 0 }}>
        <div ref={editorContainerRef} style={{ height: "100%", overflow: "hidden" }} />
      </div>
    )
  }

  return (
    <div className="flex" style={{ height: "100%", overflow: "hidden" }}>
      <div style={{ width: "50%", height: "100%", position: "relative", borderRight: "1px solid var(--color-border)" }}>
        <div ref={editorContainerRef} style={{ position: "absolute", inset: 0 }} />
      </div>
      <div
        style={{ width: "50%", height: "100%", overflow: "auto", padding: "24px", backgroundColor: "var(--color-background)" }}
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />
    </div>
  )
}