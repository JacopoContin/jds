import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { AgentIcon } from "@/lib/icons"

export default function EmptyDemo() {
  return (
    <div className="w-full max-w-md rounded-xl border">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AgentIcon />
          </EmptyMedia>
          <EmptyTitle>No agents yet</EmptyTitle>
          <EmptyDescription>Create an agent to automate support, research or reporting.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm">Create agent</Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
