import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

export default function DrawerDemo() {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline" />}>Share conversation</DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Share conversation</DrawerTitle>
            <DrawerDescription>Anyone with the link can read it. Files stay private.</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <Button>Copy link</Button>
            <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
