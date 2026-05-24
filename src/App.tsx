import { useEffect, useState } from "react"
import { MonacoEditor } from "./components/editor/MonacoEditor"
import { EditorToolbar } from "./components/editor/EditorToolbar"
import { TabBar } from "./components/editor/TabBar"
import { FileTree } from "./components/sidebar/FileTree"
import { OutlinePanel } from "./components/sidebar/OutlinePanel"
import { CommandPalette } from "./components/panels/CommandPalette"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { ResizableDivider } from "./components/editor/ResizableDivider"
import { useEditorStore, type ThemeId } from "./stores/editor"
import { triggerManualSave } from "./hooks/useFileAutoSave"
import { invoke } from "@tauri-apps/api/core"
import "./globals.css"

type SidebarTab = "files" | "outline"

const tabs: { key: SidebarTab; label: string }[] = [
  { key: "files", label: "文件" },
  { key: "outline", label: "大纲" },
]

function getThemeConfig(themeId: ThemeId): { isDark: boolean; colorScheme: string } {
  switch (themeId) {
    case "system": {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      return { isDark, colorScheme: "default" }
    }
    case "light":
      return { isDark: false, colorScheme: "default" }
    case "dark":
      return { isDark: true, colorScheme: "dark" }
    case "navy":
      return { isDark: true, colorScheme: "navy" }
    default:
      return { isDark: false, colorScheme: themeId }
  }
}

function App() {
  const { activeTheme, isSidebarOpen, sidebarWidth, zoom, setZoom, openFile } = useEditorStore()
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("files")

  useEffect(() => {
    const root = document.documentElement
    const config = getThemeConfig(activeTheme)
    
    if (config.isDark) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    
    root.setAttribute("data-color-scheme", config.colorScheme)

    if (activeTheme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = () => {
        const newConfig = getThemeConfig("system")
        root.classList.toggle("dark", newConfig.isDark)
      }
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }
  }, [activeTheme])

  // Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        triggerManualSave()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // 启动时查询待打开的文件（文件关联双击打开）
  useEffect(() => {
    invoke<string | null>("get_pending_open_file").then((filePath) => {
      if (filePath) {
        console.log("打开启动文件:", filePath)
        openFile(filePath)
        let dir = "."
        if (filePath.includes("\\")) {
          dir = filePath.split("\\").slice(0, -1).join("\\")
        } else if (filePath.includes("/")) {
          dir = filePath.split("/").slice(0, -1).join("/")
        }
        if (dir && dir !== filePath) {
          useEditorStore.getState().setCurrentDir(dir)
        }
      }
    }).catch((e) => {
      console.error("查询待打开文件失败:", e)
    })
  }, [openFile])

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <aside
          className="bg-sidebar-bg border-r border-border overflow-hidden flex-shrink-0 transition-[width] duration-200 ease-out"
          style={{
            width: isSidebarOpen ? sidebarWidth : 0,
            opacity: isSidebarOpen ? 1 : 0,
          }}
        >
          <div className="h-full flex flex-col" style={{ width: sidebarWidth }}>
            <div className="flex border-b border-border shrink-0">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSidebarTab(key)}
                  className={`flex-1 px-2 py-2 text-xs font-ui uppercase tracking-widest transition-colors ${
                    sidebarTab === key
                      ? "text-foreground border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <ErrorBoundary>
              {sidebarTab === "files" && <FileTree />}
              {sidebarTab === "outline" && <OutlinePanel />}
            </ErrorBoundary>
          </div>
        </aside>

        <ResizableDivider />

        <main className="flex-1 flex flex-col min-w-0 bg-editor-surface">
          <EditorToolbar />
          <TabBar />
          <div className="flex-1 overflow-hidden">
            <ErrorBoundary>
              <MonacoEditor />
            </ErrorBoundary>
          </div>

          <footer className="h-7 flex items-center px-4 bg-sidebar-bg border-t border-border text-xs font-ui shrink-0">
            <div className="flex-1">
              <span id="save-status"></span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <button
                onClick={() => setZoom(Math.max(60, zoom - 10))}
                className="px-1 hover:text-foreground transition-colors"
                title="缩小"
              >
                −
              </button>
              <span className="w-10 text-center cursor-default" title="Ctrl+滚轮缩放">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="px-1 hover:text-foreground transition-colors"
                title="放大"
              >
                +
              </button>
              <span className="ml-3 mr-2">|</span>
              <span id="stats-lines">0 行</span>
              <span className="mx-2">|</span>
              <span id="stats-words">0 字</span>
              <span className="mx-2">|</span>
              <span>UTF-8</span>
            </div>
          </footer>
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}

export default App
