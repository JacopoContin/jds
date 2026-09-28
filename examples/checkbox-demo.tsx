import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function CheckboxDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Label>
        <Checkbox defaultChecked />
        Ask before sending emails
      </Label>
      <Label>
        <Checkbox />
        Allow web search
      </Label>
    </div>
  )
}
