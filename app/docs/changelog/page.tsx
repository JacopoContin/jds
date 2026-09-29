import type { Metadata } from "next"

import { H2, H3, List, P, PageHeader, Pager } from "@/components/docs/prose"

export const metadata: Metadata = { title: "Changelog" }

const releases = [
  {
    version: "0.2.0",
    date: "Unreleased",
    summary: "Voice Orb Studio.",
    sections: [
      {
        title: "Added",
        items: [
          "Voice Orb Studio: presets, style, palette, size, glow, speed and sensitivity, previewed in every state, with generated code.",
          "Voice Orb connecting and error states, plus speed, glow and sensitivity props, on every variant.",
          "Voice Orb plasma and liquid variants: WebGL shaders that take the same palettes as aura, and fall back to aura without WebGL.",
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
