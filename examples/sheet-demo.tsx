import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export default function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Open panel</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Agent settings</SheetTitle>
          <SheetDescription>Tools, memory and voice for this agent.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}
