import type { Ref } from "react"

/**
 * A /preview route in an iPhone 16 Pro case (393×852 pt screen), so fixed drawers, dvh and
 * safe areas behave as they do on the phone. The island and home indicator sit over the screen.
 */
export function PhonePreview({
  slug,
  title,
  iframeRef,
}: {
  slug: string
  title: string
  /** For pages that drive the preview, like a Studio posting its settings to the iframe. */
  iframeRef?: Ref<HTMLIFrameElement>
}) {
  return (
    <div className="phone-case mx-auto w-full max-w-104">
      <span aria-hidden className="phone-button phone-button-action" />
      <span aria-hidden className="phone-button phone-button-volume-up" />
      <span aria-hidden className="phone-button phone-button-volume-down" />
      <span aria-hidden className="phone-button phone-button-power" />
      <div className="phone-screen aspect-393/852 w-full">
        <iframe ref={iframeRef} src={`/preview/${slug}`} loading="lazy" title={title} className="size-full bg-background" />
        <span aria-hidden className="phone-island" />
        <span aria-hidden className="phone-home-indicator" />
      </div>
    </div>
  )
}
