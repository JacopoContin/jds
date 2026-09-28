import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { AgentIcon, FileIcon, SettingsIcon, SparkleIcon } from "@/lib/icons"

export default function CommandDemo() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-xl border">
      <Command>
        <CommandInput placeholder="Search or ask…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Agents">
            <CommandItem>
              <SparkleIcon />
              New conversation
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <AgentIcon />
              Switch agent
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Recent">
            <CommandItem>
              <FileIcon />
              Q3 pricing update
            </CommandItem>
            <CommandItem>
              <SettingsIcon />
              Agent settings
              <CommandShortcut>⌘,</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}
