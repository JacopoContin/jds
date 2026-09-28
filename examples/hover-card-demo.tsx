import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

export default function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger render={<a href="#" className="text-sm font-medium underline underline-offset-4" />}>
        @researcher
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="flex gap-3">
          <Avatar>
            <AvatarFallback>RE</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium">Researcher</p>
            <p className="text-sm text-muted-foreground">Searches the web and your docs, then cites every claim.</p>
            <p className="text-xs text-muted-foreground">Used 214 times this week</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
