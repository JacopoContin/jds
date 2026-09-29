# Contributing to JDS

Thanks for helping. JDS is small on purpose: every component should earn its place in an agent or voice product.

## Setup

```bash
pnpm install
pnpm dev                 # docs site on localhost:3000
```

## Adding a component

1. **Start from the problem.** Open an issue describing the agent or voice moment it serves before writing code.
2. **Write the component** in `components/ai`, `components/voice` or `components/ui`. Build on Base UI primitives and existing JDS parts; import icons from `lib/icons` and motion from `lib/motion`, never directly.
3. **Add a demo** at `examples/<slug>-demo.tsx`. Use realistic agent-product content, not lorem ipsum.
4. **Register it** in `lib/docs.ts`: title, description, files, usage and API. An add-on to another component sets `parent` and is documented as a section of that page.
5. **Build the registry**: `pnpm registry:build`. Dependencies are read from your imports; the build fails if something is missing.

## Quality bar

Every change passes these before merging:

```bash
npx tsc --noEmit         # types
pnpm lint                # design-system rules; 0 errors, no eslint-disable
pnpm test:visual         # screenshots of every component and recipe, light and dark
```

- **Tokens, not values.** Colors come from theme tokens; no raw palette classes. Neutral by default.
- **Both themes.** Check light and dark. Every token set for light must be set for dark.
- **Motion with meaning.** Use the presets; respect `prefers-reduced-motion`.
- **Accessible.** Keyboard reachable, labelled controls, status never shown by color alone.

## Visual tests

Baselines are Linux screenshots produced in CI. If your change is meant to look different, run the **Visual tests** workflow with **update** on your branch to regenerate and commit them. Locally, `pnpm test:visual:update` creates baselines for your own platform (ignored by git).

## Commits and releases

- Conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- Add a line to the changelog (`app/docs/changelog/page.tsx`) for anything user-facing.
- New recipes ship in weekly drops: one or two complete experiences in `recipes/<slug>/`, listed in `lib/recipes.ts`, announced in the changelog.
