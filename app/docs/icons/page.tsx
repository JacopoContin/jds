import type { Metadata } from "next"

import { CodeBlock } from "@/components/docs/code-block"
import { IconGrid } from "@/components/docs/icon-grid"
import { Code, H2, P, PageHeader, Pager } from "@/components/docs/prose"

export const metadata: Metadata = { title: "Icons" }

export default function IconsPage() {
  return (
    <>
      <PageHeader
        title="Icons"
        description="A semantic icon layer. Components import SendIcon, not ArrowUp, so the underlying set can change without touching them."
      />

      <H2>How it works</H2>
      <P>
        <Code>lib/icons.ts</Code> re-exports Lucide icons under names that describe their job. Components only import
        from there. To use a different set, change the re-exports in one file.
      </P>
      <CodeBlock
        title="lib/icons.ts"
        code={`export {
  ArrowUp as SendIcon,
  Square as StopIcon,
  Brain as ReasoningIcon,
  Wrench as ToolIcon,
  // …
} from "lucide-react"`}
      />

      <H2>Sizing</H2>
      <P>
        Icons inherit <Code>currentColor</Code>. Inside buttons they size automatically with the button. Elsewhere use{" "}
        <Code>size-3.5</Code> in dense UI and <Code>size-4</Code> by default.
      </P>

      <H2>Set</H2>
      <IconGrid />

      <Pager href="/docs/icons" />
    </>
  )
}
