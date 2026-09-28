import * as icons from "@/lib/icons"

export function IconGrid() {
  const entries = Object.entries(icons).filter(([name]) => name.endsWith("Icon")) as [string, icons.IconComponent][]
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {entries.map(([name, Icon]) => (
        <div key={name} className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5">
          <Icon className="size-4 shrink-0" />
          <code className="truncate font-mono text-xs text-muted-foreground">{name}</code>
        </div>
      ))}
    </div>
  )
}
