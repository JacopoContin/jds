import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"

export default function MenubarDemo() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Conversation</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>Duplicate</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Export as Markdown</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Agent</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Switch model</MenubarItem>
          <MenubarItem>Tools…</MenubarItem>
          <MenubarItem>Memory…</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Show reasoning</MenubarItem>
          <MenubarItem>Show tool calls</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}
