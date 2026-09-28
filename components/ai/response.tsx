"use client"

import * as React from "react"
import { code } from "@streamdown/code"
import { cn } from "cn"
import { Streamdown, type StreamdownProps } from "streamdown"
import "streamdown/styles.css"

/**
 * Streaming-safe markdown. Handles unterminated fences, emphasis and links
 * mid-stream, with Shiki highlighting and copy buttons on code blocks.
 */
const Response = React.memo(function Response({
  className,
  isAnimating,
  ...props
}: StreamdownProps) {
  return (
    <Streamdown
      data-slot="response"
      mode={isAnimating ? "streaming" : "static"}
      isAnimating={isAnimating}
      animated={isAnimating}
      plugins={{ code }}
      shikiTheme={["github-light", "vitesse-dark"]}
      className={cn("size-full text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0", className)}
      {...props}
    />
  )
})

export { Response }
