import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "@/components/ui/toolbar"
import { CopyIcon, DownloadIcon, RegenerateIcon, ThumbsDownIcon, ThumbsUpIcon } from "@/lib/icons"

export default function ToolbarDemo() {
  return (
    <Toolbar aria-label="Response actions">
      <ToolbarGroup>
        <ToolbarButton aria-label="Copy">
          <CopyIcon />
        </ToolbarButton>
        <ToolbarButton aria-label="Regenerate">
          <RegenerateIcon />
        </ToolbarButton>
        <ToolbarButton aria-label="Download">
          <DownloadIcon />
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarGroup>
        <ToolbarButton aria-label="Good response">
          <ThumbsUpIcon />
        </ToolbarButton>
        <ToolbarButton aria-label="Bad response">
          <ThumbsDownIcon />
        </ToolbarButton>
      </ToolbarGroup>
    </Toolbar>
  )
}
