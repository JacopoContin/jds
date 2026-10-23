# Motion

All motion comes from `lib/motion.ts`, built on Motion for React. Tune the presets in the Motion Studio; don't add new numbers in components.

## Principles

- **Feedback under 250ms.** Anything that answers a click or a keypress finishes fast: `duration.fast` or `spring.snappy`.
- **Springs for things that move, tweens for things that fade.** Springs keep momentum when interrupted, which happens constantly with streaming content.
- **Motion shows a change of state.** The send button turning into stop, a step completing, the orb following a voice. Nothing moves just to move.
- **Respect reduced motion.** Loops stop under `prefers-reduced-motion`.

## Which preset

- `spring.snappy`: buttons, toggles, small affordances
- `spring.gentle`: panels, messages, layout shifts
- `spring.soft`: voice orbs and ambient elements
- `rise`: streamed messages and list items entering
- `fade`: overlays and content swaps
- `stagger()`: a list appearing together, as in Suggestions

In CSS transitions, use `ease-out-quint` for entrances and `ease-in-out-quart` for loops.

## Don't

- No entrance animation on every element of a page load. Animate what changed.
- No bounce on things that carry text.
- No parallax, scroll-jacking or animated gradients behind content people read.
- Don't animate `width`, `height` or `top`. Use transforms, or Motion's `layout`.
