import { useState, useRef, useEffect } from "react"
import { useEditorStore, type ThemeId } from "../../stores/editor"
import { triggerManualSave } from "../../hooks/useFileAutoSave"
import { AboutDialog } from "../ui/AboutDialog"

const baseThemes: { id: ThemeId; label: string; icon: string }[] = [
  { id: "system", label: "系统", icon: "monitor" },
  { id: "light", label: "明亮", icon: "sun" },
  { id: "dark", label: "暗黑", icon: "moon" },
]

const colorThemes: { id: ThemeId; label: string; gradient: string; solid: string }[] = [
  { id: "default", label: "靛蓝", gradient: "linear-gradient(135deg, #4F46E5, #7C3AED)", solid: "#4F46E5" },
  { id: "rose", label: "淡粉", gradient: "linear-gradient(135deg, #F472B6, #EC4899)", solid: "#EC4899" },
  { id: "lavender", label: "淡紫", gradient: "linear-gradient(135deg, #A78BFA, #8B5CF6)", solid: "#8B5CF6" },
  { id: "sky", label: "淡蓝", gradient: "linear-gradient(135deg, #38BDF8, #0EA5E9)", solid: "#0EA5E9" },
  { id: "mint", label: "豆沙", gradient: "linear-gradient(135deg, #34D399, #10B981)", solid: "#10B981" },
  { id: "navy", label: "藏青", gradient: "linear-gradient(135deg, #1E3A5F, #0F172A)", solid: "#1E3A5F" },
  { id: "sand", label: "暖沙", gradient: "linear-gradient(135deg, #D4A574, #B8860B)", solid: "#B8860B" },
  { id: "peach", label: "蜜桃", gradient: "linear-gradient(135deg, #FB923C, #F97316)", solid: "#F97316" },
]

export function EditorToolbar() {
  const {
    activeTheme,
    setActiveTheme,
    isSidebarOpen,
    toggleSidebar,
    isSourceMode,
    toggleSourceMode,
    typewriterMode,
    toggleTypewriterMode,
    focusMode,
    toggleFocusMode,
  } = useEditorStore()

  const [showThemePicker, setShowThemePicker] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const themePickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themePickerRef.current && !themePickerRef.current.contains(e.target as Node)) {
        setShowThemePicker(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const renderThemeIcon = (icon: string, isActive: boolean) => {
    switch (icon) {
      case "monitor":
        return (
          <svg className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-foreground"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        )
      case "sun":
        return (
          <svg className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-amber-500"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        )
      case "moon":
        return (
          <svg className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-slate-700"}`} viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <>
    <div className="flex items-center gap-1 px-2 h-10 bg-muted/50 border-b border-border">
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
        aria-label="Toggle sidebar"
        title="切换侧边栏"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="9" y1="3" x2="9" y2="21" />
          {isSidebarOpen && <rect x="3" y="3" width="6" height="18" rx="2" fill="currentColor" opacity="0.4" />}
        </svg>
      </button>

      <button
        onClick={triggerManualSave}
        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
        title="保存 (Ctrl+S)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
      </button>

      <div className="flex-1" />

      <div className="relative" ref={themePickerRef}>
        <button
          onClick={() => setShowThemePicker(!showThemePicker)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="主题设置"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </button>

        {showThemePicker && (
          <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-xl p-3 shadow-2xl z-50 w-64">
            <div className="flex gap-2 mb-4">
              {baseThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(theme.id)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-lg transition-all duration-200 ${
                    activeTheme === theme.id
                      ? "bg-primary text-primary-foreground shadow-md scale-105"
                      : "bg-muted/50 hover:bg-muted text-foreground hover:scale-102"
                  }`}
                >
                  {renderThemeIcon(theme.icon, activeTheme === theme.id)}
                  <span className="text-[11px] font-medium">{theme.label}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {colorThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(theme.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all duration-200 ${
                    activeTheme === theme.id
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                      : "hover:bg-muted/50 hover:scale-102"
                  }`}
                  title={theme.label}
                >
                  <div
                    className="w-8 h-8 rounded-full shadow-lg border-2 border-white/20"
                    style={{ 
                      background: theme.gradient,
                      boxShadow: `0 4px 12px ${theme.solid}40`
                    }}
                  />
                  <span className="text-[11px] font-medium">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={toggleSourceMode}
        className={`p-1.5 rounded-md transition-colors ${
          isSourceMode ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        title={isSourceMode ? "阅读模式" : "源码模式"}
      >
        {isSourceMode ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        )}
      </button>

      <button
        onClick={toggleTypewriterMode}
        className={`p-1.5 rounded-md transition-colors ${
          typewriterMode ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        title="打字机模式：当前行保持在屏幕中央"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 10H3" />
          <path d="M21 6H3" />
          <path d="M21 14H3" />
          <path d="M17 18H3" />
        </svg>
      </button>

      <button
        onClick={toggleFocusMode}
        className={`p-1.5 rounded-md transition-colors ${
          focusMode ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
        title="专注模式：只高亮当前段落"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      <button
        onClick={() => setShowAbout(true)}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="关于"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
      </button>
    </div>

      <AboutDialog isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </>
  )
}
