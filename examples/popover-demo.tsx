import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>
        Context usage
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>42k of 200k tokens</PopoverTitle>
          <PopoverDescription>
            Older messages are summarized after 150k.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}
