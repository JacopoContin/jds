"use client"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

const tools = ["GitHub", "Linear", "Notion", "Slack", "Stripe", "Figma", "Google Drive", "Salesforce"]

export default function ComboboxDemo() {
  return (
    <Combobox items={tools}>
      <ComboboxInput placeholder="Connect a tool…" className="w-64" />
      <ComboboxContent>
        <ComboboxEmpty>No tool found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
