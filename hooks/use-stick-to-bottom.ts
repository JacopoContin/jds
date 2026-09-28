"use client"

import * as React from "react"

/**
 * Keeps a scroll container pinned to the bottom while content grows (streaming),
 * and releases the pin as soon as the user scrolls up.
 */
export function useStickToBottom<T extends HTMLElement = HTMLDivElement>(threshold = 48) {
  const scrollRef = React.useRef<T>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const pinned = React.useRef(true)
  const [isAtBottom, setIsAtBottom] = React.useState(true)

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current
    if (!el) return
    pinned.current = true
    el.scrollTo({ top: el.scrollHeight, behavior })
  }, [])

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold
      pinned.current = atBottom
      setIsAtBottom(atBottom)
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [threshold])

  React.useEffect(() => {
    const content = contentRef.current
    if (!content) return
    const observer = new ResizeObserver(() => {
      if (pinned.current) scrollToBottom("instant")
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [scrollToBottom])

  return { scrollRef, contentRef, isAtBottom, scrollToBottom }
}
