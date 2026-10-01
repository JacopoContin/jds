import * as React from "react"
import { ActivityIndicator, StyleSheet, TextInput, View, type TextInputProps, type ViewProps } from "react-native"
import Animated, { ZoomIn } from "react-native-reanimated"
import { ArrowUp, Paperclip, Square } from "lucide-react-native"

import { Button, ButtonIcon, type ButtonProps } from "@/components/ui/button"
import { alpha, duration, radius, useColors } from "@/lib/tokens"

/** Mirrors the AI SDK `useChat` status so it can be passed straight through. */
type ChatStatus = "ready" | "submitted" | "streaming" | "error"

type PromptInputContextValue = {
  value: string
  setValue: (value: string) => void
  status: ChatStatus
  submit: () => void
  setFocused: (focused: boolean) => void
}

const PromptInputContext = React.createContext<PromptInputContextValue | null>(null)

function usePromptInput() {
  const ctx = React.useContext(PromptInputContext)
  if (!ctx) throw new Error("PromptInput parts must be used inside <PromptInput>")
  return ctx
}

type PromptInputProps = ViewProps & {
  value?: string
  onValueChange?: (value: string) => void
  onSubmit: (message: { text: string }) => void
  status?: ChatStatus
}

/**
 * The chat composer, with the same parts as the web one. Return adds a line on phones,
 * so sending is the button. Attachments are yours to pick (e.g. expo-document-picker):
 * wire PromptInputAttachButton's onPress and show them in the toolbar.
 */
function PromptInput({
  value: controlledValue,
  onValueChange,
  onSubmit,
  status = "ready",
  style,
  children,
  ...props
}: PromptInputProps) {
  const c = useColors()
  const [uncontrolled, setUncontrolled] = React.useState("")
  const [focused, setFocused] = React.useState(false)
  const value = controlledValue ?? uncontrolled

  const setValue = React.useCallback(
    (next: string) => {
      if (controlledValue === undefined) setUncontrolled(next)
      onValueChange?.(next)
    },
    [controlledValue, onValueChange]
  )

  const submit = React.useCallback(() => {
    const text = value.trim()
    if (!text || status === "submitted" || status === "streaming") return
    onSubmit({ text })
    setValue("")
  }, [value, status, onSubmit, setValue])

  return (
    <PromptInputContext.Provider value={{ value, setValue, status, submit, setFocused }}>
      <View
        style={[
          styles.frame,
          {
            borderRadius: radius["2xl"],
            backgroundColor: c.card,
            borderColor: focused ? alpha(c.ring, 0.6) : c.input,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    </PromptInputContext.Provider>
  )
}

function PromptInputTextarea({ style, onFocus, onBlur, ...props }: TextInputProps) {
  const c = useColors()
  const { value, setValue, setFocused } = usePromptInput()
  return (
    <TextInput
      multiline
      value={value}
      onChangeText={setValue}
      placeholderTextColor={c.mutedForeground}
      selectionColor={c.primary}
      onFocus={(e) => {
        setFocused(true)
        onFocus?.(e)
      }}
      onBlur={(e) => {
        setFocused(false)
        onBlur?.(e)
      }}
      style={[styles.textarea, { color: c.foreground }, style]}
      {...props}
    />
  )
}

function PromptInputToolbar({ style, ...props }: ViewProps) {
  return <View style={[styles.toolbar, style]} {...props} />
}

function PromptInputTools({ style, ...props }: ViewProps) {
  return <View style={[styles.tools, style]} {...props} />
}

function PromptInputAttachButton(props: ButtonProps) {
  return (
    <Button variant="ghost" size="icon-sm" accessibilityLabel="Attach files" {...props}>
      <ButtonIcon icon={Paperclip} />
    </Button>
  )
}

/** Send while ready; a stop button while the agent works. Disabled when there's nothing to send. */
function PromptInputSubmit({ onStop, style, ...props }: ButtonProps & { onStop?: () => void }) {
  const c = useColors()
  const { status, value, submit } = usePromptInput()
  const busy = status === "submitted" || status === "streaming"
  return (
    <Button
      size="icon-sm"
      accessibilityLabel={busy ? "Stop generating" : "Send message"}
      disabled={!busy && !value.trim()}
      onPress={busy ? onStop : submit}
      style={[styles.round, style]}
      {...props}
    >
      {/* Keyed by status, so each change pops the new icon in. */}
      <Animated.View key={status} entering={ZoomIn.duration(duration.fast)}>
        {status === "submitted" ? (
          <ActivityIndicator size="small" color={c.primaryForeground} />
        ) : status === "streaming" ? (
          <ButtonIcon icon={Square} filled />
        ) : (
          <ButtonIcon icon={ArrowUp} />
        )}
      </Animated.View>
    </Button>
  )
}

const styles = StyleSheet.create({
  frame: { width: "100%", borderWidth: 1 },
  textarea: {
    minHeight: 48,
    maxHeight: 240,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
    fontSize: 16,
    textAlignVertical: "top",
  },
  toolbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, padding: 8 },
  tools: { flexDirection: "row", alignItems: "center", gap: 4, minWidth: 0 },
  round: { borderRadius: 999 },
})

export {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputAttachButton,
  PromptInputSubmit,
  usePromptInput,
  type ChatStatus,
}
