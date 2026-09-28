import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const models = [
  { value: "opus", label: "Claude Opus 5.5" },
  { value: "sonnet", label: "Claude Sonnet 5.5" },
  { value: "haiku", label: "Claude Haiku 4.5" },
]

export default function SelectDemo() {
  return (
    <Select items={models} defaultValue="sonnet">
      <SelectTrigger className="w-52">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {models.map((m) => (
          <SelectItem key={m.value} value={m.value}>
            {m.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
