import type { Metadata } from "next"

import { CodeBlock } from "@/components/docs/code-block"
import { Code, H2, H3, List, P, PageHeader, Pager } from "@/components/docs/prose"
import { TokenSwatches } from "@/components/docs/token-swatches"

export const metadata: Metadata = { title: "Styling" }

export default function StylingPage() {
  return (
    <>
      <PageHeader
        title="Styling"
        description="CSS variables for color, radius and motion, exposed as Tailwind utilities. Warm and paper-like in light, charcoal in dark."
      />

      <H2>Overview</H2>
      <P>
        Tokens follow the shadcn convention: a surface variable and a matching <Code>-foreground</Code>, defined on{" "}
        <Code>:root</Code> for light and <Code>.dark</Code> for dark, then mapped to Tailwind in{" "}
        <Code>@theme inline</Code>. Neutrals carry a slight warm hue (60 to 85 in OKLCH) instead of pure gray.
      </P>

      <H2>Colors</H2>
      <TokenSwatches />

      <H3>Ember</H3>
      <P>
        The only accent. Use it for agent activity: thinking, streaming, running tools, listening, pending approval.
        Don&apos;t use it for primary buttons or links. When everything is ember, activity stops standing out.
      </P>
      <List>
        <li>
          <Code>ember</Code> for dots, icons, rings and the voice orb.
        </li>
        <li>
          <Code>ember-muted</Code> for tinted backgrounds, like a pending approval card.
        </li>
        <li>
          <Code>ember-foreground</Code> for text on a solid ember fill.
        </li>
      </List>

      <H3>Status</H3>
      <P>
        <Code>success</Code>, <Code>warning</Code>, <Code>info</Code> and <Code>destructive</Code> each have a{" "}
        <Code>-foreground</Code> variant tuned for text on the page background.
      </P>

      <H2>Dark mode</H2>
      <P>
        Dark is the default and uses the <Code>.dark</Code> class on <Code>html</Code>. Borders and inputs are
        translucent foreground (9% and 13%) so they stay visible on any surface. A <Code>.light</Code> class scopes the
        light theme inside a dark page, which is how the palettes above render side by side.
      </P>
      <CodeBlock
        lang="css"
        title="app/globals.css"
        code={`:root,
.light {
  --background: oklch(0.975 0.006 85);
  --foreground: oklch(0.22 0.012 60);
  --ember: oklch(0.64 0.16 48);
  /* … */
}

.dark {
  --background: oklch(0.175 0.006 60);
  --foreground: oklch(0.93 0.01 80);
  --border: oklch(0.93 0.01 80 / 9%);
  --ember: oklch(0.74 0.15 55);
  /* … */
}`}
      />

      <H2>Radius</H2>
      <P>
        One base value, <Code>--radius: 0.625rem</Code>. The <Code>rounded-sm</Code> to <Code>rounded-4xl</Code>{" "}
        scale derives from it, so changing it reshapes everything consistently.
      </P>

      <H2>Customizing</H2>
      <P>
        Change the variables, not the components. To rebrand, adjust the hue of the neutrals and ember. To add a
        color, declare <Code>--name</Code> in both themes and <Code>--color-name</Code> in <Code>@theme inline</Code>.
      </P>

      <Pager href="/docs/styling" />
    </>
  )
}
