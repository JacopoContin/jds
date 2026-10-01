import type { Metadata } from "next"

import { CodeBlock } from "@/components/docs/code-block"
import { Command } from "@/components/docs/command"
import { Code, H2, List, P, PageHeader, Pager, Step, Steps } from "@/components/docs/prose"
import { nativeItems, nativeModules } from "@/lib/native"
import { site } from "@/lib/site"

export const metadata: Metadata = { title: "React Native" }

const NS = site.nativeNamespace

export default function NativePage() {
  return (
    <>
      <PageHeader
        title="React Native"
        description="JDS components for iOS and Android: the same tokens, variants and motion as the web, built with React Native."
      />

      <P>
        These are separate sources from the web components, styled with <Code>StyleSheet</Code> and the generated tokens
        instead of Tailwind, so there&apos;s no styling setup in your app. They install with the same shadcn CLI, from
        their own registry.
      </P>

      <H2>Prerequisites</H2>
      <List>
        <li>React Native with the New Architecture, as in any current Expo SDK.</li>
        <li>
          An <Code>@/</Code> path alias to your project root in <Code>tsconfig.json</Code>, and a{" "}
          <Code>components.json</Code> for the CLI.
        </li>
        <li>
          These native modules, at the versions your React Native needs. Expo picks them for you; in a bare app follow
          each library&apos;s setup, including Reanimated&apos;s Babel plugin. Wrap the app in{" "}
          <Code>SafeAreaProvider</Code>.
        </li>
      </List>
      <Command command={`expo install ${nativeModules.join(" ")}`} />

      <H2>Install</H2>
      <Steps>
        <Step title="Add the registry">
          <CodeBlock
            lang="json"
            title="components.json"
            code={`{
  "registries": {
    "${NS}": "${site.url}/r/native/{name}.json"
  }
}`}
          />
        </Step>
        <Step title="Add components">
          <P>
            Tokens and any other JDS parts a component uses come along. Packages install at the versions JDS checks
            against.
          </P>
          <Command command={`shadcn@latest add ${NS}/prompt-input ${NS}/sheet ${NS}/input`} />
        </Step>
        <Step title="Apply your theme">
          <P>
            The components read <Code>lib/tokens.ts</Code>. It starts as the default theme; replace it with your theme
            from Customize, <strong>Use this theme in your app</strong>, or from{" "}
            <Code>{`${site.url}/tokens/react-native?color=blue`}</Code>. Light and dark follow the system.
          </P>
        </Step>
      </Steps>

      <H2>Components</H2>
      <List>
        {nativeItems.map((i) => (
          <li key={i.slug}>
            <strong>{i.title}</strong> (<Code>{`${NS}/${i.slug}`}</Code>): {i.description}
          </li>
        ))}
      </List>

      <H2>Usage</H2>
      <CodeBlock
        lang="tsx"
        code={`import { KeyboardAvoidingView, Platform } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import {
  PromptInput,
  PromptInputAttachButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai/prompt-input"

export function Composer({ status, send, stop, attach }) {
  const insets = useSafeAreaInsets()
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <PromptInput status={status} onSubmit={({ text }) => send(text)} style={{ marginBottom: insets.bottom }}>
        <PromptInputTextarea placeholder="Message" />
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputAttachButton onPress={attach} />
          </PromptInputTools>
          <PromptInputSubmit onStop={stop} />
        </PromptInputToolbar>
      </PromptInput>
    </KeyboardAvoidingView>
  )
}`}
      />
      <P>
        <Code>status</Code> takes the AI SDK&apos;s <Code>useChat</Code> status as is. Return adds a line on phones, so
        the button sends. Attachments are yours to pick, for example with <Code>expo-document-picker</Code>.
      </P>

      <H2>What&apos;s next</H2>
      <P>
        Message, Conversation and the voice components are next. The voice orb needs a native renderer (Skia) rather
        than a port, so it comes last.
      </P>

      <Pager href="/docs/native" />
    </>
  )
}
