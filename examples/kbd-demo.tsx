import { Kbd, KbdGroup } from "@/components/ui/kbd";

export default function KbdDemo() {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
      <span>
        Hold <Kbd>Space</Kbd> to talk
      </span>
    </div>
  );
}
