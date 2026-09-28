"use client"

import * as React from "react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDownIcon } from "@/lib/icons"

export default function DatePickerDemo() {
  const [date, setDate] = React.useState<Date>()
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">Schedule the report</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={<Button variant="outline" className="w-56 justify-between" />}>
          {date ? format(date, "PPP") : "Pick a date"}
          <ChevronDownIcon />
        </PopoverTrigger>
        <PopoverContent className="w-auto" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
