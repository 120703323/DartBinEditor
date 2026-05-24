import { useEffect, useRef, useCallback, useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Underline from "@tiptap/extension-underline"
import ImageExtension from "@tiptap/extension-image"
import { marked } from "marked"
import { invoke } from "@tauri-apps/api/core"
import { useEditorStore } from "../../stores/editor"
import { useFileAutoSave } from "../../hooks/useFileAutoSave"
import { useMermaidRenderer } from "../../hooks/useMermaidRenderer"
import { useMathRenderer } from "../../hooks/useMathRenderer"
import { CodeBlockExtension } from "./CodeBlockExtension"

export function TipTapEditor() {
  const { activeFile, isSourceMode } = useEditorStore()
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const [userEdited, setUserEdited] = useState(false)
  const suppressUpdateRef = useRef(false)

  const onUpdate = useCallback(() => {
    if (!suppressUpdateRef.current) {
      setUserEdited(true)
    }
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: "开始写作...",
      }),
      Underline,
      ImageExtension.configure({ inline: false, allowBase64: true }),
      CodeBlockExtension,
    ],
    content: "",
    editorProps: {
      attributes: { class: "tiptap-editor" },
    },
    onUpdate,
  })

  useEffect(() => {
    if (!editor) return
    setUserEdited(false)
    suppressUpdateRef.current = true
    if (!activeFile) {
      editor.commands.setContent("")
      suppressUpdateRef.current = false
      return
    }
    let cancelled = false
    invoke<string>("read_file", { path: activeFile })
      .then((text) => {
        if (!cancelled && editor && !editor.isDestroyed) {
          suppressUpdateRef.current = true
          const html = marked.parse(text) as string
          editor.commands.setContent(html)
          suppressUpdateRef.current = false
        }
      })
      .catch(() => {
        if (!cancelled && editor && !editor.isDestroyed) {
          suppressUpdateRef.current = true
          editor.commands.setContent("")
          suppressUpdateRef.current = false
        }
      })
    return () => { cancelled = true }
  }, [editor, activeFile, onUpdate])

  const htmlContent = editor?.getHTML()

  useFileAutoSave(htmlContent, userEdited)
  useMermaidRenderer(editorContainerRef)
  useMathRenderer(editorContainerRef)

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
      <textarea
        className="w-full h-full p-8 font-code text-sm bg-editor-surface text-foreground resize-none focus:outline-none"
        value={editor?.getText() || ""}
        readOnly
      />
    )
  }

  return (
    <div ref={editorContainerRef} className="h-full overflow-y-auto">
      <EditorContent editor={editor} className="h-full" />
    </div>
  )
}
