"use client"

import * as React from "react"

import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"

export default function ProgressDemo() {
  const [value, setValue] = React.useState(12)
  React.useEffect(() => {
    const id = setInterval(() => setValue((v) => (v >= 100 ? 8 : Math.min(100, v + 9))), 700)
    return () => clearInterval(id)
  }, [])
  return (
    <Progress value={value} className="w-full max-w-sm">
      <ProgressLabel>Indexing documents</ProgressLabel>
      <ProgressValue />
    </Progress>
  )
}
