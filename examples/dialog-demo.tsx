import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>Reset agent memory</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset memory?</DialogTitle>
          <DialogDescription>The agent forgets preferences it learned from past conversations.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <DialogClose render={<Button variant="destructive" />}>Reset</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
