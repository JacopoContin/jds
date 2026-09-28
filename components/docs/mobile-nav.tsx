"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { Button } from "@/components/ui/button"
import { SidebarNav } from "@/components/docs/sidebar-nav"
import { CloseIcon, MenuIcon } from "@/lib/icons"

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger render={<Button variant="ghost" size="icon-sm" aria-label="Open menu" className="-ml-2 md:hidden" />}>
        <MenuIcon />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <DialogPrimitive.Popup className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto border-r bg-background p-4 transition-transform duration-300 ease-out-quint data-ending-style:-translate-x-full data-starting-style:-translate-x-full">
          <div className="mb-4 flex items-center justify-between">
            <DialogPrimitive.Title className="font-mono text-sm font-medium">
              JDS<span className="text-ember">.</span>
            </DialogPrimitive.Title>
            <DialogPrimitive.Close render={<Button variant="ghost" size="icon-sm" aria-label="Close menu" />}>
              <CloseIcon />
            </DialogPrimitive.Close>
          </div>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
