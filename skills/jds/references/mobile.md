# Mobile

Touch has no hover. Design for the thumb first.

## Rules

- No hover-only UI. No actions revealed on hover, and no tooltip as the only way to learn what something does. Keep actions visible.
- Give touch feedback with `active:`, `data-pressed` or `data-active` states.
- Targets are at least 44px. Use `pointer-coarse:` to grow controls on touch rather than making desktop controls huge.
- Text fields stay at 16px (`text-base`) on touch, or iOS zooms in on focus.
- Keep clear of the notch and home indicator with `--safe-top`, `--safe-right`, `--safe-bottom` and `--safe-left`. They read zero until the page sets `viewportFit: "cover"`.
- Use `dvh`, not `vh`, for full-height screens, so the browser bar doesn't cut them off.

## Layout

- The agent panel becomes a bottom drawer on phones. Don't squeeze a desktop side panel into a narrow column.
- Put the primary action within thumb reach: the bottom of the screen, not the top right.
- One column. Move secondary content into a sheet or drawer instead of shrinking it.
