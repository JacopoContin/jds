import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AttachIcon } from "@/lib/icons"

export default function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button variant="outline" size="icon" aria-label="Attach" />}>
        <AttachIcon />
      </TooltipTrigger>
      <TooltipContent>Attach files</TooltipContent>
    </Tooltip>
  )
}
