# JDS (Jaco Design System)

An opinionated design system for AI agent and voice interfaces. Built on [Base UI](https://base-ui.com), distributed as source through the [shadcn CLI](https://ui.shadcn.com/docs/cli).

## Use

Add the registry to `components.json`:

```json
{
  "registries": {
    "@jds": "https://jds.vercel.app/r/{name}.json"
  }
}
```

Then install the style and any component:

```bash
pnpm dlx shadcn@latest add @jds/style @jds/prompt-input
```

## Develop

```bash
pnpm install
pnpm dev             # docs site on localhost:3000
pnpm registry:build  # regenerate registry.json and public/r
pnpm lint
```

Component metadata lives in `lib/docs.ts`. Components are in `components/{ai,voice,ui}`, demos in `examples/`, full compositions in `particles/`.

## License

MIT
