import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function FieldDemo() {
  return (
    <FieldGroup className="w-full max-w-sm">
      <Field>
        <FieldLabel htmlFor="agent-name">Name</FieldLabel>
        <Input id="agent-name" placeholder="Support agent" />
      </Field>
      <Field>
        <FieldLabel htmlFor="agent-instructions">Instructions</FieldLabel>
        <Textarea id="agent-instructions" placeholder="Be concise. Ask before refunds." />
        <FieldDescription>Sent with every conversation as the system prompt.</FieldDescription>
      </Field>
    </FieldGroup>
  )
}
