"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { rise, stagger } from "@/lib/motion"

function Suggestions({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <motion.div
      data-slot="suggestions"
      variants={stagger(0.05)}
      initial="hidden"
      animate="visible"
      className={cn("flex flex-wrap gap-2", className)}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </motion.div>
  )
}

function Suggestion({
  suggestion,
  onSelect,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "onSelect"> & {
  suggestion: string
  onSelect?: (suggestion: string) => void
}) {
  return (
    <motion.div variants={rise}>
      <Button
        variant="outline"
        size="sm"
        className={cn("rounded-full font-normal text-muted-foreground hover:text-foreground", className)}
        onClick={() => onSelect?.(suggestion)}
        {...props}
      >
        {children ?? suggestion}
      </Button>
    </motion.div>
  )
}

export { Suggestions, Suggestion }
