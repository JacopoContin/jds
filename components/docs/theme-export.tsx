"use client"

import * as React from "react"

import { Command } from "@/components/docs/command"
import { CodePanel } from "@/components/studio/code-panel"
import { studioMarkdown } from "@/components/studio/markdown"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckIcon, FileIcon } from "@/lib/icons"
import { site } from "@/lib/site"
import { fontSnippet, isDefaultTheme, orbSnippet, themeUrl, type ThemeChoice } from "@/lib/theme"

const installCommand = (t: ThemeChoice) =>
  isDefaultTheme(t) ? `shadcn@latest add ${site.namespace}/style` : `shadcn@latest add "${themeUrl(t)}"`

function markdown(t: ThemeChoice) {
  const font = fontSnippet(t)
  return studioMarkdown({
    title: "JDS theme",
    intro: "The JDS look with these theme choices, applied to the whole app through CSS variables.",
    choices: [
      ["Primary color", t.color],
      ["Base color", t.base],
      ["Radius", `${t.radius}rem`],
      ["Font", t.font],
      ["Voice orb", t.orb],
    ],
    install: `npx ${installCommand(t)}`,
    placement: [
      "Run the install once. It adds the JDS style and writes the theme's variables into globals.css.",
      font
        ? "Load the font in the root layout (app/layout.tsx) with the variable --font-sans, as in the code."
        : "Nothing to load for the font: the theme uses the system font stack.",
      "Wrap the app in VoiceOrbProvider in the root layout so every orb uses the chosen style.",
    ],
    code: [font, orbSnippet(t)].filter(Boolean).join("\n\n"),
    notes: [
      "Components use token classes like bg-primary and rounded-lg, so they follow the theme with no changes.",
      "Change the theme later by running the install again with new choices, or edit the variables in globals.css.",
    ],
  })
}

/**
 * "Use this theme": the install for what's picked in the Customize panel. The docs site is
 * the preview; this is how the same look gets into someone's app.
 */
export function ThemeExport({
  theme,
  open,
  onOpenChange,
}: {
  theme: ThemeChoice
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [copied, setCopied] = React.useState(false)
  const font = fontSnippet(theme)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Use this theme in your app</DialogTitle>
          <DialogDescription>
            Primary {theme.color}, base {theme.base}, radius {theme.radius}rem, {theme.font} font, {theme.orb} orb.
            Components read these through tokens, so every one you install follows it.
          </DialogDescription>
        </DialogHeader>
        {/* min-w-0: the long install URL scrolls inside its box instead of widening the dialog. */}
        <ol className="flex min-w-0 flex-col gap-5 text-sm [&>li]:min-w-0">
          <li className="flex flex-col gap-2">
            <span className="font-medium">1. Install the theme</span>
            <Command command={installCommand(theme)} />
            <span className="text-xs text-muted-foreground">
              {isDefaultTheme(theme)
                ? "These are the default choices, so the JDS style is all you need."
                : "Adds the JDS style and writes this theme's variables into globals.css."}
            </span>
          </li>
          {font && (
            <li className="flex flex-col gap-2">
              <span className="font-medium">2. Load the font in app/layout.tsx</span>
              <CodePanel code={font} />
            </li>
          )}
          <li className="flex flex-col gap-2">
            <span className="font-medium">{font ? 3 : 2}. Set the orb for the whole app</span>
            <CodePanel code={orbSnippet(theme)} note="Tune palette, glow and material in the Voice Orb Studio." />
          </li>
        </ol>
        <Button
          variant="outline"
          className="justify-self-start"
          onClick={async () => {
            await navigator.clipboard.writeText(markdown(theme))
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
        >
          {copied ? <CheckIcon /> : <FileIcon />}
          {copied ? "Copied" : "Copy as Markdown"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
