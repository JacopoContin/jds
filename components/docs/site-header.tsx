import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { ColorPicker } from "@/components/docs/color-picker"
import { GithubIcon } from "@/components/docs/github-icon"
import { MobileNav } from "@/components/docs/mobile-nav"
import { Search } from "@/components/docs/search"
import { ThemeToggle } from "@/components/site/theme-toggle"
import { site } from "@/lib/site"

export function SiteHeader() {
  return (
    <header data-site-header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-6 px-4 md:px-6">
        <MobileNav />
        <Link href="/" className="font-mono text-sm font-medium">
          JDS<span className="text-foreground">.</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          <Link href="/docs" className="transition-colors hover:text-foreground">
            Docs
          </Link>
          <Link href="/docs/components/prompt-input" className="transition-colors hover:text-foreground">
            Components
          </Link>
          <Link href="/studio" className="flex items-center gap-1.5 transition-colors hover:text-foreground">
            Studio
            {/* Draws people to the Studio, the part of JDS you play with rather than read. */}
            <Badge>New</Badge>
          </Link>
          <Link href="/recipes" className="transition-colors hover:text-foreground">
            Recipes
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Search />
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          >
            <GithubIcon className="size-4" />
          </a>
          <ColorPicker />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
