"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function InstallTabs({ cli, manual }: { cli: React.ReactNode; manual: React.ReactNode }) {
  return (
    <Tabs defaultValue="cli" className="gap-4">
      <TabsList variant="line">
        <TabsTrigger value="cli">CLI</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
      </TabsList>
      <TabsContent value="cli">{cli}</TabsContent>
      <TabsContent value="manual" className="flex flex-col gap-6">
        {manual}
      </TabsContent>
    </Tabs>
  )
}
