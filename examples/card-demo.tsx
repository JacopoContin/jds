import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Support agent</CardTitle>
        <CardDescription>Handles refunds and order questions.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Resolved 1,284 conversations this week.</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">
          Open
        </Button>
      </CardFooter>
    </Card>
  )
}
