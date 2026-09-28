"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "cn"

import { nav } from "@/lib/docs"

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-6 text-sm">
      {nav.map((group) => (
        <div key={group.title} className="flex flex-col gap-0.5">
          <h4 className="mb-1 px-2 text-xs font-medium text-muted-foreground">{group.title}</h4>
          {group.items.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-7 items-center gap-2 rounded-md px-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  active && "bg-accent font-medium text-foreground"
                )}
              >
                {item.title}
                {item.isNew && <span className="size-1.5 rounded-full bg-muted-foreground/50" aria-label="New" />}
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}
