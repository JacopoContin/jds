"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type Errors = Partial<Record<"name" | "webhook", string>>

export default function FormDemo() {
  const [errors, setErrors] = React.useState<Errors>({})

  return (
    <Form
      className="max-w-sm"
      onSubmit={(e) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        const next: Errors = {}
        if (!String(data.get("name")).trim()) next.name = "Give the agent a name."
        const url = String(data.get("webhook"))
        if (url && !url.startsWith("https://")) next.webhook = "Webhooks must use https."
        setErrors(next)
        if (Object.keys(next).length === 0) toast("Agent created")
      }}
    >
      <Field data-invalid={!!errors.name || undefined}>
        <FieldLabel htmlFor="form-name">Name</FieldLabel>
        <Input id="form-name" name="name" placeholder="Support agent" aria-invalid={!!errors.name} />
        <FieldError>{errors.name}</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="form-prompt">Instructions</FieldLabel>
        <Textarea id="form-prompt" name="prompt" placeholder="Be concise. Ask before refunds." />
      </Field>
      <Field data-invalid={!!errors.webhook || undefined}>
        <FieldLabel htmlFor="form-webhook">Webhook</FieldLabel>
        <Input id="form-webhook" name="webhook" placeholder="https://…" aria-invalid={!!errors.webhook} />
        {errors.webhook ? (
          <FieldError>{errors.webhook}</FieldError>
        ) : (
          <FieldDescription>Called when a run finishes. Optional.</FieldDescription>
        )}
      </Field>
      <Button type="submit" className="self-start">
        Create agent
      </Button>
    </Form>
  )
}
