import { useEffect, useRef, useCallback, memo } from "react"
import { EditorView, keymap, highlightActiveLine } from "@codemirror/view"
import { EditorState, Extension } from "@codemirror/state"
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands"
import { markdown } from "@codemirror/lang-markdown"

interface SimpleMarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  scrollPosRef: React.MutableRefObject<number>
}

export const SimpleMarkdownEditor = memo(function SimpleMarkdownEditor({ content, onChange, scrollPosRef }: SimpleMarkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const isInternalChangeRef = useRef(false)

  const handleChange = useCallback((markdown: string) => {
    isInternalChangeRef.current = true
    onChangeRef.current(markdown)
    requestAnimationFrame(() => {
      isInternalChangeRef.current = false
    })
  }, [])

  useEffect(() => {
    if (!editorRef.current) return

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && !isInternalChangeRef.current) {
        handleChange(update.state.doc.toString())
      }
    })

    const theme = EditorView.theme({
      "&": {
        height: "100%",
        fontSize: "14px",
      },
      ".cm-content": {
        fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
        padding: "1rem",
        maxWidth: "780px",
        margin: "0 auto",
      },
      ".cm-gutters": {
        display: "none",
      },
      ".cm-scroller": {
        overflow: "visible",
        height: "auto",
      },
      ".cm-focused": {
        outline: "none",
      },
      ".cm-line": {
        padding: "0 1rem",
      },
      "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
        backgroundColor: "var(--color-primary, #6366f1)33",
      },
    })

    const extensions: Extension[] = [
      highlightActiveLine(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      markdown(),
      updateListener,
      theme,
      EditorView.lineWrapping,
    ]

    const state = EditorState.create({
      doc: content,
      extensions,
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    if (scrollPosRef.current > 0) {
      setTimeout(() => {
        const scrollable = editorRef.current?.closest('[data-scroll-wrapper]') as HTMLElement
        if (scrollable) {
          scrollable.scrollTop = scrollPosRef.current
        }
      }, 50)
    }

    return () => {
      const scrollable = editorRef.current?.closest('[data-scroll-wrapper]') as HTMLElement
      if (scrollable) {
        scrollPosRef.current = scrollable.scrollTop
      }
      view.destroy()
      viewRef.current = null
    }
  }, [])

  if (!content && content !== "") {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-ui">DartBinEditor</p>
          <p className="text-sm mt-2">从侧边栏选择一个文件开始编辑</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-editor-surface">
      <div ref={editorRef} className="h-full" />
    </div>
  )
})
