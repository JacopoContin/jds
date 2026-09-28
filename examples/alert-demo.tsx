import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, WarningIcon } from "@/lib/icons"

export default function AlertDemo() {
  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Alert>
        <InfoIcon />
        <AlertTitle>Web search is on</AlertTitle>
        <AlertDescription>Answers may include results from public websites.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <WarningIcon />
        <AlertTitle>Tool connection lost</AlertTitle>
        <AlertDescription>Reconnect Linear to let the agent update issues.</AlertDescription>
      </Alert>
    </div>
  )
}
