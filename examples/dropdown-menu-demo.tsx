import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>Conversation</DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuItem>
          Rename <DropdownMenuShortcut>R</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Share <DropdownMenuShortcut>S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
