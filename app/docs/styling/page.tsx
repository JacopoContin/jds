import type { Metadata } from "next"

import { CodeBlock } from "@/components/docs/code-block"
import { Command } from "@/components/docs/command"
import { Code, H2, H3, List, P, PageHeader, Pager } from "@/components/docs/prose"
import { TokenSwatches } from "@/components/docs/token-swatches"
import { site } from "@/lib/site"

export const metadata: Metadata = { title: "Styling" }

export default function StylingPage() {
  return (
    <>
      <PageHeader
        title="Styling"
        description="CSS variables for color, radius and motion, exposed as Tailwind utilities. Neutral by default, so your brand sets the color."
      />

      <H2>Overview</H2>
      <P>
        Tokens follow the shadcn convention: a surface variable and a matching <Code>-foreground</Code>, defined on{" "}
        <Code>:root</Code> for light and <Code>.dark</Code> for dark, then mapped to Tailwind in{" "}
        <Code>@theme inline</Code>. The palette is pure grayscale, with color reserved for status.
      </P>

      <H2>Colors</H2>
      <TokenSwatches />

      <H3>Primary color</H3>
      <P>
        Neutral is the default: no brand color, and agent activity reads through motion and contrast. To add one, pick a
        preset. It only sets <Code>--primary</Code>, <Code>--primary-foreground</Code> and <Code>--ring</Code>, so
        buttons, focus rings and the Voice Orb follow it. Try them in Customize, the color dot in the header.
      </P>
      <Command command={`shadcn@latest add ${site.namespace}/color-blue`} />
      <P>
        Presets: <Code>color-blue</Code>, <Code>color-violet</Code>, <Code>color-rose</Code>, <Code>color-emerald</Code>
        , <Code>color-amber</Code>. For any other color, set the three variables yourself in both themes.
      </P>

      <H3>Base color</H3>
      <P>
        Tints the whole gray scale while keeping every lightness step, so contrast doesn&apos;t change.{" "}
        <strong>Stone</strong> is warm, <strong>Zinc</strong> is cool, <strong>Slate</strong> leans blue. Install a base
        before a primary color preset, so the preset&apos;s <Code>--primary</Code> wins.
      </P>
      <Command command={`shadcn@latest add ${site.namespace}/base-stone`} />

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
  --background: oklch(0.985 0 0);
  --foreground: oklch(0.145 0 0);
  --ring: oklch(0.6 0 0);
  /* … */
}

.dark {
  --background: oklch(0.185 0 0);
  --foreground: oklch(0.94 0 0);
  --border: oklch(1 0 0 / 9%);
  --ring: oklch(0.55 0 0);
  /* … */
}`}
      />

      <H2>Font</H2>
      <P>
        Components read <Code>--font-sans</Code>, so changing the font is one variable. This site offers Geist (the
        default), Inter and the system font in Customize. See{" "}
        <a href="/docs/get-started#fonts" className="text-foreground underline underline-offset-4">
          Get Started
        </a>{" "}
        for wiring a font with <Code>next/font</Code>.
      </P>

      <H2>Radius</H2>
      <P>
        One base value, <Code>--radius: 0.625rem</Code>. The <Code>rounded-sm</Code> to <Code>rounded-4xl</Code> scale
        derives from it, so changing it reshapes everything consistently. Try values from square (<Code>0</Code>) to
        soft (<Code>1rem</Code>) in Customize.
      </P>

      <H2>Mobile</H2>
      <P>
        On touch screens controls grow to 44px targets and text fields stay at 16px, so iOS doesn&apos;t zoom on focus.
        Sheets, drawers and recipes keep clear of the notch and home indicator through <Code>--safe-top</Code>,{" "}
        <Code>--safe-right</Code>, <Code>--safe-bottom</Code> and <Code>--safe-left</Code>. They read zero until the page
        opts in to the full screen:
      </P>
      <CodeBlock lang="tsx" code={`// app/layout.tsx\nexport const viewport: Viewport = { viewportFit: "cover" }`} />

      <H2>Native apps</H2>
      <P>
        The same tokens are generated for native apps from these variables: colors for light and dark (Display P3 on
        Apple platforms, sRGB elsewhere), the radius scale, spacing, touch target size, durations, easing curves and
        the three springs. Add the theme query from Customize to get your theme, e.g.{" "}
        <Code>?color=blue&amp;radius=0.5</Code>.
      </P>
      <List>
        <li>
          <a href={`${site.url}/tokens/swift`} className="text-foreground underline underline-offset-4">
            /tokens/swift
          </a>{" "}
          for SwiftUI: <Code>JDS.Colors.primary</Code>, <Code>JDS.Radius.lg</Code>, <Code>JDS.Spring.snappy</Code>.
        </li>
        <li>
          <a href={`${site.url}/tokens/kotlin`} className="text-foreground underline underline-offset-4">
            /tokens/kotlin
          </a>{" "}
          for Jetpack Compose: <Code>jdsColors().primary</Code>, <Code>JdsRadius.lg</Code>,{" "}
          <Code>JdsSpring.snappy()</Code>.
        </li>
        <li>
          <a href={`${site.url}/tokens/react-native`} className="text-foreground underline underline-offset-4">
            /tokens/react-native
          </a>{" "}
          for React Native: <Code>useColors().primary</Code>, <Code>radius.lg</Code>, and{" "}
          <Code>withSpring(value, spring.snappy)</Code> in Reanimated.
        </li>
        <li>
          <a href={`${site.url}/tokens/json`} className="text-foreground underline underline-offset-4">
            /tokens/json
          </a>{" "}
          in the Design Tokens (DTCG) format, for Style Dictionary or Tokens Studio.
        </li>
      </List>
      <P>
        Springs keep the web&apos;s mass, stiffness and damping, so motion feels the same everywhere. Re-download after
        changing the theme; the files say which theme they hold.
      </P>

      <H2>Customizing</H2>
      <P>
        Change the variables, not the components. To brand it, set <Code>--primary</Code> and <Code>--ring</Code>, or
        tint the neutrals by giving them a small chroma. To add a color, declare <Code>--name</Code> in both themes and{" "}
        <Code>--color-name</Code> in <Code>@theme inline</Code>.
      </P>

      <Pager href="/docs/styling" />
    </>
  )
}
