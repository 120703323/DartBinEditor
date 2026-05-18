import { useEffect, useState } from "react"
import { TipTapEditor } from "./components/editor/TipTapEditor"
import { EditorToolbar } from "./components/editor/EditorToolbar"
import { TabBar } from "./components/editor/TabBar"
import { FileTree } from "./components/sidebar/FileTree"
import { SearchPanel } from "./components/sidebar/SearchPanel"
import { OutlinePanel } from "./components/sidebar/OutlinePanel"
import { TagPanel } from "./components/sidebar/TagPanel"
import { CommandPalette } from "./components/panels/CommandPalette"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { useEditorStore } from "./stores/editor"
import "./globals.css"

type SidebarTab = "files" | "search" | "outline" | "tags"

const tabs: { key: SidebarTab; label: string }[] = [
  { key: "files", label: "文件" },
  { key: "search", label: "搜索" },
  { key: "outline", label: "大纲" },
  { key: "tags", label: "标签" },
]

function App() {
  const { theme, isSidebarOpen, activeFile } = useEditorStore()
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("files")

  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else if (theme === "light") {
      root.classList.remove("dark")
    } else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      root.classList.toggle("dark", mq.matches)
      const handler = (e: MediaQueryListEvent) => root.classList.toggle("dark", e.matches)
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }
  }, [theme])

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`flex-shrink-0 bg-sidebar-bg border-r border-border transition-all duration-200 ease-out overflow-hidden ${
            isSidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0"
          }`}
        >
          <div className="w-64 h-full flex flex-col">
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
              {sidebarTab === "search" && <SearchPanel />}
              {sidebarTab === "outline" && <OutlinePanel />}
              {sidebarTab === "tags" && <TagPanel />}
            </ErrorBoundary>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 bg-editor-surface">
          <TabBar />
          <EditorToolbar />
          <div className="flex-1 overflow-hidden">
            <ErrorBoundary>
              <TipTapEditor />
            </ErrorBoundary>
          </div>

          <footer className="h-7 flex items-center px-4 bg-sidebar-bg border-t border-border text-xs text-muted-foreground font-ui shrink-0">
            <span>Ln 1</span>
            <span className="mx-2">|</span>
            <span>Col 0</span>
            <span className="mx-2">|</span>
            <span>UTF-8</span>
            {activeFile && (
              <>
                <span className="mx-2">|</span>
                <span className="truncate max-w-48">{activeFile.split("\\").pop()}</span>
              </>
            )}
            <span className="ml-auto">DartBinEditor v0.1.0</span>
          </footer>
        </main>
      </div>
      <CommandPalette />
    </div>
  )
}

export default App
