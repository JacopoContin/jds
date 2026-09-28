import {
  ToolCall,
  ToolCallContent,
  ToolCallHeader,
  ToolCallSection,
} from "@/components/ai/tool-call";

export default function ToolCallDemo() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-3">
      <ToolCall defaultOpen>
        <ToolCallHeader name="weather.forecast" state="output-available" />
        <ToolCallContent>
          <ToolCallSection label="Input" value={{ city: "Lisbon", days: 3 }} />
          <ToolCallSection
            label="Output"
            value={{ high: 24, low: 16, conditions: "Sunny" }}
          />
        </ToolCallContent>
      </ToolCall>
      <ToolCall>
        <ToolCallHeader name="calendar.create_event" state="input-available" />
      </ToolCall>
      <ToolCall>
        <ToolCallHeader name="files.search" state="input-streaming" />
      </ToolCall>
      <ToolCall>
        <ToolCallHeader name="crm.update_contact" state="output-error" />
        <ToolCallContent>
          <ToolCallSection
            label="Error"
            error="403: missing scope contacts.write"
          />
        </ToolCallContent>
      </ToolCall>
    </div>
  );
}
