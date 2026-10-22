---
name: jds
description: Design rules for building UI with JDS (agent and voice interfaces on shadcn and Tailwind). Use whenever you create or change a page, component, recipe or layout in a project that uses JDS components, tokens or lib/motion.ts, so the result looks designed instead of generated.
---

# JDS design rules

JDS ships components and tokens. These rules are the taste that goes with them. Follow them by default; break one only when the user asks, and say which one.

## Before you write UI

1. Name the job: what the person is trying to do on this screen, in one sentence. Build for that, not for a generic dashboard.
2. Reuse first: an installed JDS component or recipe, then a shadcn primitive in `components/ui`, then new markup. Never rebuild a component that exists.
3. Pick one primary action per view. Everything else is quieter.

## Hard rules

- Colors come from theme tokens only (`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`). No hex, rgb, oklch or Tailwind palette colors (`bg-blue-500`) in app code.
- Change the variables, not the components. To rebrand, set tokens in `app/globals.css`; don't add `className` overrides to every instance.
- Icons come from `lib/icons.ts` by meaning (`SendIcon`, `CloseIcon`), not from `lucide-react` directly.
- Animation uses the presets in `lib/motion.ts` (`spring.snappy`, `spring.gentle`, `rise`, `fade`). No hand-written durations or bezier curves.
- Copy is minimal. The component is the explanation. See [copy](references/copy.md).
- Never remove focus rings, and never make hover the only way to reach an action.

## The slop list

These are the patterns that make UI look AI-generated. Don't produce them unless asked:

- A hero with a gradient headline, a subheading and two CTA buttons above every page.
- Purple-to-blue gradients, glowing borders, or `shadow-2xl` on ordinary cards.
- Cards inside cards inside cards. One level of surface, then use spacing and dividers.
- Feature grids of three icon-title-paragraph cards.
- Emoji as icons, or a sparkle icon on everything AI.
- Every element `rounded-2xl` with `p-8`. Size radius and padding to the element.
- Badges or chips that restate what the layout already says.
- Placeholder copy like "Unlock the power of AI" or "Seamlessly integrate".
- Centered text for anything longer than two lines.

## Reference

Read the file that matches what you are doing:

- [layout.md](references/layout.md): spacing, density, surfaces, radius
- [type.md](references/type.md): sizes, weights, hierarchy
- [color.md](references/color.md): tokens, status colors, dark mode, branding
- [motion.md](references/motion.md): when and how things move
- [copy.md](references/copy.md): labels, empty states, errors
- [mobile.md](references/mobile.md): touch, safe areas, no hover
- [agent-ui.md](references/agent-ui.md): chat, voice, tool calls, approvals, streaming

## Check your work

Run `pnpm lint` before you call UI done. If the project has `@shadcn/lint`, fix every error it reports by using the token or variant its message names. Never fix one with an `eslint-disable` comment.
