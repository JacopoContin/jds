import { Separator } from "@/components/ui/separator";

export default function SeparatorDemo() {
  return (
    <div className="flex h-5 items-center gap-4 text-sm">
      <span>Chat</span>
      <Separator orientation="vertical" />
      <span>Voice</span>
      <Separator orientation="vertical" />
      <span>Tools</span>
    </div>
  );
}
