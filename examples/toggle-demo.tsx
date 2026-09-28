import { Toggle } from "@/components/ui/toggle"
import { WebSearchIcon } from "@/lib/icons"

export default function ToggleDemo() {
  return (
    <Toggle aria-label="Web search" variant="outline">
      <WebSearchIcon />
      Web search
    </Toggle>
  )
}
