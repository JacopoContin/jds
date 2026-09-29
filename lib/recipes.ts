/**
 * Recipes: complete agent and voice experiences composed from JDS components. Each one
 * runs as-is, installs as one registry block, and lives in `recipes/<slug>/`. The
 * registry build and the /recipes pages read this list.
 *
 * Some recipes separate UI from behaviour with a session interface (`session`), so a real
 * backend replaces the simulated one without touching the UI. The rest keep their scripted
 * behaviour inside the component and get a session as they grow.
 */
export type RecipeTag = "voice" | "panel" | "chat" | "operations"

/** Quick filters on /recipes, in display order. */
export const recipeTags: { value: RecipeTag; label: string }[] = [
  { value: "voice", label: "Voice" },
  { value: "panel", label: "Side panel" },
  { value: "chat", label: "Chat" },
  { value: "operations", label: "Operations" },
]

export type Recipe = {
  slug: string
  tags: RecipeTag[]
  title: string
  description: string
  /** Installed together; the first is the entry component. Shared hooks are listed here too. */
  files: string[]
  /** How to use it in your app: style, place, connect. Each step can carry a snippet. */
  steps?: { title: string; body: string; code?: string }[]
  /** File holding the session interface to implement, shown on the recipe page. */
  session?: string
  /** Kept in the repo but left off the site and the registry while its value is unclear. */
  hidden?: boolean
}

const SIMULATED_SPECTRUM = "hooks/use-simulated-spectrum.ts"

const allRecipes: Recipe[] = [
  // Ordered by how useful each is to someone shipping a voice agent or an agent side panel.
  {
    slug: "voice-agent",
    tags: ["voice"],
    title: "Voice agent",
    description:
      "A complete voice agent surface: the orb, live captions and call controls, with the agent's tool calls and transcript beside it. Style it in the Studio, pick a layout, connect your voice session.",
    steps: [
      {
        title: "Style the orb",
        body: "Design the orb in the Voice Orb Studio and copy its props. Leave it out to use the orb set in your VoiceOrbProvider.",
        code: `<VoiceAgent
  session={session}
  orb={{ variant: "glass", palette: "iris", glow: 0.3, size: 220 }}
/>`,
      },
      {
        title: "Place it",
        body: "Split shows the agent's actions and transcript beside the call, for a full page. Focus is the call alone, for a dialog or a side panel's voice mode.",
        code: `<VoiceAgent session={session} layout="focus" agentName="Aria" subtitle="Your workspace assistant" />`,
      },
      {
        title: "Connect your session",
        body: "The UI only reads a VoiceAgentSession. Start with the simulated one, then return the same shape from your realtime provider.",
        code: `const session = useSimulatedVoiceAgent() // swap for useMyVoiceSession()`,
      },
    ],
    files: ["recipes/voice-agent/voice-agent.tsx", "recipes/voice-agent/session.ts"],
    session: "recipes/voice-agent/session.ts",
  },
  {
    slug: "agent-run",
    tags: ["chat"],
    title: "Agent run",
    description:
      "A full support-agent turn: reasoning, a plan, a tool call, approval before a refund, a streamed answer with sources.",
    files: ["recipes/agent-run/agent-run.tsx"],
  },
  {
    slug: "agent-panel",
    tags: ["panel", "chat", "voice"],
    title: "Agent panel",
    description:
      "A side panel agent over an app page. Chat with page context, dictate with the mic, or switch to voice mode; the voice turns land back in the chat.",
    files: ["recipes/agent-panel/agent-panel.tsx", SIMULATED_SPECTRUM],
  },
  {
    slug: "voice-call",
    tags: ["voice"],
    title: "Voice call",
    description:
      "A realtime call screen: connection status and timer, the orb, live captions, and mute, interrupt and end controls.",
    files: ["recipes/voice-call/voice-call.tsx", SIMULATED_SPECTRUM],
  },
  {
    slug: "voice-session",
    tags: ["voice"],
    title: "Voice session",
    description: "Push to talk with live mic level, orb states, and a rolling transcript.",
    files: ["recipes/voice-session/voice-session.tsx", SIMULATED_SPECTRUM],
  },
  {
    slug: "chat-app",
    tags: ["chat"],
    title: "Chat app",
    description:
      "A full chat screen: searchable conversation list, model picker and context meter in the header, a composer with @-mentions and dictation.",
    files: ["recipes/chat-app/chat-app.tsx"],
  },
  {
    slug: "agent-inbox",
    tags: ["operations"],
    title: "Agent inbox",
    description:
      "Runs that need a human. Pick one to see its steps and tool calls, then approve or deny; decided runs leave the queue.",
    files: ["recipes/agent-inbox/agent-inbox.tsx"],
  },
  {
    slug: "agent-settings",
    tags: ["operations"],
    title: "Agent settings",
    description:
      "Configure an agent: instructions, model, temperature, reply length, approval policy, tools, and voice.",
    files: ["recipes/agent-settings/agent-settings.tsx"],
  },
  {
    slug: "agent-onboarding",
    tags: ["chat", "operations"],
    title: "Agent onboarding",
    description:
      "Set up an agent by answering its questions. Quick replies drive the chat while a live card and progress list fill in beside it.",
    files: ["recipes/agent-onboarding/agent-onboarding.tsx"],
  },
  {
    slug: "run-history",
    tags: ["operations"],
    title: "Run history",
    description:
      "How agents are doing: headline stats with week-over-week change, runs per day (with a table view), and recent runs by status.",
    files: ["recipes/run-history/run-history.tsx"],
  },
  {
    slug: "agent-marketplace",
    tags: ["operations"],
    title: "Agent marketplace",
    description:
      "Browse and add prebuilt agents. Search and category filters, details with permissions, and add or remove in place.",
    files: ["recipes/agent-marketplace/agent-marketplace.tsx"],
    hidden: true,
  },
]

export const recipes = allRecipes.filter((r) => !r.hidden)

export const recipeBySlug = Object.fromEntries(recipes.map((r) => [r.slug, r]))

/** Where a recipe file lands in a user's project. */
export const installedPath = (file: string) => file.replace(/^recipes\//, "components/")
