import type { Metadata } from "next"

import { CodeBlock } from "@/components/docs/code-block"
import { Code, H2, List, P, PageHeader, Pager, Step, Steps } from "@/components/docs/prose"
import { site } from "@/lib/site"

export const metadata: Metadata = { title: "Contributing" }

export default function ContributingPage() {
  return (
    <>
      <PageHeader
        title="Contributing"
        description="JDS is small on purpose: every component should earn its place in an agent or voice product."
      />

      <H2>Setup</H2>
      <CodeBlock
        lang="bash"
        code={`git clone ${site.github}
pnpm install
pnpm dev`}
      />

      <H2>Adding a component</H2>
      <Steps>
        <Step title="Start from the problem">
          <P>Open an issue describing the agent or voice moment it serves before writing code.</P>
        </Step>
        <Step title="Write the component">
          <P>
            In <Code>components/ai</Code>, <Code>components/voice</Code> or <Code>components/ui</Code>. Build on Base UI
            and existing JDS parts. Import icons from <Code>lib/icons</Code> and motion from <Code>lib/motion</Code>.
          </P>
        </Step>
        <Step title="Add a demo">
          <P>
            <Code>examples/&lt;slug&gt;-demo.tsx</Code>, with realistic agent-product content.
          </P>
        </Step>
        <Step title="Register it">
          <P>
            Add an entry to <Code>lib/docs.ts</Code>. Add-ons set <Code>parent</Code> and become a section of that page.
            Then run <Code>pnpm registry:build</Code>; dependencies are read from your imports and the build fails if
            something is missing.
          </P>
        </Step>
      </Steps>

      <H2>Quality bar</H2>
      <CodeBlock
        lang="bash"
        code={`npx tsc --noEmit    # types
pnpm lint           # design-system rules: 0 errors, no eslint-disable
pnpm test:visual    # every component and recipe, light and dark`}
      />
      <List>
        <li>
          <strong>Tokens, not values.</strong> Colors come from theme tokens. Neutral by default.
        </li>
        <li>
          <strong>Both themes.</strong> Every token set for light is set for dark; the registry build enforces it.
        </li>
        <li>
          <strong>Motion with meaning.</strong> Use the presets and respect reduced motion.
        </li>
        <li>
          <strong>Accessible.</strong> Keyboard reachable, labelled controls, status never shown by color alone.
        </li>
      </List>

      <H2>Visual tests</H2>
      <P>
        Every component preview and recipe is screenshotted in light and dark with the clock paused, so timers and
        animations land in the same state each run. Voice visuals, which are random by design, are masked. Baselines are
        Linux screenshots made in CI: if a change is meant to look different, run the <strong>Visual tests</strong>{" "}
        workflow with <strong>update</strong> to regenerate them.
      </P>

      <H2>Releases</H2>
      <P>
        Conventional commits, a changelog line for anything user-facing, and new recipes in weekly drops of one or two
        complete screens.
      </P>

      <Pager href="/docs/contributing" />
    </>
  )
}
