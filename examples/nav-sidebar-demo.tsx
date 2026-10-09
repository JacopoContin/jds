"use client"

import * as React from "react"

import {
  NavSidebar,
  NavSidebarContent,
  NavSidebarFooter,
  NavSidebarGroup,
  NavSidebarHeader,
  NavSidebarInset,
  NavSidebarItem,
  NavSidebarLayout,
  NavSidebarText,
  NavSidebarTrigger,
} from "@/components/navigation/nav-sidebar"
import { CalendarIcon, FolderIcon, HomeIcon, InboxIcon, SettingsIcon, SparkleIcon } from "@/lib/icons"

const items = [
  { id: "home", label: "Home", icon: <HomeIcon /> },
  { id: "inbox", label: "Inbox", icon: <InboxIcon />, badge: 4 },
  { id: "calendar", label: "Calendar", icon: <CalendarIcon /> },
]

export function NavSidebarExample(props: Omit<React.ComponentProps<typeof NavSidebar>, "children">) {
  const [active, setActive] = React.useState("home")
  return (
    <div className="h-120 w-full overflow-hidden rounded-xl border">
      <NavSidebarLayout shortcut={false} breakpoint={480}>
        <NavSidebar width={224} {...props}>
          <NavSidebarHeader>
            <NavSidebarText className="flex h-9 items-center px-3 font-semibold">Acme</NavSidebarText>
          </NavSidebarHeader>
          <NavSidebarContent>
            <NavSidebarGroup>
              {items.map((i) => (
                <NavSidebarItem
                  key={i.id}
                  icon={i.icon}
                  badge={i.badge}
                  active={active === i.id}
                  onClick={() => setActive(i.id)}
                >
                  {i.label}
                </NavSidebarItem>
              ))}
            </NavSidebarGroup>
            <NavSidebarGroup label="Projects">
              {["Website", "Research"].map((p) => (
                <NavSidebarItem key={p} icon={<FolderIcon />} active={active === p} onClick={() => setActive(p)}>
                  {p}
                </NavSidebarItem>
              ))}
            </NavSidebarGroup>
          </NavSidebarContent>
          <NavSidebarFooter>
            <NavSidebarItem icon={<SparkleIcon />}>Ask agent</NavSidebarItem>
            <NavSidebarItem icon={<SettingsIcon />}>Settings</NavSidebarItem>
          </NavSidebarFooter>
        </NavSidebar>
        <NavSidebarInset>
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3 text-sm font-medium">
            <NavSidebarTrigger />
            Page
          </header>
        </NavSidebarInset>
      </NavSidebarLayout>
    </div>
  )
}

export default function NavSidebarDemo() {
  return <NavSidebarExample />
}
