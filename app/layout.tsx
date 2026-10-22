import type { Metadata } from "next"

import { inter, mono, sans } from "@/app/fonts"
import { settingsInitScript } from "@/components/docs/theme-state"
import { SiteBackground } from "@/components/docs/site-background"
import { SiteHeader } from "@/components/docs/site-header"
import { SiteSettingsProvider } from "@/components/docs/site-settings"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

export const metadata: Metadata = {
  title: { default: "JDS · Jaco Design System", template: "%s · JDS" },
  description: "An opinionated design system for AI agent and voice interfaces. Built on Base UI.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        {/* Blocking on purpose: restores saved color, base, radius and font before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: settingsInitScript }} />
      </head>
      <body className="isolate flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SiteSettingsProvider>
            <SiteBackground />
            <TooltipProvider>
              <SiteHeader />
              <div className="flex flex-1 flex-col">{children}</div>
            </TooltipProvider>
          </SiteSettingsProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
