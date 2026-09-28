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
  /**
   * Add-on to another component: documented as a section on the parent's page
   * (anchored at `#${section}`) instead of its own page. Still its own registry item.
   */
  parent?: { slug: string; section: string }
}

export const components: ComponentDoc[] = [
  // Agent
  {
    slug: "conversation",
    title: "Conversation",
    description:
      "Scroll container for a chat thread. Stays pinned to the bottom while tokens stream and lets go when the user scrolls up.",
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
          {
            name: "title",
            type: "string",
            default: '"Start a conversation"',
            description: "Heading shown before the first message.",
          },
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
        props: [
          { name: "from", type: '"user" | "assistant" | "system"', description: "Sets alignment and bubble style." },
        ],
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
    description:
      "Composer for chat and agent apps. Enter to send, Shift+Enter for a new line, paste or drop files, stop while streaming.",
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
    examples: [{ name: "prompt-input-frame", title: "With context and options" }],
    api: [
      {
        component: "PromptInput",
        props: [
          {
            name: "onSubmit",
            type: "({ text, files }) => void",
            description: "Called on Enter or the send button. Input clears after.",
          },
          {
            name: "status",
            type: '"ready" | "submitted" | "streaming" | "error"',
            default: '"ready"',
            description: "Matches AI SDK useChat. Drives the submit button.",
          },
          { name: "value", type: "string", description: "Controlled value." },
          { name: "onValueChange", type: "(value: string) => void", description: "Change handler for controlled use." },
          { name: "accept", type: "string", description: "File types for the picker." },
        ],
      },
      {
        component: "PromptInputSubmit",
        props: [{ name: "onStop", type: "() => void", description: "Called when pressed while streaming." }],
      },
      {
        component: "PromptInputFrame",
        props: [
          {
            name: "children",
            type: "ReactNode",
            description:
              "An optional PromptInputHeader, the PromptInput, and an optional PromptInputFooter. Header and footer animate when added or removed.",
          },
        ],
      },
      {
        component: "PromptInputHeader",
        props: [{ name: "icon", type: "ReactNode", description: "Shown before the context text." }],
      },
      {
        component: "PromptInputOption",
        props: [
          { name: "icon", type: "ReactNode", description: "Shown before the label." },
          { name: "pressed", type: "boolean", description: "Controlled state. Or use defaultPressed." },
          { name: "onPressedChange", type: "(pressed: boolean) => void", description: "" },
        ],
      },
    ],
    isNew: true,
  },
  {
    slug: "prompt-input-mic",
    title: "Dictation",
    description:
      "Dictation for the prompt input. Speech is transcribed into the textarea as you talk, so it can be reviewed before sending.",
    group: "ai",
    parent: { slug: "prompt-input", section: "dictation" },
    files: ["components/ai/prompt-input-mic.tsx", "hooks/use-speech-recognition.ts"],
    usage: `import { PromptInputMic } from "@/components/ai/prompt-input-mic"

<PromptInputToolbar>
  <PromptInputTools />
  <PromptInputMic />
  <PromptInputSubmit />
</PromptInputToolbar>`,
    api: [
      {
        component: "PromptInputMic",
        props: [
          {
            name: "lang",
            type: "string",
            default: "navigator.language",
            description: 'BCP 47 language for recognition, e.g. "it-IT".',
          },
        ],
      },
      {
        component: "useSpeechRecognition",
        props: [
          {
            name: "returns",
            type: "{ supported, listening, transcript, error, start, stop }",
            description:
              "Web Speech API. Chrome, Edge and Safari. Elsewhere supported is false and the mic disables itself.",
          },
        ],
      },
    ],
    isNew: true,
  },
  {
    slug: "response",
    title: "Response",
    description:
      "Markdown renderer that is safe to stream. Closes unterminated syntax as it arrives and highlights code with Shiki.",
    group: "ai",
    files: ["components/ai/response.tsx"],
    usage: `import { Response } from "@/components/ai/response"

<Response isAnimating={status === "streaming"}>{part.text}</Response>`,
    api: [
      {
        component: "Response",
        props: [
          { name: "children", type: "string", description: "Markdown source." },
          {
            name: "isAnimating",
            type: "boolean",
            default: "false",
            description: "Streaming mode: fades in new tokens and repairs partial syntax.",
          },
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
          {
            name: "isStreaming",
            type: "boolean",
            default: "false",
            description: "Opens the panel and runs the timer. Collapses once when it turns false.",
          },
          {
            name: "duration",
            type: "number",
            description: "Seconds spent thinking. Measured automatically if omitted.",
          },
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
          {
            name: "state",
            type: '"input-streaming" | "input-available" | "output-available" | "output-error"',
            description: "Pending, running, done, failed.",
          },
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
    description:
      "Human-in-the-loop gate. The agent pauses on an irreversible action until the user approves or denies it.",
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
          {
            name: "decision",
            type: '"pending" | "approved" | "denied"',
            default: '"pending"',
            description: "Resolved state replaces the buttons.",
          },
          { name: "onApprove", type: "() => void", description: "" },
          { name: "onDeny", type: "() => void", description: "" },
          {
            name: "approveLabel",
            type: "string",
            default: '"Approve"',
            description: "Use the verb: Refund, Delete, Send.",
          },
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
        props: [
          {
            name: "steps",
            type: "{ id, label, detail?, status }[]",
            description: 'status: "pending" | "active" | "complete" | "error"',
          },
        ],
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

  {
    slug: "model-picker",
    title: "Model Picker",
    description:
      "Choose the model for the next message. A quiet trigger for the prompt toolbar; the menu says what each model is for.",
    group: "ai",
    files: ["components/ai/model-picker.tsx"],
    usage: `import { ModelPicker } from "@/components/ai/model-picker"

<ModelPicker
  models={[
    { id: "sonnet", name: "Claude Sonnet 5.5", description: "Balanced", capabilities: ["reasoning", "vision"], meta: "$$" },
    { id: "haiku", name: "Claude Haiku 4.5", description: "Quick answers", capabilities: ["fast"], meta: "$" },
  ]}
  value={model}
  onValueChange={setModel}
/>`,
    api: [
      {
        component: "ModelPicker",
        props: [
          {
            name: "models",
            type: "{ id, name, description?, capabilities?, meta? }[]",
            description:
              'capabilities show as small icons after the name: "reasoning" | "vision" | "fast" | "web". meta is appended to the description, like "$$" or "200k".',
          },
          { name: "value", type: "string", description: "Controlled model id. Or use defaultValue." },
          { name: "onValueChange", type: "(id: string) => void", description: "" },
          { name: "label", type: "string", description: "Optional menu heading." },
        ],
      },
    ],
    isNew: true,
  },
  {
    slug: "branch",
    title: "Branch",
    description: "Step through versions of a response after regenerating. New versions are selected as they arrive.",
    group: "ai",
    files: ["components/ai/branch.tsx"],
    usage: `import { Branch, BranchContent, BranchSelector } from "@/components/ai/branch"

<Branch count={versions.length}>
  <BranchContent>
    {versions.map((v) => <Response key={v.id}>{v.text}</Response>)}
  </BranchContent>
  <BranchSelector />
</Branch>`,
    api: [
      {
        component: "Branch",
        props: [
          { name: "count", type: "number", description: "Number of versions. Growing it selects the newest." },
          { name: "index", type: "number", description: "Controlled active version." },
          { name: "onIndexChange", type: "(index: number) => void", description: "" },
        ],
      },
    ],
    isNew: true,
  },
  {
    slug: "context-meter",
    title: "Context Meter",
    description:
      "How full the context window is. A small ring for the toolbar that shifts to warning at 80% and destructive at 95%, with a breakdown on hover.",
    group: "ai",
    files: ["components/ai/context-meter.tsx"],
    usage: `import { ContextMeter } from "@/components/ai/context-meter"

<ContextMeter
  used={usage.totalTokens}
  max={200_000}
  breakdown={[
    { label: "System and tools", tokens: 12_400 },
    { label: "Messages", tokens: 48_000 },
  ]}
/>`,
    api: [
      {
        component: "ContextMeter",
        props: [
          { name: "used", type: "number", description: "Tokens currently in context." },
          { name: "max", type: "number", description: "Context window size." },
          { name: "breakdown", type: "{ label, tokens }[]", description: "Shown in the hover card." },
          { name: "showLabel", type: "boolean", default: "true", description: "Percentage next to the ring." },
        ],
      },
    ],
    isNew: true,
  },
  {
    slug: "prompt-input-mentions",
    title: "Mentions",
    description:
      "Type @ in the composer to mention files, tools or agents. Keyboard first; picks show as chips and are reported for sending.",
    group: "ai",
    parent: { slug: "prompt-input", section: "mentions" },
    files: ["components/ai/prompt-input-mentions.tsx"],
    usage: `import { PromptInputMentions } from "@/components/ai/prompt-input-mentions"

<PromptInput onSubmit={({ text }) => send({ text, mentions })}>
  <PromptInputMentions items={items} onMentionsChange={setMentions} />
  <PromptInputTextarea />
  …
</PromptInput>`,
    api: [
      {
        component: "PromptInputMentions",
        props: [
          {
            name: "items",
            type: '{ id, label, type: "file" | "folder" | "tool" | "agent", description? }[]',
            description: "What can be mentioned. Filtered by the text after @.",
          },
          { name: "onMentionsChange", type: "(mentions) => void", description: "Current picks. Cleared after submit." },
        ],
      },
    ],
    isNew: true,
  },
  {
    slug: "artifact",
    title: "Artifact",
    description: "A generated document or file in its own panel beside the chat, opened from a card in the message.",
    group: "ai",
    files: ["components/ai/artifact.tsx"],
    usage: `import {
  Artifact,
  ArtifactAction,
  ArtifactActions,
  ArtifactCard,
  ArtifactContent,
  ArtifactHeader,
} from "@/components/ai/artifact"

<ArtifactCard title="Q3 pricing update" description="Document · v1" onOpen={() => setOpen(true)} />

<Artifact>
  <ArtifactHeader title="Q3 pricing update" description="Document · v1">
    <ArtifactActions>
      <ArtifactAction label="Copy"><CopyIcon /></ArtifactAction>
    </ArtifactActions>
  </ArtifactHeader>
  <ArtifactContent>…</ArtifactContent>
</Artifact>`,
    api: [
      {
        component: "ArtifactCard",
        props: [
          { name: "title", type: "string", description: "" },
          { name: "description", type: "string", description: "Kind and version." },
          { name: "kind", type: '"document" | "code"', default: '"document"', description: "Sets the icon." },
          { name: "active", type: "boolean", description: "Highlights the card while its panel is open." },
          { name: "onOpen", type: "() => void", description: "" },
        ],
      },
    ],
    isNew: true,
  },
  // Voice
  {
    slug: "voice-orb",
    title: "Voice Orb",
    description:
      "Presence for a voice agent, drawn in the primary color. Three variants: a rotating particle mesh, a soft glowing ring, or twisting ribbons. All react to state and voice level.",
    group: "voice",
    files: ["components/voice/voice-orb.tsx"],
    usage: `import { VoiceOrb, VoiceOrbProvider } from "@/components/voice/voice-orb"

<VoiceOrb state="listening" level={level} />
<VoiceOrb variant="ring" state="thinking" />

// Or set the variant once for the whole app
<VoiceOrbProvider variant="ring">{children}</VoiceOrbProvider>`,
    examples: [{ name: "voice-orb-variants", title: "Variants" }],
    api: [
      {
        component: "VoiceOrb",
        props: [
          {
            name: "variant",
            type: '"particles" | "ring" | "wave"',
            default: 'provider, else "particles"',
            description: "Visual style. Omit to use the nearest VoiceOrbProvider.",
          },
          { name: "state", type: '"idle" | "listening" | "thinking" | "speaking"', default: '"idle"', description: "" },
          { name: "level", type: "number", default: "0", description: "Loudness 0 to 1. Smoothed with a spring." },
          {
            name: "size",
            type: "number",
            default: "160",
            description:
              "Size in px. Wave renders 2x wide and 0.6x tall, capped to its container. Color follows --primary; override with a text-* class.",
          },
          {
            name: "particles",
            type: "number",
            default: "size² × 0.07",
            description: "Particles variant only. Approximate count, capped at 6000.",
          },
        ],
      },
      {
        component: "VoiceOrbProvider",
        props: [
          {
            name: "variant",
            type: '"particles" | "ring" | "wave"',
            description: "Default variant for every VoiceOrb inside.",
          },
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
          {
            name: "returns",
            type: "{ level, spectrum, active, error, start, stop }",
            description: "Call start() from a user gesture.",
          },
        ],
      },
    ],
    isNew: true,
  },
  {
    slug: "push-to-talk",
    title: "Push to Talk",
    description:
      "Hold to speak with pointer or the Space key. The ring grows with input level so users know they're heard.",
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
          {
            name: "hotkey",
            type: "boolean",
            default: "true",
            description: "Space triggers, except while typing in a field.",
          },
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

  {
    slug: "voice-picker",
    title: "Voice Picker",
    description: "Choose a synthetic voice, with a spoken preview for each option.",
    group: "voice",
    files: ["components/voice/voice-picker.tsx"],
    usage: `import { VoicePicker } from "@/components/voice/voice-picker"

<VoicePicker
  voices={[{ id: "aria", name: "Aria", description: "Warm and steady", tags: ["Calm"] }]}
  value={voice}
  onValueChange={setVoice}
  onPreview={(v) => tts.play(v.id)}
  onStopPreview={() => tts.stop()}
/>`,
    api: [
      {
        component: "VoicePicker",
        props: [
          { name: "voices", type: "{ id, name, description?, tags? }[]", description: "" },
          {
            name: "onPreview",
            type: "(voice) => Promise<void> | void",
            description: "Play a sample. The button shows stop until the promise settles.",
          },
          { name: "onStopPreview", type: "() => void", description: "Cut a preview short." },
          { name: "value", type: "string", description: "Controlled voice id. Or use defaultValue." },
        ],
      },
    ],
    isNew: true,
  },
  {
    slug: "call-controls",
    title: "Call Controls",
    description: "Controls for a realtime voice session: status and timer, mute, interrupt the agent, end the call.",
    group: "voice",
    files: ["components/voice/call-controls.tsx"],
    usage: `import { CallControls, CallEnd, CallInterrupt, CallMute, CallStatus } from "@/components/voice/call-controls"

<CallControls>
  <CallStatus state="connected" startedAt={startedAt} />
  <CallMute onPressedChange={setMuted} />
  <CallInterrupt disabled={!agentSpeaking} onClick={interrupt} />
  <CallEnd onClick={hangUp} />
</CallControls>`,
    api: [
      {
        component: "CallStatus",
        props: [
          { name: "state", type: '"connecting" | "connected" | "reconnecting" | "ended"', description: "" },
          { name: "startedAt", type: "number", description: "Epoch ms. Shows elapsed time while connected." },
        ],
      },
      {
        component: "CallMute",
        props: [
          { name: "pressed", type: "boolean", description: "Muted. Or use defaultPressed with onPressedChange." },
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
      ["sheet", "Sheet", "A panel that slides in from an edge. Can render inside a container, non-modal."],
      ["skeleton", "Skeleton", "A placeholder while content loads."],
      ["tabs", "Tabs", "Switch between related views."],
      ["textarea", "Textarea", "A multi-line text field that grows with content."],
      ["sonner", "Toast", "Brief notifications, via Sonner."],
      ["accordion", "Accordion", "Stacked sections that expand one or several at a time."],
      ["alert", "Alert", "A callout for status or warnings, inline with content."],
      ["alert-dialog", "Alert Dialog", "A modal that interrupts to confirm a destructive action."],
      ["breadcrumb", "Breadcrumb", "Where you are in a hierarchy, with links back up."],
      ["checkbox", "Checkbox", "An on/off choice, usually in a list of settings."],
      ["combobox", "Combobox", "A text input that filters a list of options as you type."],
      ["command", "Command", "A searchable command palette with groups and shortcuts."],
      ["context-menu", "Context Menu", "Actions on right-click or long press."],
      ["drawer", "Drawer", "A panel that slides up from the bottom and can be swiped away."],
      ["empty", "Empty", "A placeholder for empty states, with a next step."],
      ["field", "Field", "Label, control, description and error, laid out consistently."],
      ["hover-card", "Hover Card", "A rich preview when hovering a link or mention."],
      ["input-group", "Input Group", "An input with icons, text or buttons attached."],
      ["input-otp", "Input OTP", "One-time code entry, one character per slot."],
      ["label", "Label", "Accessible text for a form control."],
      ["menubar", "Menubar", "A desktop-style bar of menus."],
      ["pagination", "Pagination", "Move between pages of results."],
      ["progress", "Progress", "Completion of a known-length task."],
      ["radio-group", "Radio Group", "Pick exactly one of a few options."],
      ["slider", "Slider", "Choose a value within a range."],
      ["spinner", "Spinner", "Indeterminate loading indicator."],
      ["switch", "Switch", "Turn a setting on or off, taking effect immediately."],
      ["table", "Table", "Rows and columns of structured data."],
      ["toggle", "Toggle", "A button that stays pressed."],
      ["toggle-group", "Toggle Group", "A set of toggles, single or multiple choice."],
      [
        "calendar",
        "Calendar",
        "A month grid for picking a date or range.",
        [{ name: "date-picker", title: "Date picker" }],
      ],
      ["carousel", "Carousel", "Swipe or step through a row of cards."],
      ["form", "Form", "Consistent form layout with native validation, built on Base UI Form."],
      ["meter", "Meter", "A measurement within a known range, like quota used."],
      ["navigation-menu", "Navigation Menu", "Top-level site navigation with rich dropdowns."],
      ["number-field", "Number Field", "A numeric input with steppers, arrow keys and drag-to-scrub."],
      ["resizable", "Resizable", "Panels the user can resize by dragging the divider."],
      ["toolbar", "Toolbar", "A row of controls with arrow-key navigation between them."],
      ["tooltip", "Tooltip", "A label on hover or focus."],
    ] as [string, string, string, { name: string; title: string }[]?][]
  ).map(([slug, title, description, examples]): ComponentDoc => ({
    slug,
    title,
    description,
    group: "components",
    files: [`components/ui/${slug}.tsx`],
    usage: "",
    examples,
  })),
]

export const componentBySlug = Object.fromEntries(components.map((c) => [c.slug, c]))

export type NavItem = { title: string; href: string; isNew?: boolean }
export type NavGroup = { title: string; items: NavItem[] }

/** Where a component is documented: its own page, or a section of its parent's. */
export const docHref = (c: ComponentDoc) =>
  c.parent ? `/docs/components/${c.parent.slug}#${c.parent.section}` : `/docs/components/${c.slug}`

export const addonsOf = (slug: string) => components.filter((c) => c.parent?.slug === slug)

const toNav = (group: ComponentDoc["group"]) =>
  components
    .filter((c) => c.group === group && !c.parent)
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
