import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const options = [
  ["ask", "Ask every time"],
  ["risky", "Only for irreversible actions"],
  ["never", "Never ask"],
] as const

export default function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="risky">
      {options.map(([value, label]) => (
        <Label key={value}>
          <RadioGroupItem value={value} />
          {label}
        </Label>
      ))}
    </RadioGroup>
  )
}
