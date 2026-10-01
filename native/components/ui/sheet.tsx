import * as React from "react"
import {
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type TextProps,
  type ViewProps,
  type ViewStyle,
} from "react-native"
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { alpha, duration, easing, radius, spring, useColors } from "@/lib/tokens"

type SheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Swipe down, tap outside or press back to close. Off for steps that must be finished. */
  dismissible?: boolean
  style?: StyleProp<ViewStyle>
  children: React.ReactNode
}

const exit = { duration: duration.base, easing: Easing.bezier(...easing.out) }

/**
 * A bottom sheet. It springs in, follows the finger when dragged down, and keeps its
 * content clear of the home indicator. Put text fields in it freely: it rises with the keyboard.
 */
function Sheet({ open, onOpenChange, dismissible = true, style, children }: SheetProps) {
  const c = useColors()
  const insets = useSafeAreaInsets()
  const { height: screen } = useWindowDimensions()
  const [mounted, setMounted] = React.useState(open)
  const height = React.useRef(screen)
  const offset = useSharedValue(screen)
  const backdrop = useSharedValue(0)

  React.useEffect(() => {
    if (open) {
      setMounted(true)
      offset.value = withSpring(0, spring.gentle)
      backdrop.value = withTiming(1, { duration: duration.base })
      return
    }
    offset.value = withTiming(height.current, exit)
    backdrop.value = withTiming(0, exit)
    // Unmount once the exit has played; the duration is fixed, so a timer is exact enough.
    const id = setTimeout(() => setMounted(false), duration.base)
    return () => clearTimeout(id)
  }, [open, offset, backdrop])

  const close = React.useCallback(() => {
    if (dismissible) onOpenChange(false)
  }, [dismissible, onOpenChange])

  const pan = React.useMemo(
    () =>
      PanResponder.create({
        // Claim clear downward drags only, so taps and horizontal scrolls inside still work.
        onMoveShouldSetPanResponder: (_, g) => dismissible && g.dy > 8 && g.dy > Math.abs(g.dx) * 1.5,
        // Once the sheet has the drag, keep it: a scroll view behind or inside mustn't take it mid-swipe.
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, g) => {
          offset.value = Math.max(0, g.dy)
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > height.current * 0.25 || g.vy > 1) close()
          else offset.value = withSpring(0, spring.snappy)
        },
        onPanResponderTerminate: () => {
          offset.value = withSpring(0, spring.snappy)
        },
      }),
    [dismissible, close, offset]
  )

  const panelStyle = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }))
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdrop.value }))

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={close}
    >
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
      </Animated.View>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.anchor} pointerEvents="box-none">
        <Animated.View
          accessibilityViewIsModal
          onLayout={(e) => {
            height.current = e.nativeEvent.layout.height
          }}
          style={[
            styles.panel,
            {
              backgroundColor: c.popover,
              borderColor: c.border,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingBottom: insets.bottom,
              maxHeight: screen - insets.top - 24,
            },
            panelStyle,
            style,
          ]}
          {...pan.panHandlers}
        >
          {dismissible && (
            <View style={styles.handleArea}>
              <View style={[styles.handle, { backgroundColor: alpha(c.mutedForeground, 0.4) }]} />
            </View>
          )}
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

function SheetHeader({ style, ...props }: ViewProps) {
  return <View style={[styles.header, style]} {...props} />
}

function SheetFooter({ style, ...props }: ViewProps) {
  return <View style={[styles.footer, style]} {...props} />
}

function SheetTitle({ style, ...props }: TextProps) {
  const c = useColors()
  return <Text accessibilityRole="header" style={[styles.title, { color: c.popoverForeground }, style]} {...props} />
}

function SheetDescription({ style, ...props }: TextProps) {
  const c = useColors()
  return <Text style={[styles.description, { color: c.mutedForeground }, style]} {...props} />
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(0, 0, 0, 0.3)" },
  anchor: { flex: 1, justifyContent: "flex-end" },
  panel: { borderTopWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  handleArea: { alignItems: "center", paddingTop: 8, paddingBottom: 4 },
  handle: { width: 96, height: 4, borderRadius: 2 },
  header: { gap: 2, padding: 16, paddingBottom: 0 },
  footer: { gap: 8, padding: 16 },
  title: { fontSize: 16, fontWeight: "500" },
  description: { fontSize: 14, lineHeight: 20 },
})

export { Sheet, SheetHeader, SheetFooter, SheetTitle, SheetDescription, type SheetProps }
