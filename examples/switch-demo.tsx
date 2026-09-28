import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function SwitchDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Label>
        <Switch defaultChecked />
        Voice mode
      </Label>
      <Label>
        <Switch />
        Memory
      </Label>
    </div>
  )
}
