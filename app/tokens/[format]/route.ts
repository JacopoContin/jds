import { parseTheme } from "@/lib/theme"
import { tokenFiles, tokenFormats, type TokenFormat } from "@/lib/token-formats"
import { buildTokens, formatTokens } from "@/lib/tokens"

/**
 * JDS tokens for native apps, for the theme in the query params (same ones as /r/theme):
 * /tokens/json, /tokens/swift, /tokens/kotlin or /tokens/react-native?color=blue&radius=0.5
 */
export async function GET(request: Request, { params }: RouteContext<"/tokens/[format]">) {
  const { format } = await params
  if (!tokenFormats.includes(format as TokenFormat)) return new Response("Not found", { status: 404 })
  const tokens = buildTokens(parseTheme(new URL(request.url).searchParams))
  const { file, contentType } = tokenFiles[format as TokenFormat]
  return new Response(formatTokens(tokens, format as TokenFormat), {
    headers: {
      "Content-Type": `${contentType}; charset=utf-8`,
      "Content-Disposition": `inline; filename="${file}"`,
      "Cache-Control": "public, max-age=3600",
    },
  })
}
