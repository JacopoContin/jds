# Type

## Sizes

- `text-sm` is the body size for app UI. Messages, labels, menus and inputs use it.
- `text-xs` for metadata: timestamps, counts, captions, keyboard hints. Pair it with `text-muted-foreground`.
- `text-base` for inputs on touch (16px stops iOS zooming on focus) and for long-form reading.
- `text-lg` and up only for a page title or the one line on an empty state. An app screen rarely needs more than one size above `text-sm`.

## Weight

- `font-medium` marks hierarchy: titles, active items, the name in a message.
- Use `font-semibold` only for a page title. Avoid `font-bold` in app UI.
- Hierarchy comes from weight and color (`text-foreground` versus `text-muted-foreground`) before size. Three levels are enough: primary, secondary, muted.

## Fonts

Use the theme's `font-sans`, `font-heading` and `font-mono`. Don't load another typeface in a component. Code, tool arguments and IDs use `font-mono`.

## Don't

- Don't write all caps for headings. A small `text-xs font-medium text-muted-foreground` label works for section headers in a menu or sidebar.
- Don't put gradient or clipped-background text on headings.
- Don't change letter spacing on body text.
