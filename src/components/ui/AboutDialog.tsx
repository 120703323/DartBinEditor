import { useEffect, useRef } from "react"

interface AboutDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function AboutDialog({ isOpen, onClose }: AboutDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={dialogRef}
        className="relative bg-background border border-border rounded-2xl shadow-2xl overflow-hidden w-[420px] animate-in zoom-in-95 fade-in duration-300"
      >
        {/* 顶部暖光装饰条 */}
        <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />

        <div className="p-8 pt-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col items-center text-center">
            {/* 图标区域 */}
            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <span className="text-white text-3xl font-black tracking-tighter" style={{ letterSpacing: '-2px' }}>DB</span>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-br from-amber-400/20 via-orange-500/20 to-red-500/20 rounded-2xl blur-lg" />
            </div>

            {/* 标题：彩色科技文字 */}
            <h1 className="text-3xl font-black mb-1 tracking-tight">
              <span className="inline-block animate-gradient bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-[length:200%_auto] bg-clip-text text-transparent">
                Dart
              </span>
              <span className="inline-block animate-gradient bg-gradient-to-r from-orange-400 via-red-500 to-purple-500 bg-[length:200%_auto] bg-clip-text text-transparent [animation-delay:0.15s]">
                Bin
              </span>
              <span className="inline-block animate-gradient bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-500 bg-[length:200%_auto] bg-clip-text text-transparent [animation-delay:0.3s]">
                Editor
              </span>
            </h1>

            {/* 版本号 + 标签 */}
            <div className="flex items-center gap-2 mb-4 mt-1">
              <span className="px-3 py-1 text-xs font-mono font-medium bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full">
                v0.1.0
              </span>
              <span className="px-3 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                AI-Native
              </span>
            </div>

            {/* 描述 */}
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              一款基于 AI 的现代化文本编辑器
              <br />
              支持多格式编辑、语法高亮、智能搜索
            </p>

            {/* 技术栈 */}
            <div className="w-full border-t border-border pt-4 mb-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Tauri v2</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>React 19</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span>TypeScript</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Rust</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground/60">
              Built with Tauri + React + TypeScript
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}