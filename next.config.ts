import type { NextConfig } from "next"

import { components, docHref } from "./lib/docs"

const nextConfig: NextConfig = {
  // Visual tests build into their own folder so they never clobber the dev server's .next.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Add-ons are documented on their parent's page; keep their old URLs working.
  async redirects() {
    return components
      .filter((c) => c.parent)
      .map((c) => ({ source: `/docs/components/${c.slug}`, destination: docHref(c), permanent: true }))
  },
}

export default nextConfig
