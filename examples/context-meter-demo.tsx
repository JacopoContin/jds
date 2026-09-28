import { ContextMeter } from "@/components/ai/context-meter"

const breakdown = (used: number) => [
  { label: "System and tools", tokens: 12_400 },
  { label: "Files", tokens: Math.round(used * 0.45) },
  { label: "Messages", tokens: Math.round(used * 0.55) - 12_400 },
]

export default function ContextMeterDemo() {
  return (
    <div className="flex items-center gap-6">
      <ContextMeter used={62_000} max={200_000} breakdown={breakdown(62_000)} />
      <ContextMeter used={168_000} max={200_000} breakdown={breakdown(168_000)} />
      <ContextMeter used={194_000} max={200_000} breakdown={breakdown(194_000)} />
    </div>
  )
}
