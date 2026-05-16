import { NodeViewContent, NodeViewWrapper } from "@tiptap/react"

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "rust", label: "Rust" },
  { id: "go", label: "Go" },
  { id: "java", label: "Java" },
  { id: "json", label: "JSON" },
  { id: "markdown", label: "Markdown" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "bash", label: "Bash" },
  { id: "sql", label: "SQL" },
  { id: "yaml", label: "YAML" },
  { id: "mermaid", label: "Mermaid" },
]

export default function CodeBlockComponent({
  node,
  updateAttributes,
  extension,
}: {
  node: { attrs: { language?: string | null } }
  updateAttributes: (attrs: Record<string, string | null>) => void
  extension: { options: { defaultLanguage: string | null } }
}) {
  const lang = node.attrs.language || extension.options.defaultLanguage || ""

  return (
    <NodeViewWrapper className="code-block relative group/block not-prose">
      <select
        contentEditable={false}
        value={lang}
        onChange={(e) =>
          updateAttributes({ language: e.target.value || null })
        }
        onClick={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 z-10 text-xs font-mono bg-muted border border-border rounded px-1.5 py-0.5 opacity-0 group-hover/block:opacity-100 transition-opacity cursor-pointer text-foreground"
      >
        <option value="">Plain Text</option>
        {LANGUAGES.map((l) => (
          <option key={l.id} value={l.id}>
            {l.label}
          </option>
        ))}
      </select>
      <pre className="bg-muted rounded-lg p-4 overflow-x-auto">
        <code className="text-sm font-mono">
          <NodeViewContent />
        </code>
      </pre>
    </NodeViewWrapper>
  )
}
