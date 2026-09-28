import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export default function ToggleGroupDemo() {
  return (
    <ToggleGroup defaultValue={["chat"]} variant="outline">
      <ToggleGroupItem value="chat">Chat</ToggleGroupItem>
      <ToggleGroupItem value="voice">Voice</ToggleGroupItem>
      <ToggleGroupItem value="agent">Agent</ToggleGroupItem>
    </ToggleGroup>
  )
}
