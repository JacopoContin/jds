import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const runs = Array.from({ length: 30 }, (_, i) => `Run #${1200 - i}`);

export default function ScrollAreaDemo() {
  return (
    <div className="overflow-hidden rounded-lg border">
      <ScrollArea className="h-56 w-48">
        <div className="p-3 text-sm">
          {runs.map((run) => (
            <div key={run}>
              <div className="py-1.5">{run}</div>
              <Separator />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
