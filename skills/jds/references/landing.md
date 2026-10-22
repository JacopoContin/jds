# Landing pages

A landing page is the one place a hero belongs. The rules here are about doing one well. Start from the `landing-page` recipe, and pick its look in the Creative Director.

## Hero

- The headline is what the product does, in one sentence a customer would say. Not the product name, not a slogan.
- One supporting line under it, then one primary action. A second, quieter action (a ghost button or a link) is fine.
- Show the product working beside or below the copy: a real conversation, a tool call, the orb. Not a screenshot, not an illustration of a robot.
- Headings use `font-heading`, set by the theme. Weight `font-medium`, `tracking-tight`, `text-balance`. No gradient text.

## Type and rhythm

- Let one display face carry the brand. Body text stays in the body font.
- Size steps are big on a landing page: the headline is three or four steps above the body, section titles one or two.
- Sections are separated by space and a `border-t`, not by alternating background colors.

## Sections

- How it works: three short points in a row or a list, each a title and a sentence. No icon-in-a-card grids.
- Proof only when you have it: a real quote, a real logo, a real number. Never invent them.
- Close with the primary action again, one line above it.
- Footer: name and a few links. Skip a computed year: `new Date()` blocks prerendering under Cache Components.

## Copy

- Plain words about what happens for the customer. See [copy.md](copy.md): no "Unlock", "Supercharge" or "Seamlessly".
- Write the copy for the product in front of you. Placeholder copy left in the shipped page is the clearest sign of a generated site.

## Layout

- Use container queries (`@container`, `@4xl:`) so the page works in a preview and on a phone with the same code.
- Keep reading width under `max-w-3xl` for paragraphs, even in a wide hero.
- No horizontal scroll at 390px.
