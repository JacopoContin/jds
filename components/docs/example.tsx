"use client"

import { examples } from "@/examples"

/** Renders a demo by name. Server components can't index into the client `examples` map directly. */
export function Example({ name }: { name: string }) {
  const Component = examples[name]
  return Component ? <Component /> : null
}
