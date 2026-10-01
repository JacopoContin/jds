# JDS (Jaco Design System)

An opinionated design system for AI agent and voice interfaces. Built on [Base UI](https://base-ui.com), distributed as source through the [shadcn CLI](https://ui.shadcn.com/docs/cli).

## Use

Add the registry to `components.json`:

```json
{
  "registries": {
    "@jds": "https://jds-ruddy.vercel.app/r/{name}.json"
  }
}
```

Then install the style and any component:

```bash
pnpm dlx shadcn@latest add @jds/style @jds/prompt-input
```

### Mobile

Controls grow to 44px touch targets on coarse pointers, and text fields stay at 16px so iOS doesn't zoom on focus. Sheets, drawers and the recipes keep clear of the notch and home indicator through the `--safe-top`, `--safe-right`, `--safe-bottom` and `--safe-left` variables. These are zero until the page opts in to the full screen:

```ts
// app/layout.tsx
export const viewport: Viewport = { viewportFit: "cover" }
```

## Develop

```bash
pnpm install
pnpm dev             # docs site on localhost:3000
pnpm registry:build  # regenerate registry.json and public/r
pnpm lint
```

Component metadata lives in `lib/docs.ts`. Components are in `components/{ai,voice,ui}`, demos in `examples/`, recipes (complete experiences, installable as blocks) in `recipes/` and `lib/recipes.ts`.

## License

MIT
