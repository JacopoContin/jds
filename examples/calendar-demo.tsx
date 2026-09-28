"use client"

import * as React from "react"

import { Calendar } from "@/components/ui/calendar"

export default function CalendarDemo() {
  // A fixed date keeps the demo (and its screenshot test) stable; use new Date() in your app.
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 8, 15))
  return (
    <div className="rounded-xl border">
      <Calendar mode="single" selected={date} onSelect={setDate} defaultMonth={new Date(2026, 8, 1)} />
    </div>
  )
}
