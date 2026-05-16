import { Mark, markInputRule, markPasteRule } from "@tiptap/core"

export interface WikiLinkOptions {
  HTMLAttributes: Record<string, unknown>
  openLink: (page: string) => void
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    wikiLink: {
      toggleWikiLink: () => ReturnType
    }
  }
}

export const inputRegex = /\[\[([^\]]+)\]\]$/

export const WikiLinkExtension = Mark.create<WikiLinkOptions>({
  name: "wikiLink",

  addOptions() {
    return {
      HTMLAttributes: {
        class:
          "wiki-link bg-primary/10 text-primary border-b border-dashed border-primary/30 cursor-pointer rounded-sm px-0.5",
      },
      openLink: () => {},
    }
  },

  addAttributes() {
    return {
      page: {
        default: null,
        parseHTML: (el) => (el as HTMLElement).getAttribute("data-page"),
        renderHTML: (attrs) => {
          if (!attrs.page) return {}
          return { "data-page": attrs.page }
        },
      },
    }
  },

  parseHTML() {
    return [{ tag: "span[data-page]" }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0]
  },

  addInputRules() {
    return [
      markInputRule({
        find: inputRegex,
        type: this.type,
      }),
    ]
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: inputRegex,
        type: this.type,
      }),
    ]
  },

  addCommands() {
    return {
      toggleWikiLink:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name)
        },
    }
  },
})
