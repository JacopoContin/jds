import type { Metadata } from "next"
import Link from "next/link"

import { StudioGallery } from "@/components/studio/studio-gallery"
import { buttonVariants } from "@/components/ui/button"
import { ArrowRightIcon } from "@/lib/icons"

export const metadata: Metadata = {
  title: "Studio",
  description: "Design AI interfaces visually, preview every state, and copy the code.",
}

export default function StudioPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-16 md:px-6">
      <div className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">Studio</h1>
        <p className="text-lg text-muted-foreground">
          Design voice agents, side panels and chat surfaces visually. Tweak them live, preview every state, then copy
          the code or a spec for your team.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/studio/voice-orb" className={buttonVariants()}>
            Start with the voice orb
            <ArrowRightIcon />
          </Link>
          <Link href="/recipes" className={buttonVariants({ variant: "outline" })}>
            See recipes
          </Link>
        </div>
      </div>
      <StudioGallery />
    </main>
  )
}
