"use client"

import * as React from "react"
import Link from "next/link"

import { Message, MessageContent } from "@/components/ai/message"
import {
  PromptInput,
  PromptInputFrame,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from "@/components/ai/prompt-input"
import { useSiteSettings } from "@/components/docs/site-settings"
import { useThemeState, type DomSetting } from "@/components/docs/theme-state"
import { AmbientBackground, type AmbientBackgroundVariant } from "@/components/effects/ambient-background"
import { ControlGroup } from "@/components/studio/controls"
import { ThemeScope } from "@/components/studio/theme-scope"
import { Button, buttonVariants } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { VoiceOrb, type VoiceOrbVariant } from "@/components/voice/voice-orb"
import { deal, words, type Direction, type Word } from "@/lib/directions"
import { ArrowRightIcon, CheckIcon, ShuffleIcon } from "@/lib/icons"

const MAX_WORDS = 3

const themeKeys = ["color", "base", "radius", "font", "surface", "background"] as const satisfies readonly DomSetting[]

/** A small app in the direction's theme: the orb, one exchange and the composer, over its background. */
function DirectionPreview({ direction }: { direction: Direction }) {
  const { theme } = direction
  return (
    <ThemeScope
      theme={theme}
      data-surface={theme.surface === "flat" ? undefined : theme.surface}
      className="relative isolate flex h-80 flex-col gap-3 overflow-hidden rounded-xl border p-4"
    >
      {theme.background !== "none" && (
        <AmbientBackground
          variant={theme.background as AmbientBackgroundVariant}
          intensity={0.5}
          grain={0.15}
          className="-z-10"
        />
      )}
      <div className="flex items-center gap-2">
        <VoiceOrb variant={theme.orb as VoiceOrbVariant} state="listening" size={28} />
        <span className="text-sm font-medium">Assistant</span>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-3">
        <Message from="user">
          <MessageContent>What changed since yesterday?</MessageContent>
        </Message>
        <Message from="assistant">
          <MessageContent>Three tickets closed and one deploy is waiting for your review.</MessageContent>
        </Message>
      </div>
      <PromptInputFrame>
        <PromptInput onSubmit={() => {}}>
          <PromptInputTextarea placeholder="Ask anything" />
          <PromptInputToolbar>
            <PromptInputSubmit className="ml-auto" />
          </PromptInputToolbar>
        </PromptInput>
      </PromptInputFrame>
    </ThemeScope>
  )
}

function DirectionCard({ direction, inUse, onUse }: { direction: Direction; inUse: boolean; onUse: () => void }) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      {/* The preview shows the look; the button below is how you pick it. */}
      <div inert>
        <DirectionPreview direction={direction} />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-medium">{direction.name}</h2>
        <p className="text-sm text-muted-foreground">{direction.rationale}</p>
      </div>
      {inUse ? (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled>
            <CheckIcon data-icon="inline-start" />
            In use
          </Button>
          <Link href="/studio/experience" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Build an experience
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="self-start" onClick={onUse}>
          Use this
        </Button>
      )}
    </div>
  )
}

export function DirectorBuilder() {
  const [brief, setBrief] = React.useState<Word[]>([])
  const [seed, setSeed] = React.useState(0)
  const theme = useThemeState()
  const { orb, setOrb } = useSiteSettings()
  const dealt = deal(brief, seed)

  const use = (d: Direction) => {
    for (const key of themeKeys) theme.set(key, d.theme[key])
    setOrb(d.theme.orb as VoiceOrbVariant)
  }
  const inUse = (d: Direction) => themeKeys.every((k) => theme.values[k] === d.theme[k]) && orb === d.theme.orb

  return (
    <div className="grid min-h-0 flex-1 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="flex flex-col gap-5 overflow-y-auto border-b p-5 lg:h-[calc(100svh-3.5rem-1px)] lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold">Creative director</h1>
          <Button variant="ghost" size="xs" disabled={!brief.length} onClick={() => setBrief([])}>
            Reset
          </Button>
        </div>
        <ControlGroup title={`How should it feel? Up to ${MAX_WORDS}`}>
          <ToggleGroup
            multiple
            value={brief}
            onValueChange={(v) => {
              setBrief((v as Word[]).slice(0, MAX_WORDS))
              setSeed(0)
            }}
            variant="outline"
            size="sm"
            className="flex-wrap"
            aria-label="Brief"
          >
            {words.map((w) => (
              <ToggleGroupItem
                key={w}
                value={w}
                disabled={brief.length >= MAX_WORDS && !brief.includes(w)}
              >
                {w[0].toUpperCase() + w.slice(1)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </ControlGroup>
        <Button variant="outline" size="sm" className="self-start" onClick={() => setSeed((s) => s + 1)}>
          <ShuffleIcon data-icon="inline-start" />
          Shuffle
        </Button>
      </aside>

      <main className="grid content-start gap-6 p-5 md:grid-cols-3 lg:overflow-y-auto">
        {dealt.map((d) => (
          <DirectionCard key={d.name} direction={d} inUse={inUse(d)} onUse={() => use(d)} />
        ))}
      </main>
    </div>
  )
}
