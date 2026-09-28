import type { NextConfig } from "next"

import { components, docHref } from "./lib/docs"

const nextConfig: NextConfig = {
  // Add-ons are documented on their parent's page; keep their old URLs working.
  async redirects() {
    return components
      .filter((c) => c.parent)
      .map((c) => ({ source: `/docs/components/${c.slug}`, destination: docHref(c), permanent: true }))
  },
}

export default nextConfig
