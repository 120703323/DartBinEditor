import { useEffect, useRef, useCallback, useState } from "react"
import { EditorView, keymap, placeholder } from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands"
import { invoke } from "@tauri-apps/api/core"
import { marked } from "marked"
import { useEditorStore } from "../../stores/editor"
import { useFileAutoSave } from "../../hooks/useFileAutoSave"
import "./CodeMirrorEditor.css"

interface CodeMirrorEditorProps {
  onEditorMount?: (view: EditorView) => void
}

export function CodeMirrorEditor({ onEditorMount }: CodeMirrorEditorProps) {
  const { activeFile, isSourceMode } = useEditorStore()
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [content, setContent] = useState("")
  const previewRef = useRef<HTMLDivElement>(null)
  const [userEdited, setUserEdited] = useState(false)
  const isLoadingRef = useRef(false)

  const loadFile = useCallback(async (path: string) => {
    isLoadingRef.current = true
    try {
      const text = await invoke<string>("read_file", { path })
      setContent(text)
      if (viewRef.current) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: text,
          },
        })
      }
    } catch {
      setContent("")
      if (viewRef.current) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: "",
          },
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
    if (!editorRef.current) return

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const doc = update.state.doc.toString()
        setContent(doc)
        if (!isLoadingRef.current) {
          setUserEdited(true)
        }
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
          "&": {
            height: "100%",
            fontSize: "16px",
          },
          ".cm-content": {
            padding: "24px",
            fontFamily: "'Literata', serif",
            lineHeight: "1.75",
            maxWidth: "780px",
            margin: "0 auto",
          },
          ".cm-gutters": {
            display: "none",
          },
          ".cm-focused": {
            outline: "none",
          },
          ".cm-scroller": {
            overflow: "auto",
          },
          "&.cm-focused .cm-cursor": {
            borderLeftColor: "#3b82f6",
          },
          ".cm-selectionBackground": {
            backgroundColor: "#dbeafe80 !important",
          },
          "&.cm-focused .cm-selectionBackground": {
            backgroundColor: "#dbeafe80 !important",
          },
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view
    onEditorMount?.(view)

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [onEditorMount])

  useFileAutoSave(content, userEdited)

  const previewHtml = content ? marked(content) as string : ""

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
      <div ref={editorRef} className="h-full overflow-hidden" />
    )
  }

  return (
    <div className="h-full flex overflow-hidden">
      <div ref={editorRef} className="h-full flex-1 overflow-hidden border-r border-border" />
      <div
        ref={previewRef}
        className="flex-1 overflow-y-auto p-8 bg-background"
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />
    </div>
  )
}