import * as React from "react"
import { StyleSheet, TextInput, useColorScheme, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native"

import { alpha, radius, touchTarget, useColors } from "@/lib/tokens"

type InputProps = TextInputProps & {
  ref?: React.Ref<React.ComponentRef<typeof TextInput>>
  /** Red border and ring, like aria-invalid on the web. */
  invalid?: boolean
  /** Styles the outer frame, e.g. width or margins. `style` styles the text field itself. */
  containerStyle?: StyleProp<ViewStyle>
}

/** The ring sits outside the field, so focusing it doesn't move the text. */
const RING = 3

function Input({ ref, invalid, editable = true, containerStyle, style, onFocus, onBlur, ...props }: InputProps) {
  const c = useColors()
  const dark = useColorScheme() === "dark"
  const [focused, setFocused] = React.useState(false)
  const ring = invalid ? alpha(c.destructive, dark ? 0.4 : 0.2) : alpha(c.ring, 0.5)

  return (
    <View
      style={[
        styles.frame,
        { borderRadius: radius.lg + RING, borderColor: focused || invalid ? ring : "transparent" },
        !editable && styles.disabled,
        containerStyle,
      ]}
    >
      <TextInput
        ref={ref}
        editable={editable}
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
        style={[
          styles.field,
          {
            borderRadius: radius.lg,
            color: c.foreground,
            backgroundColor: dark ? alpha(c.input, 0.3) : "transparent",
            borderColor: invalid ? c.destructive : focused ? c.ring : c.input,
          },
          style,
        ]}
        {...props}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  frame: { borderWidth: RING, margin: -RING },
  field: {
    minHeight: touchTarget,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    // Same size as the web's fields on touch screens.
    fontSize: 16,
    // The ring above is the focus indicator; this drops the browser's own when run on the web.
    outlineWidth: 0,
  },
  disabled: { opacity: 0.5 },
})

export { Input, type InputProps }
