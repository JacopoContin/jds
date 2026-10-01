/**
 * The React Native components, published as the @jds-native registry. Sources live in
 * native/ and install into an app at the same paths without the native/ prefix.
 */
/**
 * Native modules the components use. Their versions must match the app's React Native, so
 * the app installs them (`npx expo install` on Expo) instead of the registry pinning them.
 */
export const nativeModules = ["react-native-reanimated", "react-native-safe-area-context", "react-native-svg"]

export type NativeItem = {
  slug: string
  title: string
  description: string
  files: string[]
}

export const nativeItems: NativeItem[] = [
  {
    slug: "tokens",
    title: "Tokens",
    description:
      "Colors for light and dark, radii, spacing, durations, easing and springs. Replace it with a themed file from /tokens/react-native to restyle every component.",
    files: ["native/lib/tokens.ts"],
  },
  {
    slug: "button",
    title: "Button",
    description: "Pressable with the web's variants and sizes, 44pt touch targets and a snappy press spring.",
    files: ["native/components/ui/button.tsx"],
  },
  {
    slug: "input",
    title: "Input",
    description: "Text field at 16pt with a focus ring and an invalid state.",
    files: ["native/components/ui/input.tsx"],
  },
  {
    slug: "sheet",
    title: "Sheet",
    description: "Bottom sheet that springs in, swipes down to dismiss and keeps clear of the home indicator.",
    files: ["native/components/ui/sheet.tsx"],
  },
  {
    slug: "prompt-input",
    title: "Prompt Input",
    description: "The chat composer: a growing text field, a toolbar for tools, and a send button that becomes stop while the agent works.",
    files: ["native/components/ai/prompt-input.tsx"],
  },
]
