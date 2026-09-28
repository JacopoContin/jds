import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { SearchIcon } from "@/lib/icons"

export default function InputGroupDemo() {
  return (
    <InputGroup className="max-w-sm">
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search conversations" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Search</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}
