"use client"

import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field"
import { cn } from "cn"

import { AddIcon, MinusIcon } from "@/lib/icons"

function NumberField({ className, ...props }: NumberFieldPrimitive.Root.Props) {
  return (
    <NumberFieldPrimitive.Root
      data-slot="number-field"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

/** Input with − and + steppers. Drag the label (see NumberFieldScrubArea) or use arrow keys to change the value. */
function NumberFieldGroup({ className, ...props }: NumberFieldPrimitive.Group.Props) {
  return (
    <NumberFieldPrimitive.Group
      data-slot="number-field-group"
      className={cn(
        "flex h-8 w-full items-center overflow-hidden pointer-coarse:h-11 rounded-lg border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 data-disabled:opacity-50 dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

function NumberFieldInput({ className, ...props }: NumberFieldPrimitive.Input.Props) {
  return (
    <NumberFieldPrimitive.Input
      data-slot="number-field-input"
      className={cn(
        "h-full min-w-0 flex-1 bg-transparent px-2 text-center text-sm tabular-nums pointer-coarse:text-base outline-none",
        className
      )}
      {...props}
    />
  )
}

const stepper =
  "grid h-full w-8 shrink-0 place-items-center pointer-coarse:w-11 text-muted-foreground transition-colors outline-none select-none hover:bg-accent hover:text-foreground data-disabled:pointer-events-none data-disabled:opacity-40 [&_svg]:size-3.5"

function NumberFieldDecrement({ className, ...props }: NumberFieldPrimitive.Decrement.Props) {
  return (
    <NumberFieldPrimitive.Decrement
      data-slot="number-field-decrement"
      aria-label="Decrease"
      className={cn(stepper, "border-r", className)}
      {...props}
    >
      <MinusIcon />
    </NumberFieldPrimitive.Decrement>
  )
}

function NumberFieldIncrement({ className, ...props }: NumberFieldPrimitive.Increment.Props) {
  return (
    <NumberFieldPrimitive.Increment
      data-slot="number-field-increment"
      aria-label="Increase"
      className={cn(stepper, "border-l", className)}
      {...props}
    >
      <AddIcon />
    </NumberFieldPrimitive.Increment>
  )
}

/** Wrap a label in this so dragging it horizontally changes the value. */
function NumberFieldScrubArea({ className, ...props }: NumberFieldPrimitive.ScrubArea.Props) {
  return (
    <NumberFieldPrimitive.ScrubArea
      data-slot="number-field-scrub-area"
      className={cn("cursor-ew-resize text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

export {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldScrubArea,
}
