"use client"

import { AmbientBackground, type AmbientBackgroundVariant } from "@/components/effects/ambient-background"

const variants: AmbientBackgroundVariant[] = ["mesh", "aurora", "dots"]

export default function AmbientBackgroundVariants() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-3">
      {variants.map((v) => (
        <div
          key={v}
          className="relative isolate grid h-48 place-items-center overflow-hidden rounded-xl border bg-background"
        >
          <AmbientBackground variant={v} />
          <span className="text-sm font-medium capitalize">{v}</span>
        </div>
      ))}
    </div>
  )
}
