import { expect, test, type Page } from "@playwright/test"

import { components } from "../lib/docs"

/**
 * Deterministic time: the clock is paused before load, then advanced by a fixed amount
 * once the page is ready, so timers and animations land in the same state every run.
 */
const FROZEN = new Date("2026-09-15T10:00:00Z")
const SETTLE_MS = 2500

async function setup(page: Page, theme: string) {
  await page.clock.install({ time: FROZEN })
  await page.clock.pauseAt(new Date(FROZEN.getTime() + 1000))
  await page.addInitScript((t) => {
    localStorage.setItem("theme", t)
    for (const k of ["jds:color", "jds:base", "jds:radius", "jds:font", "jds:orb"]) localStorage.removeItem(k)
  }, theme)
}

/**
 * Voice visuals are random by design. Hide them during capture; visibility (unlike a
 * mask rectangle) also hides glows that spill outside the element's box.
 */
const HIDE_RANDOM = "[data-slot=voice-orb], [data-slot=waveform], canvas { visibility: hidden !important; }"

/** Center the preview (clear of the sticky header), load fonts, then run the paused clock forward. */
async function settle(page: Page, preview: ReturnType<Page["locator"]>) {
  await preview.evaluate((el) => el.scrollIntoView({ block: "center" }))
  await page.evaluate(() => document.fonts.ready)
  await page.clock.runFor(SETTLE_MS)
  await page.addStyleTag({ content: HIDE_RANDOM })
}

const pages = components.filter((c) => !c.parent)

for (const doc of pages) {
  test(`component: ${doc.slug}`, async ({ page }, info) => {
    await setup(page, info.project.name)
    await page.goto(`/docs/components/${doc.slug}`)
    await page.waitForLoadState("networkidle")
    const preview = page.locator("[data-docs] [data-slot=tabs-content]").first()
    await expect(preview).toBeVisible()
    await settle(page, preview)
    await expect(preview).toHaveScreenshot(`${doc.slug}.png`)
  })
}

const particles = [
  "chat-app",
  "agent-inbox",
  "run-history",
  "agent-onboarding",
  "agent-marketplace",
  "agent-run",
  "agent-panel",
  "voice-session",
  "voice-call",
  "agent-settings",
]

for (const name of particles) {
  test(`particle: ${name}`, async ({ page }, info) => {
    await setup(page, info.project.name)
    await page.goto("/particles")
    await page.waitForLoadState("networkidle")
    const preview = page.locator(`#${name} [data-slot=tabs-content]`).first()
    await settle(page, preview)
    await expect(preview).toHaveScreenshot(`particle-${name}.png`)
  })
}
