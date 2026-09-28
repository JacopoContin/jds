import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export default function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <div className="grid h-36 w-72 place-items-center rounded-xl border border-dashed text-sm text-muted-foreground" />
        }
      >
        Right-click a message
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem>
          Copy <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>Regenerate</ContextMenuItem>
        <ContextMenuItem>Branch from here</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
