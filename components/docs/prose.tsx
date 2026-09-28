import Link from "next/link"
import { cn } from "cn"

import { CopyPage } from "@/components/docs/copy-page"
import { ChevronLeftIcon, ChevronRightIcon } from "@/lib/icons"
import { flatNav } from "@/lib/docs"

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <CopyPage />
      </div>
      {description && <p className="text-base text-pretty text-muted-foreground">{description}</p>}
    </div>
  )
}

export function H2({ children, id, className }: { children: string; id?: string; className?: string }) {
  const anchor = id ?? slugify(children)
  return (
    <h2 id={anchor} className={cn("group mt-12 scroll-mt-20 text-xl font-semibold tracking-tight first:mt-0", className)}>
      <a href={`#${anchor}`}>{children}</a>
    </h2>
  )
}

export function H3({ children, id }: { children: string; id?: string }) {
  const anchor = id ?? slugify(children)
  return (
    <h3 id={anchor} className="mt-8 scroll-mt-20 text-base font-semibold">
      <a href={`#${anchor}`}>{children}</a>
    </h3>
  )
}

export function P({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("leading-7 text-muted-foreground [&_strong]:text-foreground", className)}>{children}</p>
}

export function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">{children}</code>
}

export function List({ children }: { children: React.ReactNode }) {
  return (
    <ul className="ml-5 list-disc space-y-2 leading-7 text-muted-foreground marker:text-border [&_strong]:text-foreground">
      {children}
    </ul>
  )
}

export function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="flex flex-col gap-6 [counter-reset:step]">{children}</ol>
}

export function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="relative flex flex-col gap-3 border-l pl-8 [counter-increment:step] before:absolute before:-left-3 before:grid before:size-6 before:place-items-center before:rounded-full before:border before:bg-background before:font-mono before:text-xs before:text-muted-foreground before:content-[counter(step)]">
      <h3 className="font-medium">{title}</h3>
      {children}
    </li>
  )
}

export function Pager({ href }: { href: string }) {
  const i = flatNav.findIndex((n) => n.href === href)
  const prev = flatNav[i - 1]
  const next = flatNav[i + 1]
  return (
    <div data-md-skip className="mt-16 flex items-center justify-between gap-4 border-t pt-6 text-sm">
      {prev ? (
        <Link href={prev.href} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ChevronLeftIcon className="size-4" />
          {prev.title}
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={next.href} className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
          {next.title}
          <ChevronRightIcon className="size-4" />
        </Link>
      )}
    </div>
  )
}
