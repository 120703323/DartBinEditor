import { create } from "zustand"

export type ThemeId = "system" | "light" | "dark" | "default" | "rose" | "lavender" | "sky" | "mint" | "navy" | "sand" | "peach"

interface EditorStore {
  activeTheme: ThemeId
  activeFile: string | null
  openFiles: string[]
  isSidebarOpen: boolean
  isSourceMode: boolean
  typewriterMode: boolean
  focusMode: boolean
  currentDir: string
  sidebarWidth: number
  zoom: number
  setActiveTheme: (theme: ThemeId) => void
  setActiveFile: (path: string | null) => void
  openFile: (path: string) => void
  closeFile: (path: string) => void
  toggleSidebar: () => void
  toggleSourceMode: () => void
  toggleTypewriterMode: () => void
  toggleFocusMode: () => void
  setCurrentDir: (dir: string) => void
  setSidebarWidth: (width: number) => void
  setZoom: (zoom: number) => void
  clearCache: () => void
}

const STORAGE_KEYS = {
  SIDEBAR_WIDTH: "dartbineditor-sidebar-width",
  LAST_DIR: "dartbineditor-last-dir",
  OPEN_FILES: "dartbineditor-open-files",
  ACTIVE_FILE: "dartbineditor-active-file",
  ACTIVE_THEME: "dartbineditor-active-theme",
  ZOOM: "dartbineditor-zoom",
}

const clearAllStorage = () => {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
}

const getStoredSidebarWidth = (): number => {
  if (typeof window === "undefined") return 256
  const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_WIDTH)
  return stored ? parseInt(stored, 10) : 256
}

const getStoredLastDir = (): string => {
  if (typeof window === "undefined") return "."
  return localStorage.getItem(STORAGE_KEYS.LAST_DIR) || "."
}

const getStoredOpenFiles = (): string[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(STORAGE_KEYS.OPEN_FILES)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

const getStoredActiveFile = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_FILE)
}

const getStoredTheme = (): ThemeId => {
  if (typeof window === "undefined") return "system"
  return (localStorage.getItem(STORAGE_KEYS.ACTIVE_THEME) as ThemeId) || "system"
}

const getStoredZoom = (): number => {
  if (typeof window === "undefined") return 100
  const stored = localStorage.getItem(STORAGE_KEYS.ZOOM)
  return stored ? parseInt(stored, 10) : 100
}

export const useEditorStore = create<EditorStore>((set) => {
  let initialOpenFiles = getStoredOpenFiles()
  let initialActiveFile = getStoredActiveFile()

  if (initialActiveFile && !initialOpenFiles.includes(initialActiveFile)) {
    initialOpenFiles = [initialActiveFile]
    localStorage.setItem(STORAGE_KEYS.OPEN_FILES, JSON.stringify(initialOpenFiles))
  }

  return {
    activeTheme: getStoredTheme(),
    activeFile: initialActiveFile,
    openFiles: initialOpenFiles,
    isSidebarOpen: true,
    isSourceMode: false,
    typewriterMode: false,
    focusMode: false,
    currentDir: getStoredLastDir(),
    sidebarWidth: getStoredSidebarWidth(),
    zoom: getStoredZoom(),
    setActiveTheme: (theme) => {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_THEME, theme)
      set({ activeTheme: theme })
    },
    setActiveFile: (path) => {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_FILE, path || "")
      set({ activeFile: path })
    },
    openFile: (path) =>
      set((state) => {
        const newOpenFiles = state.openFiles.includes(path)
          ? state.openFiles
          : [...state.openFiles, path]
        localStorage.setItem(STORAGE_KEYS.OPEN_FILES, JSON.stringify(newOpenFiles))
        localStorage.setItem(STORAGE_KEYS.ACTIVE_FILE, path)
        return {
          openFiles: newOpenFiles,
          activeFile: path,
        }
      }),
    closeFile: (path) =>
      set((state) => {
        const newOpenFiles = state.openFiles.filter((f) => f !== path)
        localStorage.setItem(STORAGE_KEYS.OPEN_FILES, JSON.stringify(newOpenFiles))
        const newActive = state.activeFile === path
          ? (newOpenFiles[newOpenFiles.indexOf(path) - 1] || newOpenFiles[newOpenFiles.indexOf(path) + 1] || null)
          : state.activeFile
        localStorage.setItem(STORAGE_KEYS.ACTIVE_FILE, newActive || "")
        return {
          openFiles: newOpenFiles,
          activeFile: newActive,
        }
      }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    toggleSourceMode: () => set((state) => ({ isSourceMode: !state.isSourceMode })),
    toggleTypewriterMode: () => set((state) => ({ typewriterMode: !state.typewriterMode })),
    toggleFocusMode: () => set((state) => ({ focusMode: !state.focusMode })),
    setCurrentDir: (dir) => {
      localStorage.setItem(STORAGE_KEYS.LAST_DIR, dir)
      set({ currentDir: dir })
    },
    setSidebarWidth: (width) => {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_WIDTH, String(width))
      set({ sidebarWidth: width })
    },
    setZoom: (zoom) => {
      localStorage.setItem(STORAGE_KEYS.ZOOM, String(zoom))
      set({ zoom })
    },
    clearCache: () => {
      clearAllStorage()
      set({
        activeFile: null,
        openFiles: [],
        currentDir: ".",
        sidebarWidth: 256,
      })
      window.location.reload()
    },
  }
})
