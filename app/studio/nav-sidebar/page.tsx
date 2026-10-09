import type { Metadata } from "next"

import { NavSidebarBuilder } from "@/components/studio/nav-sidebar-builder"

export const metadata: Metadata = {
  title: "Sidebar navigation · Studio",
  description: "Configure app sidebar navigation: docked, floating or inset, and how it collapses. Copy the code.",
}

export default function NavSidebarStudioPage() {
  return <NavSidebarBuilder />
}
