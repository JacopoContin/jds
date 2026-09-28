"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { cn } from "cn"

type Heading = { id: string; text: string; level: number }

/** Reads h2/h3 with ids from the page and highlights the one in view. */
export function Toc() {
  const pathname = usePathname()
  const [headings, setHeadings] = React.useState<Heading[]>([])
  const [active, setActive] = React.useState<string | null>(null)

  React.useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-docs] :is(h2, h3)[id]"))
    queueMicrotask(() =>
      setHeadings(els.map((el) => ({ id: el.id, text: el.textContent ?? "", level: el.tagName === "H3" ? 3 : 2 })))
    )
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-80px 0px -70% 0px" }
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [pathname])

  if (headings.length === 0) return null

  return (
    <div className="flex flex-col gap-2 text-sm">
      <h4 className="text-xs font-medium text-muted-foreground">On this page</h4>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className={cn(
            "text-muted-foreground transition-colors hover:text-foreground",
            h.level === 3 && "pl-3",
            active === h.id && "text-foreground"
          )}
        >
          {h.text}
        </a>
      ))}
    </div>
  )
}
