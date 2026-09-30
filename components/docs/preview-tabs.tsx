"use client"

import * as React from "react"
import { cn } from "cn"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/docs/copy-button"
import { Example } from "@/components/docs/example"
import { site } from "@/lib/site"

export function PreviewTabs({
  name,
  code,
  html,
  align = "center",
  className,
  install,
}: {
  name: string
  code: string
  html: string
  align?: "center" | "start"
  className?: string
  /**
   * Registry item the snippet uses. The snippet only calls the component, so the tab reads
   * "Usage" and says to install it first; without it the tab shows source and reads "Code".
   */
  install?: string
}) {
  return (
    <Tabs data-md-skip defaultValue="preview" className={cn("gap-3", className)}>
      <TabsList variant="line">
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">{install ? "Usage" : "Code"}</TabsTrigger>
      </TabsList>
      <TabsContent
        value="preview"
        className={cn(
          "flex min-h-72 w-full justify-center rounded-xl border bg-card p-6 md:p-10",
          align === "center" ? "items-center" : "items-start"
        )}
      >
        <Example name={name} />
      </TabsContent>
      <TabsContent value="code" className="relative overflow-hidden rounded-xl border bg-card">
        {install && (
          <div className="border-b px-4 py-2.5 text-xs text-muted-foreground">
            Install first:{" "}
            <code className="font-mono text-foreground">
              npx shadcn@latest add {site.namespace}/{install}
            </code>
            . This snippet only uses the component; the install copies its source into your project.
          </div>
        )}
        <CopyButton value={code} className={cn("absolute right-2 z-10", install ? "top-12" : "top-2")} />
        <div className="docs-code max-h-112 overflow-auto text-[13px]" dangerouslySetInnerHTML={{ __html: html }} />
      </TabsContent>
    </Tabs>
  )
}
