import { Button } from "@/components/ui/button";
import { SendIcon } from "@/lib/icons";

export default function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button size="icon" aria-label="Send">
        <SendIcon />
      </Button>
    </div>
  );
}
