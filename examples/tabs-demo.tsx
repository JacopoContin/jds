import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TabsDemo() {
  return (
    <Tabs defaultValue="chat" className="w-full max-w-xs">
      <TabsList>
        <TabsTrigger value="chat">Chat</TabsTrigger>
        <TabsTrigger value="voice">Voice</TabsTrigger>
        <TabsTrigger value="tools">Tools</TabsTrigger>
      </TabsList>
      <TabsContent value="chat">
        <p className="pt-3 text-muted-foreground">Text conversations.</p>
      </TabsContent>
      <TabsContent value="voice">
        <p className="pt-3 text-muted-foreground">Realtime speech.</p>
      </TabsContent>
      <TabsContent value="tools">
        <p className="pt-3 text-muted-foreground">3 tools connected.</p>
      </TabsContent>
    </Tabs>
  )
}
