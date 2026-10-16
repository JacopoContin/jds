"use client"

import * as React from "react"

import { VOICE_PANEL_MESSAGE, VOICE_PANEL_READY, type VoicePanelConfig } from "@/components/studio/voice-panel-config"

/**
 * Drives the voice panel phone preview from outside its iframe: posts the config on every
 * change, and again when the preview says it's listening. Pass the ref to PhonePreview.
 */
export function useVoicePanelPreview(config: VoicePanelConfig) {
  const frame = React.useRef<HTMLIFrameElement>(null)
  const latest = React.useRef(config)
  const post = React.useCallback(() => {
    frame.current?.contentWindow?.postMessage(
      { type: VOICE_PANEL_MESSAGE, config: latest.current },
      window.location.origin,
    )
  }, [])
  React.useEffect(() => {
    latest.current = config
    post()
  }, [config, post])
  React.useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // Only our iframe's hello: a page can hold other previews.
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return
      if (e.data?.type === VOICE_PANEL_READY) post()
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [post])
  return frame
}
