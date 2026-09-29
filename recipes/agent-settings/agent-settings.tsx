"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/components/ui/number-field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { VoicePicker, type Voice } from "@/components/voice/voice-picker"

const models = [
  { value: "opus", label: "Claude Opus 5.5" },
  { value: "sonnet", label: "Claude Sonnet 5.5" },
  { value: "haiku", label: "Claude Haiku 4.5" },
]

const tools = [
  { id: "web", name: "Web search", description: "Search and read public pages", on: true },
  { id: "linear", name: "Linear", description: "Create and update issues", on: true },
  { id: "stripe", name: "Stripe", description: "Look up payments and issue refunds", on: false },
  { id: "gmail", name: "Gmail", description: "Draft and send email", on: false },
]

const voices: Voice[] = [
  { id: "aria", name: "Aria", description: "Warm and steady", tags: ["Calm"] },
  { id: "leo", name: "Leo", description: "Bright and quick", tags: ["Upbeat"] },
]

export default function AgentSettings() {
  const [temperature, setTemperature] = React.useState(0.4)

  return (
    <div className="flex h-160 w-full flex-col overflow-hidden rounded-2xl border bg-background">
      <Form
        className="min-h-0 flex-1"
        onSubmit={(e) => {
          e.preventDefault()
          toast("Settings saved")
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <Tabs defaultValue="general" className="min-h-0 flex-1">
            <div className="flex items-center justify-between gap-4 border-b px-6 py-3">
              <div>
                <h3 className="text-sm font-medium">Support agent</h3>
                <p className="text-xs text-muted-foreground">Handles refunds and order questions</p>
              </div>
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
                <TabsTrigger value="voice">Voice</TabsTrigger>
              </TabsList>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <TabsContent value="general">
                <div className="max-w-lg p-6">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="s-name">Name</FieldLabel>
                      <Input id="s-name" name="name" defaultValue="Support agent" />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="s-instructions">Instructions</FieldLabel>
                      <Textarea
                        id="s-instructions"
                        name="instructions"
                        defaultValue="Be concise and friendly. Always confirm the order number before acting."
                      />
                      <FieldDescription>Sent with every conversation as the system prompt.</FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel>Model</FieldLabel>
                      <Select items={models} defaultValue="sonnet">
                        <SelectTrigger className="w-60">
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
                    </Field>
                    <Field>
                      <div className="flex justify-between text-sm">
                        <FieldLabel>Temperature</FieldLabel>
                        <span className="font-mono text-muted-foreground tabular-nums">{temperature.toFixed(1)}</span>
                      </div>
                      <Slider
                        value={temperature}
                        onValueChange={(v) => setTemperature(v as number)}
                        min={0}
                        max={1}
                        step={0.1}
                      />
                      <FieldDescription>Lower is more predictable. Keep it low for support.</FieldDescription>
                    </Field>
                    <NumberField defaultValue={2048} min={256} max={8192} step={256} className="w-48">
                      <Label>Max reply length (tokens)</Label>
                      <NumberFieldGroup>
                        <NumberFieldDecrement />
                        <NumberFieldInput />
                        <NumberFieldIncrement />
                      </NumberFieldGroup>
                    </NumberField>
                    <FieldSet>
                      <FieldLegend>Ask for approval</FieldLegend>
                      <RadioGroup defaultValue="risky">
                        <Label>
                          <RadioGroupItem value="always" />
                          Before every action
                        </Label>
                        <Label>
                          <RadioGroupItem value="risky" />
                          Only for irreversible actions
                        </Label>
                        <Label>
                          <RadioGroupItem value="never" />
                          Never
                        </Label>
                      </RadioGroup>
                    </FieldSet>
                  </FieldGroup>
                </div>
              </TabsContent>

              <TabsContent value="tools">
                <ul className="flex max-w-lg flex-col divide-y p-6">
                  {tools.map((t) => (
                    <li key={t.id} className="flex items-center gap-4 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">{t.name}</div>
                        <div className="text-sm text-muted-foreground">{t.description}</div>
                      </div>
                      <Switch defaultChecked={t.on} aria-label={t.name} />
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="voice">
                <div className="flex max-w-lg flex-col gap-4 p-6">
                  <Label>
                    <Switch defaultChecked />
                    Enable voice mode
                  </Label>
                  <VoicePicker voices={voices} />
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex justify-end gap-2 border-t px-6 py-3">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </div>
        </div>
      </Form>
    </div>
  )
}
