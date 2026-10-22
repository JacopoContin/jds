# Layout

## Spacing

Use the Tailwind 4px scale. JDS components mostly use:

- `gap-1` to `gap-2` inside a control (icon and label, chips in a row)
- `gap-3` to `gap-4` between controls in a group
- `gap-6` to `gap-8` between sections
- `p-4` inside a card or panel, `p-3` when it is dense, `p-6` for a page-level surface

Pick a step and keep it. Two gaps that differ by one step look like a mistake; gaps between levels should differ by at least two steps.

## Density

Agent and voice UI is a tool people use for hours. Default to compact: `text-sm` body, controls at their default size (`h-8`, growing to `h-11` on touch), lists without big padding. Go roomy only on an empty state or a voice screen with one thing on it.

## Surfaces

- One level of surface: page background, then `bg-card` (or a panel). Inside a card, separate with spacing or `border-t`, not another card.
- Use the surface tokens the theme gives you (`shadow-surface`, `inset-shadow-well`, `ring-surface-edge`, `data-surface="lit"`). Don't stack your own shadows on top.
- Reserve `shadow-lg` and up for things that float: popovers, menus, dialogs, a floating panel.

## Radius

Radius follows size: `rounded-md` for small controls, `rounded-lg` for inputs and cards, `rounded-xl` to `rounded-2xl` for panels and sheets, `rounded-full` for pills, avatars and the orb. A nested element gets a smaller radius than its container.

## Width and alignment

- Reading width: chat transcripts and prose stay within `max-w-2xl` to `max-w-3xl`.
- Left-align text. Center only short labels, a single empty-state line, or a voice screen built around the orb.
- Align to one edge. If the composer and the transcript share a column, they share its edges.
