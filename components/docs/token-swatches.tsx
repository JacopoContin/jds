import { cn } from "cn"

const groups = [
  {
    title: "Surface",
    tokens: [
      ["background", "bg-background"],
      ["card", "bg-card"],
      ["popover", "bg-popover"],
      ["muted", "bg-muted"],
      ["accent", "bg-accent"],
      ["secondary", "bg-secondary"],
    ],
  },
  {
    title: "Content",
    tokens: [
      ["foreground", "bg-foreground"],
      ["muted-foreground", "bg-muted-foreground"],
      ["primary", "bg-primary"],
      ["border", "bg-border"],
      ["input", "bg-input"],
      ["ring", "bg-ring"],
    ],
  },
  {
    title: "Signal",
    tokens: [
      ["success", "bg-success"],
      ["warning", "bg-warning"],
      ["info", "bg-info"],
      ["destructive", "bg-destructive"],
    ],
  },
] as const

function Palette({ theme }: { theme: "light" | "dark" }) {
  return (
    <div className={cn(theme, "flex flex-col gap-5 rounded-xl border bg-background p-5 text-foreground")}>
      <div className="font-mono text-xs text-muted-foreground">{theme}</div>
      {groups.map((g) => (
        <div key={g.title} className="flex flex-col gap-2">
          <div className="text-xs font-medium">{g.title}</div>
          <div className="grid grid-cols-3 gap-2">
            {g.tokens.map(([name, cls]) => (
              <div key={name} className="flex flex-col gap-1.5">
                <div className={cn("h-10 rounded-md border", cls)} />
                <span className="truncate font-mono text-[11px] text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function TokenSwatches() {
  return (
    <div data-md-skip className="grid gap-4 sm:grid-cols-2">
      <Palette theme="light" />
      <Palette theme="dark" />
    </div>
  )
}
