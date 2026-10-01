import { site } from "./site.ts"
import { themeQuery, type ThemeChoice } from "./theme.ts"

/**
 * The native token formats served at /tokens/{format}. Kept apart from lib/tokens.ts so the
 * docs UI can link to them without bundling the registry.
 */
export const tokenFormats = ["json", "swift", "kotlin", "react-native"] as const
export type TokenFormat = (typeof tokenFormats)[number]

export const tokenFiles: Record<TokenFormat, { file: string; label: string; contentType: string }> = {
  json: { file: "tokens.json", label: "Design tokens (DTCG JSON)", contentType: "application/json" },
  swift: { file: "JDSTokens.swift", label: "SwiftUI", contentType: "text/x-swift" },
  kotlin: { file: "JdsTokens.kt", label: "Jetpack Compose", contentType: "text/x-kotlin" },
  "react-native": { file: "tokens.ts", label: "React Native", contentType: "text/typescript" },
}

export const tokensUrl = (theme: ThemeChoice, format: TokenFormat) => {
  const query = themeQuery(theme)
  return `${site.url}/tokens/${format}${query ? `?${query}` : ""}`
}
