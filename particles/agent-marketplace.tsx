"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AgentIcon, CheckIcon, SearchIcon, StarIcon } from "@/lib/icons"
import { spring } from "@/lib/motion"

type Category = "Support" | "Research" | "Engineering" | "Sales"

type Listing = {
  id: string
  name: string
  author: string
  category: Category
  description: string
  rating: number
  installs: string
  permissions: string[]
}

const listings: Listing[] = [
  {
    id: "refunds",
    name: "Refund desk",
    author: "JDS",
    category: "Support",
    description: "Handles refund requests end to end and asks before moving money.",
    rating: 4.8,
    installs: "12k",
    permissions: ["Read orders", "Issue refunds (with approval)", "Send email"],
  },
  {
    id: "triage",
    name: "Ticket triage",
    author: "Helpwise",
    category: "Support",
    description: "Tags, prioritizes and routes incoming tickets to the right team.",
    rating: 4.6,
    installs: "8.1k",
    permissions: ["Read tickets", "Update tickets"],
  },
  {
    id: "scout",
    name: "Market scout",
    author: "Northwind",
    category: "Research",
    description: "Weekly briefing on competitors, pricing changes and launches, with sources.",
    rating: 4.7,
    installs: "5.4k",
    permissions: ["Web search", "Write to Notion"],
  },
  {
    id: "reviewer",
    name: "PR reviewer",
    author: "JDS",
    category: "Engineering",
    description: "Reads pull requests, flags risky changes and suggests tests.",
    rating: 4.9,
    installs: "21k",
    permissions: ["Read repositories", "Comment on pull requests"],
  },
  {
    id: "oncall",
    name: "On-call buddy",
    author: "Pager Labs",
    category: "Engineering",
    description: "Summarizes alerts, finds related incidents and drafts the status update.",
    rating: 4.5,
    installs: "3.2k",
    permissions: ["Read alerts", "Post to Slack"],
  },
  {
    id: "outreach",
    name: "Warm outreach",
    author: "Pipeline Co",
    category: "Sales",
    description: "Researches leads and drafts personal first emails for you to send.",
    rating: 4.4,
    installs: "6.7k",
    permissions: ["Web search", "Draft email"],
  },
]

const categories: ("All" | Category)[] = ["All", "Support", "Research", "Engineering", "Sales"]

export default function AgentMarketplace() {
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState<string[]>(["All"])
  const [added, setAdded] = React.useState<string[]>(["reviewer"])
  const [open, setOpen] = React.useState<Listing | null>(null)

  const cat = category[0] ?? "All"
  const visible = listings.filter(
    (l) =>
      (cat === "All" || l.category === cat) &&
      (l.name + l.description).toLowerCase().includes(query.trim().toLowerCase()),
  )
  const toggle = (id: string) => setAdded((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))

  return (
    <div className="flex h-160 w-full flex-col overflow-hidden rounded-2xl border bg-background">
      <div className="flex flex-wrap items-center gap-3 border-b p-4">
        <InputGroup className="max-w-xs">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search agents" value={query} onChange={(e) => setQuery(e.target.value)} />
        </InputGroup>
        <ToggleGroup value={category} onValueChange={(v) => v.length && setCategory(v as string[])} size="sm">
          {categories.map((c) => (
            <ToggleGroupItem key={c} value={c}>
              {c}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {visible.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No agents match</EmptyTitle>
              <EmptyDescription>Try another word or category.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <motion.ul layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false}>
              {visible.map((l) => (
                <motion.li
                  key={l.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={spring.gentle}
                  className="flex flex-col gap-3 rounded-xl border bg-card p-4"
                >
                  <button
                    type="button"
                    onClick={() => setOpen(l)}
                    className="flex flex-col gap-3 text-left outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-4">
                        <AgentIcon />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{l.name}</div>
                        <div className="text-xs text-muted-foreground">by {l.author}</div>
                      </div>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">{l.description}</p>
                  </button>
                  <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 [&_svg]:size-3.5">
                      <StarIcon />
                      <span className="tabular-nums">{l.rating}</span>
                    </span>
                    <span className="tabular-nums">{l.installs} installs</span>
                    <Button
                      size="xs"
                      variant={added.includes(l.id) ? "secondary" : "default"}
                      className="ml-auto"
                      onClick={() => toggle(l.id)}
                    >
                      {added.includes(l.id) ? (
                        <>
                          <CheckIcon />
                          Added
                        </>
                      ) : (
                        "Add"
                      )}
                    </Button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{open.name}</DialogTitle>
                <DialogDescription>{open.description}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground">It will be able to</span>
                <ul className="flex flex-col gap-1.5 text-sm">
                  {open.permissions.map((p) => (
                    <li key={p} className="flex items-center gap-2 [&_svg]:size-3.5 [&_svg]:text-muted-foreground">
                      <CheckIcon />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 pt-2">
                  <Badge variant="outline">{open.category}</Badge>
                  <Badge variant="outline">by {open.author}</Badge>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant={added.includes(open.id) ? "secondary" : "default"}
                  onClick={() => {
                    toggle(open.id)
                    setOpen(null)
                  }}
                >
                  {added.includes(open.id) ? "Remove" : "Add to workspace"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
