import { CopyButton } from "@/components/docs/copy-button"

/** A titled, copyable code block for a Studio's Code tab. */
export function CodePanel({ title, code, note }: { title?: string; code: string; note?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {title && <h2 className="text-sm font-medium">{title}</h2>}
      <div className="relative overflow-hidden rounded-2xl border bg-card">
        <CopyButton value={code} className="absolute top-3 right-3" />
        <pre className="max-h-160 overflow-auto p-5 font-mono text-xs leading-relaxed">{code}</pre>
      </div>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  )
}
