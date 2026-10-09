import type { Metadata } from "next"
import Link from "next/link"

import { CodeBlock } from "@/components/docs/code-block"
import { Code, H2, List, P, PageHeader, Pager } from "@/components/docs/prose"
import { SpringDemo } from "@/components/docs/spring-demo"

export const metadata: Metadata = { title: "Motion" }

export default function MotionPage() {
  return (
    <>
      <PageHeader
        title="Motion"
        description="Presets in lib/motion.ts, built on Motion for React. Every animation in the system uses them."
      />

      <P>
        To change how the whole app feels, tune these presets in the{" "}
        <Link href="/studio/motion" className="underline underline-offset-4">
          Motion Studio
        </Link>{" "}
        and replace <Code>lib/motion.ts</Code> with what it generates.
      </P>

      <H2>Principles</H2>
      <List>
        <li>
          <strong>Feedback under 250ms.</strong> Anything answering a click or keypress finishes fast.
        </li>
        <li>
          <strong>Springs for things that move, tweens for things that fade.</strong> Springs keep momentum when
          interrupted, which happens constantly with streaming content.
        </li>
        <li>
          <strong>Motion shows state change.</strong> A send button turning into stop, a step completing, the orb
          following your voice. Nothing moves just to move.
        </li>
        <li>
          <strong>Respect reduced motion.</strong> Looping animations stop under <Code>prefers-reduced-motion</Code>.
        </li>
      </List>

      <H2>Springs</H2>
      <SpringDemo />
      <CodeBlock
        title="lib/motion.ts"
        code={`export const spring = {
  snappy: { type: "spring", stiffness: 520, damping: 34, mass: 0.6 },
  gentle: { type: "spring", stiffness: 260, damping: 30 },
  soft: { type: "spring", stiffness: 120, damping: 18 },
}`}
      />

      <H2>Durations and easing</H2>
      <P>
        For tweens: <Code>instant</Code> 100ms, <Code>fast</Code> 160ms, <Code>base</Code> 240ms, <Code>slow</Code>{" "}
        400ms. <Code>ease.out</Code> (quint) for entrances. The same curves exist in CSS as <Code>ease-out-quint</Code>{" "}
        and <Code>ease-in-out-quart</Code> for Tailwind transitions.
      </P>

      <H2>Variants</H2>
      <P>
        <Code>rise</Code> is the entrance for streamed content: 6px up, a short blur, fade in. <Code>stagger()</Code>{" "}
        cascades children, as in Suggestions.
      </P>
      <CodeBlock
        code={`import { rise, stagger } from "@/lib/motion"

<motion.div variants={stagger(0.05)} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.div key={item.id} variants={rise}>{item.label}</motion.div>
  ))}
</motion.div>`}
      />

      <Pager href="/docs/motion" />
    </>
  )
}
