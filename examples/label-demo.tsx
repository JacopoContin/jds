import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LabelDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Label htmlFor="api-key">API key</Label>
      <Input id="api-key" type="password" placeholder="sk-…" />
    </div>
  )
}
