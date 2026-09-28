export type Prop = { name: string; type: string; default?: string; description: string }

export type ComponentDoc = {
  slug: string
  title: string
  description: string
  group: "ai" | "voice" | "components"
  /** Source files, relative to the repo root. Shown in the Code tab and shipped by the registry. */
  files: string[]
  usage: string
  examples?: { name: string; title: string }[]
  api?: { component: string; props: Prop[] }[]
  isNew?: boolean
}

export const components: ComponentDoc[] = [
  // Agent
  {
    slug: "conversation",
    title: "Conversation",
    description: "Scroll container for a chat thread. Stays pinned to the bottom while tokens stream and lets go when the user scrolls up.",
    group: "ai",
    files: ["components/ai/conversation.tsx", "hooks/use-stick-to-bottom.ts"],
    usage: `import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai/conversation"

<Conversation>
  <ConversationContent>{/* messages */}</ConversationContent>
  <ConversationScrollButton />
</Conversation>`,
    examples: [{ name: "conversation-empty", title: "Empty state" }],
    api: [
      {
        component: "ConversationEmpty",
        props: [
          { name: "title", type: "string", default: '"Start a conversation"', description: "Heading shown before the first message." },
          { name: "description", type: "string", description: "Supporting text." },
          { name: "icon", type: "ReactNode", description: "Optional icon above the title." },
        ],
      },
    ],
    isNew: true,
  },
  {
    slug: "message",
    title: "Message",
    description: "A single turn from the user or the assistant, with hover-revealed actions.",
    group: "ai",
    files: ["components/ai/message.tsx"],
    usage: `import { Message, MessageContent } from "@/components/ai/message"

<Message from="user">
  <MessageContent>Summarize this thread.</MessageContent>
</Message>`,
    api: [
      {
        component: "Message",
        props: [{ name: "from", type: '"user" | "assistant" | "system"', description: "Sets alignment and bubble style." }],
      },
      {
        component: "MessageAction",
        props: [{ name: "label", type: "string", description: "Accessible name and tooltip text." }],
      },
    ],
    isNew: true,
  },
  {
    slug: "prompt-input",
    title: "Prompt Input",
    description: "Composer for chat and agent apps. Enter to send, Shift+Enter for a new line, paste or drop files, stop while streaming.",
    group: "ai",
    files: ["components/ai/prompt-input.tsx"],
    usage: `import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputAttachButton,
  PromptInputAttachments,
} from "@/components/ai/prompt-input"

const { status, sendMessage, stop } = useChat()

<PromptInput status={status} onSubmit={({ text, files }) => sendMessage({ text, files })}>
  <PromptInputAttachments />
  <PromptInputTextarea />
  <PromptInputToolbar>
    <PromptInputTools>
      <PromptInputAttachButton />
    </PromptInputTools>
    <PromptInputSubmit onStop={stop} />
  </PromptInputToolbar>
</PromptInput>`,
    api: [
      {
        component: "PromptInput",
        props: [
          { name: "onSubmit", type: "({ text, files }) => void", description: "Called on Enter or the send button. Input clears after." },
          { name: "status", type: '"ready" | "submitted" | "streaming" | "error"', default: '"ready"', description: "Matches AI SDK useChat. Drives the submit button." },
          { name: "value", type: "string", description: "Controlled value." },
          { name: "onValueChange", type: "(value: string) => void", description: "Change handler for controlled use." },
          { name: "accept", type: "string", description: "File types for the picker." },
        ],
      },
      {
        component: "PromptInputSubmit",
        props: [{ name: "onStop", type: "() => void", description: "Called when pressed while streaming." }],
      },
    ],
    isNew: true,
  },
  {
    slug: "response",
    title: "Response",
    description: "Markdown renderer that is safe to stream. Closes unterminated syntax as it arrives and highlights code with Shiki.",
    group: "ai",
    files: ["components/ai/response.tsx"],
    usage: `import { Response } from "@/components/ai/response"

<Response isAnimating={status === "streaming"}>{part.text}</Response>`,
    api: [
      {
        component: "Response",
        props: [
          { name: "children", type: "string", description: "Markdown source." },
          { name: "isAnimating", type: "boolean", default: "false", description: "Streaming mode: fades in new tokens and repairs partial syntax." },
        ],
      },
    ],
    isNew: true,
  },
  {
    slug: "reasoning",
    title: "Reasoning",
    description: "Model thinking, open while it streams, then collapsed to a one-line summary with the time it took.",
    group: "ai",
    files: ["components/ai/reasoning.tsx"],
    usage: `import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ai/reasoning"

<Reasoning isStreaming={isStreaming}>
  <ReasoningTrigger />
  <ReasoningContent>{part.text}</ReasoningContent>
</Reasoning>`,
    api: [
      {
        component: "Reasoning",
        props: [
          { name: "isStreaming", type: "boolean", default: "false", description: "Opens the panel and runs the timer. Collapses once when it turns false." },
          { name: "duration", type: "number", description: "Seconds spent thinking. Measured automatically if omitted." },
        ],
      },
    ],
    isNew: true,
  },
  {
    slug: "tool-call",
    title: "Tool Call",
    description: "What the agent called, with what input, and what came back. States match AI SDK tool parts.",
    group: "ai",
    files: ["components/ai/tool-call.tsx"],
    usage: `import { ToolCall, ToolCallContent, ToolCallHeader, ToolCallSection } from "@/components/ai/tool-call"

<ToolCall>
  <ToolCallHeader name="orders.lookup" state={part.state} />
  <ToolCallContent>
    <ToolCallSection label="Input" value={part.input} />
    <ToolCallSection label="Output" value={part.output} error={part.errorText} />
  </ToolCallContent>
</ToolCall>`,
    api: [
      {
        component: "ToolCallHeader",
        props: [
          { name: "name", type: "string", description: "Tool name." },
          { name: "state", type: '"input-streaming" | "input-available" | "output-available" | "output-error"', description: "Pending, running, done, failed." },
        ],
      },
      {
        component: "ToolCallSection",
        props: [
          { name: "label", type: "string", description: "Section heading." },
          { name: "value", type: "unknown", description: "Rendered as JSON unless it is a string." },
          { name: "error", type: "string", description: "Shown in destructive style instead of value." },
        ],
      },
    ],
    isNew: true,
  },
  {
    slug: "approval",
    title: "Approval",
    description: "Human-in-the-loop gate. The agent pauses on an irreversible action until the user approves or denies it.",
    group: "ai",
    files: ["components/ai/approval.tsx"],
    usage: `import { Approval } from "@/components/ai/approval"

<Approval
  title="Refund €68.90 to Maria Rossi"
  description="This can't be undone."
  decision={decision}
  onApprove={() => addToolResult({ approved: true })}
  onDeny={() => addToolResult({ approved: false })}
/>`,
    api: [
      {
        component: "Approval",
        props: [
          { name: "title", type: "ReactNode", description: "The action, in plain words." },
          { name: "description", type: "ReactNode", description: "Consequences." },
          { name: "decision", type: '"pending" | "approved" | "denied"', default: '"pending"', description: "Resolved state replaces the buttons." },
          { name: "onApprove", type: "() => void", description: "" },
          { name: "onDeny", type: "() => void", description: "" },
          { name: "approveLabel", type: "string", default: '"Approve"', description: "Use the verb: Refund, Delete, Send." },
        ],
      },
    ],
    isNew: true,
  },
  {
    slug: "agent-steps",
    title: "Agent Steps",
    description: "Plan and progress for a multi-step run: what's done, what's running, what's next.",
    group: "ai",
    files: ["components/ai/agent-steps.tsx"],
    usage: `import { AgentSteps } from "@/components/ai/agent-steps"

<AgentSteps
  steps={[
    { id: "1", label: "Look up order", status: "complete" },
    { id: "2", label: "Check eligibility", status: "active" },
    { id: "3", label: "Issue refund", status: "pending" },
  ]}
/>`,
    api: [
      {
        component: "AgentSteps",
        props: [{ name: "steps", type: "{ id, label, detail?, status }[]", description: 'status: "pending" | "active" | "complete" | "error"' }],
      },
    ],
    isNew: true,
  },
  {
    slug: "sources",
    title: "Sources",
    description: "Inline numbered citations with hover previews, and a strip of source cards.",
    group: "ai",
    files: ["components/ai/sources.tsx"],
    usage: `import { Citation, Sources } from "@/components/ai/sources"

<p>Refunds take 5 to 10 days <Citation index={1} source={sources[0]} />.</p>
<Sources sources={sources} />`,
    api: [
      {
        component: "Citation",
        props: [
          { name: "index", type: "number", description: "Number shown in the marker." },
          { name: "source", type: "{ url, title?, snippet? }", description: "" },
        ],
      },
    ],
    isNew: true,
  },
  {
    slug: "suggestions",
    title: "Suggestions",
    description: "Follow-up prompts as a row of chips.",
    group: "ai",
    files: ["components/ai/suggestions.tsx"],
    usage: `import { Suggestion, Suggestions } from "@/components/ai/suggestions"

<Suggestions>
  <Suggestion suggestion="Draft a reply" onSelect={send} />
</Suggestions>`,
    isNew: true,
  },
  {
    slug: "shimmer",
    title: "Shimmer",
    description: "In-progress text and a typing indicator for the gap before the first token.",
    group: "ai",
    files: ["components/ai/shimmer.tsx"],
    usage: `import { Shimmer, TypingIndicator } from "@/components/ai/shimmer"

<Shimmer>Searching the web…</Shimmer>
<TypingIndicator />`,
    isNew: true,
  },

  // Voice
  {
    slug: "voice-orb",
    title: "Voice Orb",
    description: "A rotating sphere of particles for a voice agent. Breathes when idle, scatters with your voice while listening, spins while thinking, pulses while speaking.",
    group: "voice",
    files: ["components/voice/voice-orb.tsx"],
    usage: `import { VoiceOrb } from "@/components/voice/voice-orb"

<VoiceOrb state="listening" level={level} />`,
    api: [
      {
        component: "VoiceOrb",
        props: [
          { name: "state", type: '"idle" | "listening" | "thinking" | "speaking"', default: '"idle"', description: "" },
          { name: "level", type: "number", default: "0", description: "Loudness 0 to 1. Smoothed with a spring." },
          { name: "size", type: "number", default: "160", description: "Rendered size in px. Color follows the text color." },
          { name: "particles", type: "number", default: "size × 5", description: "Particle count, capped at 2400." },
        ],
      },
    ],
    isNew: true,
  },
  {
    slug: "waveform",
    title: "Waveform",
    description: "Live spectrum bars for microphone input or agent speech.",
    group: "voice",
    files: ["components/voice/waveform.tsx", "hooks/use-audio-level.ts"],
    usage: `import { Waveform } from "@/components/voice/waveform"
import { useAudioLevel } from "@/hooks/use-audio-level"

const mic = useAudioLevel()

<Waveform spectrum={mic.spectrum} active={mic.active} />`,
    api: [
      {
        component: "Waveform",
        props: [
          { name: "spectrum", type: "number[]", description: "One value 0 to 1 per bar." },
          { name: "active", type: "boolean", default: "true", description: "Inactive bars flatten and dim." },
        ],
      },
      {
        component: "useAudioLevel",
        props: [
          { name: "bands", type: "number", default: "24", description: "Number of spectrum bands." },
          { name: "returns", type: "{ level, spectrum, active, error, start, stop }", description: "Call start() from a user gesture." },
        ],
      },
    ],
    isNew: true,
  },
  {
    slug: "push-to-talk",
    title: "Push to Talk",
    description: "Hold to speak with pointer or the Space key. The ring grows with input level so users know they're heard.",
    group: "voice",
    files: ["components/voice/push-to-talk.tsx"],
    usage: `import { PushToTalk } from "@/components/voice/push-to-talk"

<PushToTalk onPressStart={mic.start} onPressEnd={mic.stop} level={mic.level} />`,
    api: [
      {
        component: "PushToTalk",
        props: [
          { name: "onPressStart", type: "() => void", description: "" },
          { name: "onPressEnd", type: "() => void", description: "Also fires on window blur." },
          { name: "level", type: "number", default: "0", description: "Input loudness 0 to 1." },
          { name: "hotkey", type: "boolean", default: "true", description: "Space triggers, except while typing in a field." },
        ],
      },
    ],
    isNew: true,
  },
  {
    slug: "live-transcript",
    title: "Live Transcript",
    description: "Rolling speech transcript per speaker. Interim text is dimmed until recognition commits it.",
    group: "voice",
    files: ["components/voice/live-transcript.tsx"],
    usage: `import { LiveTranscript } from "@/components/voice/live-transcript"

<LiveTranscript segments={[{ id: "1", speaker: "user", text: "Move my 3pm", final: false }]} />`,
    api: [
      {
        component: "LiveTranscript",
        props: [
          { name: "segments", type: '{ id, speaker: "user" | "agent", text, final }[]', description: "" },
          { name: "agentName", type: "string", default: '"Agent"', description: "Label for agent lines." },
        ],
      },
    ],
    isNew: true,
  },

  // Primitives
  ...(
    [
      ["avatar", "Avatar", "An image with a text fallback for users and agents."],
      ["badge", "Badge", "A small status label."],
      ["button", "Button", "A button or a component that looks like a button."],
      ["card", "Card", "A container for grouped content."],
      ["collapsible", "Collapsible", "Shows and hides a panel."],
      ["dialog", "Dialog", "A modal window over the page."],
      ["input", "Input", "A single-line text field."],
      ["kbd", "Kbd", "A keyboard key or shortcut."],
      ["dropdown-menu", "Menu", "A list of actions in a dropdown."],
      ["popover", "Popover", "A floating panel anchored to a trigger."],
      ["scroll-area", "Scroll Area", "A scroll container with styled scrollbars."],
      ["select", "Select", "Pick one value from a list."],
      ["separator", "Separator", "A visual divider."],
      ["skeleton", "Skeleton", "A placeholder while content loads."],
      ["tabs", "Tabs", "Switch between related views."],
      ["textarea", "Textarea", "A multi-line text field that grows with content."],
      ["sonner", "Toast", "Brief notifications, via Sonner."],
      ["tooltip", "Tooltip", "A label on hover or focus."],
    ] as const
  ).map(
    ([slug, title, description]): ComponentDoc => ({
      slug,
      title,
      description,
      group: "components",
      files: [`components/ui/${slug}.tsx`],
      usage: "",
    })
  ),
]

export const componentBySlug = Object.fromEntries(components.map((c) => [c.slug, c]))

export type NavItem = { title: string; href: string; isNew?: boolean }
export type NavGroup = { title: string; items: NavItem[] }

const toNav = (group: ComponentDoc["group"]) =>
  components
    .filter((c) => c.group === group)
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((c) => ({ title: c.title, href: `/docs/components/${c.slug}`, isNew: c.isNew }))

export const nav: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Get Started", href: "/docs/get-started" },
      { title: "Styling", href: "/docs/styling" },
      { title: "Motion", href: "/docs/motion" },
      { title: "Icons", href: "/docs/icons" },
      { title: "Roadmap", href: "/docs/roadmap" },
    ],
  },
  { title: "Agent", items: toNav("ai") },
  { title: "Voice", items: toNav("voice") },
  { title: "Components", items: toNav("components") },
]

export const flatNav = nav.flatMap((g) => g.items)
