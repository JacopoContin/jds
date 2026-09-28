import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export default function ResizableDemo() {
  return (
    <div className="h-64 w-full max-w-xl overflow-hidden rounded-xl border">
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel defaultSize="30%" minSize="20%">
          <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">Conversations</div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize="70%" minSize="40%">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize="65%">
              <div className="flex h-full items-center justify-center p-4 text-sm">Chat</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="35%" minSize="20%">
              <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">Artifact</div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
