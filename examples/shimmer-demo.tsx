import { Shimmer, TypingIndicator } from "@/components/ai/shimmer";

export default function ShimmerDemo() {
  return (
    <div className="flex flex-col items-center gap-4 text-sm">
      <Shimmer>Searching 14 sources…</Shimmer>
      <TypingIndicator />
    </div>
  );
}
