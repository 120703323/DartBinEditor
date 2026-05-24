import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import { useEffect, useRef } from "react"
import { useEditorStore } from "../../stores/editor"
import "./MonacoEditor.css"

interface NovelEditorProps {
  content: string
  onChange: (content: string) => void
}

export function NovelEditor({ content, onChange }: NovelEditorProps) {
  const { activeFile, setStats } = useEditorStore()
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        inline: false,
      }),
      Placeholder.configure({
        placeholder: "开始写作...",
      }),
    ],
    content: "",
    editable: true,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChangeRef.current(html)

      const text = editor.getText()
      const lines = text.split("\n").length
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      setStats({ lines, words })
    },
  })

  const prevActiveFileRef = useRef<string | null>(null)

  // Set content only when activeFile changes (new file loaded), not during editing
  // Using key={activeFile} in parent ensures component remounts on file change
  useEffect(() => {
    if (!activeFile || !editor) return

    // Only set content if this is a new file (not the same as previous)
    if (activeFile !== prevActiveFileRef.current) {
      prevActiveFileRef.current = activeFile
      if (content && content !== "<p><br></p>") {
        editor.commands.setContent(content, false)
      }
    }
  }, [activeFile, content, editor])

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

  return (
    <div className="h-full w-full overflow-y-auto bg-background">
      <EditorContent editor={editor} className="h-full novel-editor-content" />
    </div>
  )
}