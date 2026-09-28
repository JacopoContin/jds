"use client"

import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar"
import { cn } from "cn"

import { buttonVariants } from "@/components/ui/button"

/** A row of controls with roving focus: Tab enters once, arrow keys move between items. */
function Toolbar({ className, ...props }: ToolbarPrimitive.Root.Props) {
  return (
    <ToolbarPrimitive.Root
      data-slot="toolbar"
      className={cn(
        "flex items-center gap-1 rounded-lg border bg-card p-1 data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ToolbarButton({ className, ...props }: ToolbarPrimitive.Button.Props) {
  return (
    <ToolbarPrimitive.Button
      data-slot="toolbar-button"
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "data-pressed:bg-accent data-pressed:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function ToolbarLink({ className, ...props }: ToolbarPrimitive.Link.Props) {
  return (
    <ToolbarPrimitive.Link
      data-slot="toolbar-link"
      className={cn(buttonVariants({ variant: "link", size: "sm" }), className)}
      {...props}
    />
  )
}

function ToolbarGroup({ className, ...props }: ToolbarPrimitive.Group.Props) {
  return <ToolbarPrimitive.Group data-slot="toolbar-group" className={cn("flex items-center gap-1", className)} {...props} />
}

function ToolbarSeparator({ className, ...props }: ToolbarPrimitive.Separator.Props) {
  return (
    <ToolbarPrimitive.Separator
      data-slot="toolbar-separator"
      className={cn("mx-0.5 h-5 w-px shrink-0 bg-border data-[orientation=horizontal]:mx-0 data-[orientation=horizontal]:my-0.5 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-5", className)}
      {...props}
    />
  )
}

export { Toolbar, ToolbarButton, ToolbarLink, ToolbarGroup, ToolbarSeparator }
