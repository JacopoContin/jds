/**
 * Recipes: complete agent experiences built on particles, installable as one registry
 * block. Each ships its UI plus a session interface with a simulated implementation,
 * so the flow runs before the backend exists. The registry build reads this list.
 */
export type Recipe = {
  slug: string
  title: string
  description: string
  /** The flow, one line per step, as the user experiences it. */
  flow: { title: string; body: string }[]
  /** Installed together; the first is the entry component. */
  files: string[]
  /** Where the session interface lives, shown on the page. */
  session: string
  /** The particle this grew from. */
  particle?: string
}

export const recipes: Recipe[] = [
  {
    slug: "voice-receptionist",
    title: "Voice receptionist",
    description:
      "An agent that answers the phone: greets the caller, looks them up, checks the calendar, books or moves an appointment, texts a confirmation, and can hand off to a person.",
    flow: [
      { title: "Connect", body: "The orb breathes while the session opens; the timer starts once connected." },
      { title: "Greet and listen", body: "The agent speaks first; the orb follows who is talking and captions stream in." },
      { title: "Look up and check", body: "Tool calls run in the open: patient lookup, then calendar availability." },
      { title: "Offer and book", body: "The agent reads back options, the caller picks, the booking and SMS go through." },
      { title: "Wrap up or hand off", body: "The call ends with an outcome card, or transfers to staff with the transcript." },
    ],
    files: ["recipes/voice-receptionist/voice-receptionist.tsx", "recipes/voice-receptionist/session.ts"],
    session: "recipes/voice-receptionist/session.ts",
    particle: "voice-call",
  },
]

export const recipeBySlug = Object.fromEntries(recipes.map((r) => [r.slug, r]))
