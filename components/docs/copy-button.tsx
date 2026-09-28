"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { CheckIcon, CopyIcon } from "@/lib/icons"

export function CopyButton({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <Button
      variant="ghost"
      size="icon-xs"
      aria-label={copied ? "Copied" : "Copy"}
      className={cn("text-muted-foreground", className)}
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={copied ? "check" : "copy"}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.12 }}
          className="grid place-items-center"
        >
          {copied ? <CheckIcon className="text-success" /> : <CopyIcon />}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}
