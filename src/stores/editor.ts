import { create } from "zustand"

interface SearchResult {
  path: string
  title: string
  snippet: string
  score: number
}

interface EditorStore {
  theme: "light" | "dark" | "system"
  activeFile: string | null
  openFiles: string[]
  isSidebarOpen: boolean
  isSourceMode: boolean
  typewriterMode: boolean
  focusMode: boolean
  searchQuery: string
  searchResults: SearchResult[]
  currentDir: string
  setTheme: (theme: "light" | "dark" | "system") => void
  setActiveFile: (path: string | null) => void
  openFile: (path: string) => void
  closeFile: (path: string) => void
  toggleSidebar: () => void
  toggleSourceMode: () => void
  toggleTypewriterMode: () => void
  toggleFocusMode: () => void
  setSearchQuery: (query: string) => void
  setSearchResults: (results: SearchResult[]) => void
  setCurrentDir: (dir: string) => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  theme: "system",
  activeFile: null,
  openFiles: [],
  isSidebarOpen: true,
  isSourceMode: false,
  typewriterMode: false,
  focusMode: false,
  searchQuery: "",
  searchResults: [],
  currentDir: ".",
  setTheme: (theme) => set({ theme }),
  setActiveFile: (path) => set({ activeFile: path }),
  openFile: (path) =>
    set((state) => ({
      openFiles: state.openFiles.includes(path)
        ? state.openFiles
        : [...state.openFiles, path],
      activeFile: path,
    })),
  closeFile: (path) =>
    set((state) => ({
      openFiles: state.openFiles.filter((f) => f !== path),
      activeFile:
        state.activeFile === path
          ? state.openFiles[state.openFiles.indexOf(path) - 1] ||
            state.openFiles[state.openFiles.indexOf(path) + 1] ||
            null
          : state.activeFile,
    })),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleSourceMode: () => set((state) => ({ isSourceMode: !state.isSourceMode })),
  toggleTypewriterMode: () => set((state) => ({ typewriterMode: !state.typewriterMode })),
  toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSearchResults: (results) => set({ searchResults: results }),
  setCurrentDir: (dir) => set({ currentDir: dir }),
}))
