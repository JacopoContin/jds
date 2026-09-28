import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDownIcon } from "@/lib/icons"

export default function CollapsibleDemo() {
  return (
    <Collapsible className="flex w-full max-w-xs flex-col items-start">
      <CollapsibleTrigger render={<Button variant="outline" size="sm" />}>
        Show details
        <ChevronDownIcon />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 rounded-lg border p-3 text-sm text-muted-foreground">
          Model: claude-sonnet-5-5. Temperature 0.2. 3 tools enabled.
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
