import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { GithubIcon } from "@/components/docs/github-icon"
import { MobileNav } from "@/components/docs/mobile-nav"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { site } from "@/lib/site"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-6 px-4 md:px-6">
        <MobileNav />
        <Link href="/" className="font-mono text-sm font-medium">
          JDS<span className="text-ember">.</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          <Link href="/docs" className="transition-colors hover:text-foreground">
            Docs
          </Link>
          <Link href="/docs/components/prompt-input" className="transition-colors hover:text-foreground">
            Components
          </Link>
          <Link href="/particles" className="transition-colors hover:text-foreground">
            Particles
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          >
            <GithubIcon className="size-4" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
