import * as React from "react"
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  type Insets,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import type { LucideIcon } from "lucide-react-native"

import { alpha, radius, spring, touchTarget, useColors } from "@/lib/tokens"

type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
type ButtonSize = "default" | "sm" | "lg" | "icon" | "icon-sm"

type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  variant?: ButtonVariant
  size?: ButtonSize
  style?: StyleProp<ViewStyle>
  /** Strings become labels in the variant's color; use ButtonIcon for icons. */
  children?: React.ReactNode
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const sizes: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number; icon: number }> = {
  default: { height: touchTarget, paddingHorizontal: 14, fontSize: 14, icon: 16 },
  sm: { height: 36, paddingHorizontal: 10, fontSize: 13, icon: 14 },
  lg: { height: 48, paddingHorizontal: 16, fontSize: 15, icon: 18 },
  icon: { height: touchTarget, paddingHorizontal: 0, fontSize: 14, icon: 18 },
  "icon-sm": { height: 36, paddingHorizontal: 0, fontSize: 13, icon: 16 },
}

/** Fill, pressed fill, label color and border for each variant, matching the web button. */
function useVariantColors(variant: ButtonVariant) {
  const c = useColors()
  const dark = useColorScheme() === "dark"
  switch (variant) {
    case "outline":
      return {
        bg: dark ? alpha(c.input, 0.3) : c.background,
        pressed: dark ? alpha(c.input, 0.5) : c.muted,
        fg: c.foreground,
        border: dark ? c.input : c.border,
      }
    case "secondary":
      return { bg: c.secondary, pressed: c.accent, fg: c.secondaryForeground }
    case "ghost":
      return { bg: "transparent", pressed: dark ? alpha(c.muted, 0.5) : c.muted, fg: c.foreground }
    case "destructive":
      return {
        bg: alpha(c.destructive, dark ? 0.2 : 0.1),
        pressed: alpha(c.destructive, dark ? 0.3 : 0.2),
        fg: c.destructive,
      }
    case "link":
      return { bg: "transparent", pressed: "transparent", fg: c.primary }
    default:
      return { bg: c.primary, pressed: alpha(c.primary, 0.8), fg: c.primaryForeground }
  }
}

const ButtonContext = React.createContext<{ color: string; size: number }>({ color: "#000000", size: 16 })

/** A lucide-react-native icon in the button's label color and size. `filled` fills it too, as for stop. */
function ButtonIcon({ icon: Icon, filled }: { icon: LucideIcon; filled?: boolean }) {
  const { color, size } = React.useContext(ButtonContext)
  return <Icon color={color} size={size} strokeWidth={2} fill={filled ? color : "none"} />
}

function Button({
  variant = "default",
  size = "default",
  disabled,
  style,
  children,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const colors = useVariantColors(variant)
  const s = sizes[size]
  const [pressed, setPressed] = React.useState(false)
  const scale = useSharedValue(1)
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const square = size === "icon" || size === "icon-sm"
  // Small sizes keep their look but still get a 44pt hit area.
  const slop = Math.max(0, (touchTarget - s.height) / 2)
  const hitSlop: Insets = { top: slop, bottom: slop, left: square ? slop : 0, right: square ? slop : 0 }

  return (
    <ButtonContext.Provider value={{ color: colors.fg, size: s.icon }}>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        hitSlop={hitSlop}
        onPressIn={(e) => {
          setPressed(true)
          scale.value = withSpring(0.97, spring.snappy)
          onPressIn?.(e)
        }}
        onPressOut={(e) => {
          setPressed(false)
          scale.value = withSpring(1, spring.snappy)
          onPressOut?.(e)
        }}
        style={[
          styles.base,
          {
            height: s.height,
            minWidth: square ? s.height : undefined,
            paddingHorizontal: s.paddingHorizontal,
            borderRadius: size === "sm" || size === "icon-sm" ? radius.md : radius.lg,
            backgroundColor: pressed ? colors.pressed : colors.bg,
            borderColor: colors.border ?? "transparent",
          },
          disabled && styles.disabled,
          animated,
          style,
        ]}
        {...props}
      >
        {React.Children.map(children, (child) =>
          typeof child === "string" || typeof child === "number" ? (
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                { color: colors.fg, fontSize: s.fontSize },
                variant === "link" && pressed && styles.underline,
              ]}
            >
              {child}
            </Text>
          ) : (
            child
          )
        )}
      </AnimatedPressable>
    </ButtonContext.Provider>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  label: { fontWeight: "500" },
  underline: { textDecorationLine: "underline" },
  disabled: { opacity: 0.5 },
})

export { Button, ButtonIcon, type ButtonProps, type ButtonVariant, type ButtonSize }
