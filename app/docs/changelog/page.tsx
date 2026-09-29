import type { Metadata } from "next"

import { H2, H3, List, P, PageHeader, Pager } from "@/components/docs/prose"

export const metadata: Metadata = { title: "Changelog" }

const releases = [
  {
    version: "0.2.0",
    date: "Unreleased",
    summary: "Voice Orb Studio, Prompt Input Studio, and recipes.",
    sections: [
      {
        title: "Changed",
        items: [
          "Particles are now recipes: every one installs with shadcn add as a block, and /particles redirects to /recipes.",
        ],
      },
      {
        title: "Added",
        items: [
          "Artifact Studio: how generated documents, code and previews open next to the chat (beside it and resizable, as a sheet, full screen, or inline in the message), with version switcher and actions.",
          "Command Bar: a ⌘K palette that also asks the agent. The Ask row turns what you typed into a question and the answer replaces the list until Escape. Place the row first so Enter asks, or last so Enter runs the best command. With a Command Bar Studio.",
          "Voice Call Studio: design the voice agent's call screen (layout, captions, waveform, status, hand-off, glow backdrop) with a live sample call. The recipe gains matching props.",
          "Use this theme in your app: the Customize menu exports what you picked as one install command (a registry theme built from your choices), plus the font and orb lines for the root layout, or as a Markdown spec.",
          "Studio Code tabs: choose whether choices apply to one component or the whole app, and Copy as Markdown for a spec to hand to a teammate or a coding agent.",
          "VoiceOrbProvider takes the full orb style (palette, glow, speed, sensitivity, material), not just the variant, so one provider styles every orb in an app.",
          "Conversation Studio: bubbles, shape, density, avatars and actions, plus how reasoning, plans, tool calls, approvals, sources and artifacts show in a turn, working or done, on a page or in a side panel.",
          "Conversation bubbles, shape and density props, applied to every Message inside (or via MessageStyleProvider).",
          "Agent side panel recipe, rebuilt on Agent Panel: panel, orb and composer come from their Studios, chat plus hold-to-talk voice whose turns land in the chat, and a session shaped like the AI SDK's useChat.",
          "Chat app recipe takes a composer from the Prompt Input Studio. Each Studio's Code tab now includes the matching recipe snippet.",
          "Recipe quick filters: voice, side panel, chat, operations.",
          "Voice agent recipe: the orb, live captions and call controls, with tool calls and transcript beside them. Takes the orb style straight from the Voice Orb Studio, a split or focus layout, and a session interface for your realtime provider, with a simulated session to run it today.",
          "Prompt Input Studio: presets, context header, option chips, tools, voice mode and send behaviour, previewed on a new-chat page, under a conversation and in a side panel, with generated code.",
          "Prompt Input submitOn prop: send with Enter or with ⌘/Ctrl+Enter.",
          "Prompt Input Tools menu: web search, deep research and similar tools in one toolbar menu that fits any width. Model Picker and the menu truncate instead of pushing send out of a narrow toolbar.",
          "Prompt Input Scope: a module picker in the composer footer that limits what the agent works on.",
          "Voice Orb Studio: presets, style, palette, size, glow, speed and sensitivity, previewed in every state, with generated code.",
          "Voice Orb connecting and error states, plus speed, glow and sensitivity props, on every variant.",
          "Voice Orb plasma and liquid variants: WebGL shaders that take the same palettes as aura, and fall back to aura without WebGL.",
          "Voice Orb glass variant (shader) and dot variant, a minimal presence for composer buttons, headers and call pills.",
          "Voice Orb shape and material props: thickness, gloss, blobs, turbulence, filaments, grain, bars and density, each for the variants it fits, with controls in the Studio.",
          "Voice Orb Studio: custom palettes, and previews inside a side panel, a call and compact placements.",
        ],
      },
    ],
  },
  {
    version: "0.1.0",
    date: "28 September 2026",
    summary: "First public preview.",
    sections: [
      {
        title: "Added",
        items: [
          "Agent components: Conversation, Message, Prompt Input (with frame, dictation and mentions), Response, Reasoning, Tool Call, Approval, Agent Steps, Sources, Suggestions, Shimmer, Model Picker, Branch, Context Meter, Artifact.",
          "Voice components: Voice Orb (particles, ring, wave, aura, bars and halftone variants), Waveform, Push to Talk, Live Transcript, Voice Picker, Call Controls.",
          "52 Base UI primitives, from Accordion to Tooltip, including Number Field, Meter, Toolbar and Form built directly on Base UI.",
          "Particles: Chat app, Agent inbox, Run history, Agent onboarding, Agent marketplace, Agent run, Agent panel, Voice call, Voice session, Agent settings.",
          "Primary color presets (blue, violet, rose, emerald, amber) and base colors (stone, zinc, slate) as registry themes. Neutral by default.",
          "Customize panel in the docs header: primary and base color, radius, font and voice orb, restored before first paint.",
          "Docs for agents: llms.txt, llms-full.txt, per-component Markdown, and Copy page on every page. ⌘K search.",
          "Visual regression tests for every component and particle, light and dark, run in CI. Contribution guide.",
        ],
      },
      {
        title: "Changed",
        items: [
          "Palette is neutral grayscale with no brand accent; color is reserved for status.",
          "Dictation and mentions are documented on the Prompt Input page, still installed as separate items.",
        ],
      },
      {
        title: "Fixed",
        items: [
          "Response no longer squashes sibling message parts by claiming full height.",
          "Toggle and Toggle Group pressed state is now clearly visible; it was nearly identical to the unpressed surface.",
          "Mentions menu renders in a portal, so containers with overflow hidden no longer cut it off.",
          "Base colors no longer leak light-mode borders into dark mode.",
          "Upstream fixes to vendored primitives: invalid Tailwind variants in Navigation Menu, a setState-in-effect and listener leak in Carousel, calendar surface and selected-today styling.",
        ],
      },
    ],
  },
]

export default function ChangelogPage() {
  return (
    <>
      <PageHeader title="Changelog" description="What shipped, newest first." />
      {releases.map((r) => (
        <div key={r.version}>
          <H2 id={`v${r.version}`}>{`${r.version} · ${r.date}`}</H2>
          <P>{r.summary}</P>
          {r.sections.map((s) => (
            <div key={s.title}>
              <H3 id={`v${r.version}-${s.title.toLowerCase()}`}>{s.title}</H3>
              <List>
                {s.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </List>
            </div>
          ))}
        </div>
      ))}
      <Pager href="/docs/changelog" />
    </>
  )
}
