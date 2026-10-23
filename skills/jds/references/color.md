# Color

## Tokens

Every color is a token defined in `app/globals.css` for light and dark:

- Surfaces: `background`, `card`, `popover`, `muted`, `sidebar`
- Text: `foreground`, `muted-foreground`, and the `*-foreground` that pairs with each surface
- Lines: `border`, `input`, `ring`
- Brand: `primary` and `primary-foreground`
- Status: `success`, `warning`, `info`, `destructive`, each with a `-foreground`

Always pair a background with its foreground (`bg-primary text-primary-foreground`). That pairing is what keeps contrast right in both themes.

## Use color for meaning

- `primary` is for the main action and the current selection. If everything is primary, nothing is.
- Status colors mean status: a failed tool call is `destructive`, a completed step is `success`, a pending approval is `warning`. Don't use them for decoration.
- Neutral by default. Most of the screen is `background`, `card`, `foreground` and `muted-foreground`.

## Dark mode

Don't write `dark:` overrides for colors. The tokens already change. If something looks wrong in dark mode, the fix is a token, not a variant.

## Branding

To brand an app, change `--primary` and `--ring`, or tint the neutrals with a small chroma. To add a color, declare `--name` in both `:root` and `.dark`, and `--color-name` in `@theme inline`. A color set for light but not dark leaks into dark mode.

## Custom utilities

Don't name a custom `@utility` with a Tailwind prefix it doesn't belong to (`bg-`, `text-`, `shadow-`, `ring-`). `cn` (tailwind-merge) will treat it as a conflict and drop the real class.
