"use client"

import * as React from "react"
import { cn } from "cn"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CopyButton } from "@/components/docs/copy-button"
import { Example } from "@/components/docs/example"

export function PreviewTabs({
  name,
  code,
  html,
  align = "center",
  className,
}: {
  name: string
  code: string
  html: string
  align?: "center" | "start"
  className?: string
}) {
  return (
    <Tabs data-md-skip defaultValue="preview" className={cn("gap-3", className)}>
      <TabsList variant="line">
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
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
        <CopyButton value={code} className="absolute top-2 right-2 z-10" />
        <div className="docs-code max-h-112 overflow-auto text-[13px]" dangerouslySetInnerHTML={{ __html: html }} />
      </TabsContent>
    </Tabs>
  )
}
