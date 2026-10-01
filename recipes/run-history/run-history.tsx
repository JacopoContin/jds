"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  ChartIcon,
  ClockIcon,
  ErrorIcon,
  SpinnerIcon,
  SuccessIcon,
  TableIcon,
  TokensIcon,
  TrendDownIcon,
  TrendUpIcon,
} from "@/lib/icons"
import { duration, ease } from "@/lib/motion"

/* ---------- Data (in a real app, from your runs API) ---------- */

type Day = { date: string; runs: number; failed: number }

const days: Day[] = [
  [42, 3],
  [51, 2],
  [47, 4],
  [38, 1],
  [22, 0],
  [18, 1],
  [55, 5],
  [63, 3],
  [58, 2],
  [71, 6],
  [66, 2],
  [34, 1],
  [29, 0],
  [74, 3],
].map(([runs, failed], i) => {
  const d = new Date(2026, 8, 15 + i)
  return { date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), runs, failed }
})

type RunStatus = "completed" | "failed" | "running"
type Run = {
  id: string
  agent: string
  task: string
  status: RunStatus
  duration: string
  tokens: string
  when: string
}

const runs: Run[] = [
  {
    id: "#1290",
    agent: "Support",
    task: "Refund order #4821",
    status: "completed",
    duration: "38s",
    tokens: "18.2k",
    when: "2m ago",
  },
  {
    id: "#1289",
    agent: "Researcher",
    task: "Compare voice agent vendors",
    status: "running",
    duration: "4m 12s",
    tokens: "42.9k",
    when: "6m ago",
  },
  {
    id: "#1288",
    agent: "Reviewer",
    task: "Review PR #982",
    status: "completed",
    duration: "1m 04s",
    tokens: "11.5k",
    when: "18m ago",
  },
  {
    id: "#1287",
    agent: "Ops",
    task: "Sync invoices to Xero",
    status: "failed",
    duration: "12s",
    tokens: "2.1k",
    when: "41m ago",
  },
  {
    id: "#1286",
    agent: "Support",
    task: "Answer shipping question",
    status: "completed",
    duration: "21s",
    tokens: "6.8k",
    when: "1h ago",
  },
  {
    id: "#1285",
    agent: "Support",
    task: "Update address for #4799",
    status: "completed",
    duration: "29s",
    tokens: "7.3k",
    when: "1h ago",
  },
  {
    id: "#1284",
    agent: "Ops",
    task: "Archive 214 invoices",
    status: "failed",
    duration: "9s",
    tokens: "1.4k",
    when: "2h ago",
  },
]

/* ---------- Stat tile ---------- */

function StatTile({
  label,
  value,
  delta,
  goodWhenUp = true,
  icon,
}: {
  label: string
  value: string
  delta: number
  goodWhenUp?: boolean
  icon: React.ReactNode
}) {
  const up = delta >= 0
  const good = up === goodWhenUp
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground [&_svg]:size-4">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div
        className={cn(
          "flex items-center gap-1 text-xs [&_svg]:size-3.5",
          good ? "text-success-foreground" : "text-destructive-foreground",
        )}
      >
        {up ? <TrendUpIcon /> : <TrendDownIcon />}
        <span className="tabular-nums">
          {up ? "+" : ""}
          {delta}%
        </span>
        <span className="text-muted-foreground">vs last week</span>
      </div>
    </div>
  )
}

/* ---------- Runs per day: single-series columns ---------- */

const CHART_H = 160
const niceMax = (n: number) => Math.ceil(n / 20) * 20

function RunsChart() {
  const [hover, setHover] = React.useState<number | null>(null)
  const max = niceMax(Math.max(...days.map((d) => d.runs)))
  const ticks = [0, max / 2, max]
  // Data-driven positions go through CSS variables; the chart height is the h-40 class (160px).

  return (
    <div className="relative flex gap-3">
      {/* Y axis */}
      <div className="relative h-40 w-6 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
        {ticks.map((t) => (
          <span
            key={t}
            className="absolute top-(--y) right-0 -translate-y-1/2"
            style={{ "--y": `${CHART_H - (t / max) * CHART_H}px` } as React.CSSProperties}
          >
            {t}
          </span>
        ))}
      </div>

      <div className="relative min-w-0 flex-1">
        {/* Hairline grid */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40">
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute inset-x-0 top-(--y) h-px bg-border"
              style={{ "--y": `${CHART_H - (t / max) * CHART_H}px` } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Columns: each slot is the hover and tap target; the bar is capped at 24px */}
        <div className="relative flex h-40 items-end gap-0.5" onMouseLeave={() => setHover(null)}>
          {days.map((d, i) => (
            <div
              key={d.date}
              className="group relative flex h-full flex-1 items-end justify-center"
              onMouseEnter={() => setHover(i)}
              onPointerDown={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              tabIndex={0}
              role="img"
              aria-label={`${d.date}: ${d.runs} runs, ${d.failed} failed`}
            >
              <motion.div
                className={cn(
                  "w-full max-w-6 rounded-t-sm bg-primary transition-opacity",
                  hover !== null && hover !== i && "opacity-40",
                )}
                initial={{ height: 0 }}
                animate={{ height: (d.runs / max) * CHART_H }}
                transition={{ duration: duration.slow, ease: ease.out, delay: i * 0.02 }}
              />
            </div>
          ))}
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {hover !== null && (
            <motion.div
              key="tip"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.fast }}
              className="pointer-events-none absolute bottom-(--tip-b) left-(--tip-x) z-10 -translate-x-1/2 rounded-lg border bg-popover px-2.5 py-1.5 text-xs shadow-md"
              style={
                {
                  "--tip-x": `${((hover + 0.5) / days.length) * 100}%`,
                  "--tip-b": `${(days[hover].runs / max) * CHART_H + 8 + 24}px`,
                } as React.CSSProperties
              }
            >
              <div className="font-medium">{days[hover].date}</div>
              <div className="flex gap-3 text-muted-foreground tabular-nums">
                <span>
                  <span className="text-foreground">{days[hover].runs}</span> runs
                </span>
                <span>
                  <span className="text-foreground">{days[hover].failed}</span> failed
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* X axis: first, middle, last */}
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{days[0].date}</span>
          <span>{days[Math.floor(days.length / 2)].date}</span>
          <span>{days[days.length - 1].date}</span>
        </div>
      </div>
    </div>
  )
}

function RunsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Day</TableHead>
          <TableHead className="text-right">Runs</TableHead>
          <TableHead className="text-right">Failed</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {days.map((d) => (
          <TableRow key={d.date}>
            <TableCell>{d.date}</TableCell>
            <TableCell className="text-right">
              <span className="tabular-nums">{d.runs}</span>
            </TableCell>
            <TableCell className="text-right">
              <span className="tabular-nums">{d.failed}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/* ---------- Screen ---------- */

const statusMeta: Record<
  RunStatus,
  { label: string; icon: React.ReactNode; variant: "secondary" | "destructive" | "outline" }
> = {
  completed: { label: "Completed", icon: <SuccessIcon />, variant: "secondary" },
  failed: { label: "Failed", icon: <ErrorIcon />, variant: "destructive" },
  running: { label: "Running", icon: <SpinnerIcon className="animate-spin" />, variant: "outline" },
}

export default function RunHistory() {
  const [view, setView] = React.useState<string[]>(["chart"])
  const [filter, setFilter] = React.useState<"all" | RunStatus>("all")
  const total = days.slice(-7).reduce((a, d) => a + d.runs, 0)
  const failed = days.slice(-7).reduce((a, d) => a + d.failed, 0)
  const visible = runs.filter((r) => filter === "all" || r.status === filter)

  return (
    <div className="flex h-160 w-full flex-col gap-4 overflow-y-auto rounded-2xl border bg-background p-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Runs, last 7 days" value={total.toLocaleString()} delta={18} icon={<ChartIcon />} />
        <StatTile
          label="Success rate"
          value={`${(((total - failed) / total) * 100).toFixed(1)}%`}
          delta={1.2}
          icon={<SuccessIcon />}
        />
        <StatTile label="Median duration" value="31s" delta={-9} goodWhenUp={false} icon={<ClockIcon />} />
        <StatTile label="Tokens" value="1.4M" delta={22} goodWhenUp={false} icon={<TokensIcon />} />
      </div>

      <section className="flex flex-col gap-4 rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium">Runs per day</h3>
            <p className="text-xs text-muted-foreground">Last 14 days, all agents</p>
          </div>
          <ToggleGroup
            value={view}
            onValueChange={(v) => v.length && setView(v as string[])}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="chart" aria-label="Chart view">
              <ChartIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table view">
              <TableIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        {view[0] === "table" ? (
          <div className="max-h-44 overflow-y-auto">
            <RunsTable />
          </div>
        ) : (
          <RunsChart />
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-medium">Recent runs</h3>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
              <TabsTrigger value="running">Running</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Run</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead className="text-right">Tokens</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <span className="font-mono text-muted-foreground">{r.id}</span>
                </TableCell>
                <TableCell>{r.agent}</TableCell>
                <TableCell>
                  <span className="block max-w-56 truncate">{r.task}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={statusMeta[r.status].variant}>
                    {statusMeta[r.status].icon}
                    {statusMeta[r.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="tabular-nums">{r.duration}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="tabular-nums">{r.tokens}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  )
}
