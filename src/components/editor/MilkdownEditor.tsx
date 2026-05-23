import { useRef, useEffect, memo } from "react"
import { Editor, rootCtx, defaultValueCtx } from "@milkdown/kit/core"
import { commonmark } from "@milkdown/kit/preset/commonmark"
import { gfm } from "@milkdown/kit/preset/gfm"
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener"
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react"

interface MilkdownEditorProps {
  content: string
  onChange: (markdown: string) => void
  scrollPosRef: React.MutableRefObject<number>
}

function MilkdownEditorInner({ content, onChange, scrollPosRef }: MilkdownEditorProps) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const contentRef = useRef(content)
  contentRef.current = content
  const isUserEditRef = useRef(false)
  const debounceTimerRef = useRef<number | null>(null)

  useEditor((root) => {
    const editor = Editor.make()
    editor
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, contentRef.current || "")
        ctx.get(listenerCtx)
          .markdownUpdated((_ctx, markdown) => {
            if (isUserEditRef.current) {
              if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
              }
              debounceTimerRef.current = window.setTimeout(() => {
                onChangeRef.current(markdown)
              }, 300)
            }
          })
          .mounted(() => {
            isUserEditRef.current = true

            if (scrollPosRef.current > 0) {
              setTimeout(() => {
                const scrollable = root.closest('[data-scroll-wrapper]') as HTMLElement
                if (scrollable) {
                  scrollable.scrollTop = scrollPosRef.current
                }
              }, 50)
            }
          })
      })
      .use(commonmark)
      .use(gfm)
      .use(listener)
    return editor
  }, [])

  useEffect(() => {
    return () => {
      const el = document.querySelector('[data-scroll-wrapper]')
      if (el) {
        scrollPosRef.current = el.scrollTop
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [scrollPosRef])

  return <Milkdown />
}

export const MilkdownEditor = memo(function MilkdownEditor({ content, onChange, scrollPosRef }: MilkdownEditorProps) {
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
      <MilkdownProvider>
        <MilkdownEditorInner content={content} onChange={onChange} scrollPosRef={scrollPosRef} />
      </MilkdownProvider>
    </div>
  )
})
