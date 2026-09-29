import type { Metadata } from "next"

import { CodeBlock } from "@/components/docs/code-block"
import { Command } from "@/components/docs/command"
import { Code, H2, H3, List, P, PageHeader, Pager, Step, Steps } from "@/components/docs/prose"
import { site } from "@/lib/site"

export const metadata: Metadata = { title: "Get Started" }

export default function GetStartedPage() {
  return (
    <>
      <PageHeader title="Get Started" description="Add JDS to a new or existing React project." />

      <H2>Prerequisites</H2>
      <List>
        <li>React 19 with Tailwind CSS v4.</li>
        <li>
          A <Code>components.json</Code> from <Code>shadcn init</Code>. Next.js App Router is assumed in examples, but
          nothing depends on it.
        </li>
      </List>

      <H2>Add the registry</H2>
      <P>
        Register the <Code>{site.namespace}</Code> namespace in <Code>components.json</Code> so the CLI knows where to
        fetch components from.
      </P>
      <CodeBlock
        lang="json"
        title="components.json"
        code={`{
  "registries": {
    "${site.namespace}": "${site.url}/r/{name}.json"
  }
}`}
      />

      <H2>Install</H2>
      <Steps>
        <Step title="Add the style">
          <P>
            Installs the neutral light and dark themes, status colors, motion keyframes, and the shared icon and motion
            utilities. To start from your own look, pick a color, base, radius, font and orb in the Customize menu in
            the header, then choose <strong>Use this theme in your app</strong>: one command installs the style with
            your theme.
          </P>
          <Command command={`shadcn@latest add ${site.namespace}/style`} />
        </Step>
        <Step title="Add components">
          <P>Each component page lists its own command. Dependencies, including other JDS components, come along.</P>
          <Command command={`shadcn@latest add ${site.namespace}/prompt-input ${site.namespace}/message`} />
        </Step>
        <Step title="Set the default theme">
          <P>
            JDS is designed dark first. With <Code>next-themes</Code>, set <Code>defaultTheme=&quot;dark&quot;</Code>{" "}
            and keep light available. Both themes are complete.
          </P>
        </Step>
      </Steps>

      <H3>Manual installation</H3>
      <List>
        <li>Open a component page and switch to the Code tab.</li>
        <li>
          Copy the source into the path shown, for example <Code>components/ai/prompt-input.tsx</Code>.
        </li>
        <li>
          Copy <Code>lib/icons.ts</Code> and <Code>lib/motion.ts</Code> once. Every component imports them.
        </li>
        <li>Install the npm dependencies listed on the page.</li>
      </List>

      <H2>Fonts</H2>
      <P>
        Components read three variables: <Code>--font-sans</Code> for UI text, <Code>--font-mono</Code> for code and
        keys, and <Code>--font-heading</Code> for titles (aliased to sans by default). This site uses Geist and Geist
        Mono.
      </P>
      <CodeBlock
        title="app/layout.tsx"
        code={`import { Geist, Geist_Mono } from "next/font/google"

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] })
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] })

<html className={\`\${sans.variable} \${mono.variable}\`}>`}
      />
      <P>
        Next.js starters name the variable <Code>--font-geist-sans</Code>. Rename it to <Code>--font-sans</Code> or text
        falls back to the system font.
      </P>

      <H2>Using with the AI SDK</H2>
      <P>
        <Code>PromptInput</Code> status and <Code>ToolCall</Code> states use the AI SDK&apos;s strings, so values pass
        straight through.
      </P>
      <CodeBlock
        code={`const { messages, status, sendMessage, stop } = useChat()

{messages.map((m) => (
  <Message key={m.id} from={m.role}>
    <MessageContent>
      {m.parts.map((part, i) => {
        if (part.type === "text") return <Response key={i} isAnimating={status === "streaming"}>{part.text}</Response>
        if (part.type === "reasoning") return (
          <Reasoning key={i} isStreaming={part.state === "streaming"}>
            <ReasoningTrigger />
            <ReasoningContent>{part.text}</ReasoningContent>
          </Reasoning>
        )
        if (part.type.startsWith("tool-")) return (
          <ToolCall key={i}>
            <ToolCallHeader name={part.type.slice(5)} state={part.state} />
          </ToolCall>
        )
      })}
    </MessageContent>
  </Message>
))}

<PromptInput status={status} onSubmit={({ text }) => sendMessage({ text })}>
  <PromptInputTextarea />
  <PromptInputToolbar>
    <PromptInputTools />
    <PromptInputSubmit onStop={stop} />
  </PromptInputToolbar>
</PromptInput>`}
      />

      <H2>Working with coding agents</H2>
      <P>
        The registry is plain JSON at <Code>{`${site.url}/r/{name}.json`}</Code>. With the namespace in{" "}
        <Code>components.json</Code>, the shadcn MCP server can search and install JDS components from your agent.
      </P>
      <List>
        <li>
          <a href="/llms.txt" className="text-foreground underline underline-offset-4">
            /llms.txt
          </a>{" "}
          indexes every page, with a Markdown link per component.
        </li>
        <li>
          <a href="/llms-full.txt" className="text-foreground underline underline-offset-4">
            /llms-full.txt
          </a>{" "}
          has every component&apos;s docs and source in one file.
        </li>
        <li>
          <strong>Copy page</strong>, at the top of every page, copies it as Markdown for pasting into a chat.
        </li>
      </List>

      <Pager href="/docs/get-started" />
    </>
  )
}
