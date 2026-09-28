"use client"

import { Form as FormPrimitive } from "@base-ui/react/form"
import { cn } from "cn"

/**
 * A form with consistent spacing that works with <Field> parts. Built on Base UI Form:
 * native constraint validation (required, type, min…) and the first invalid control
 * is focused on submit. Pass `errors` (by field name) to show server-side errors.
 */
function Form({ className, ...props }: FormPrimitive.Props) {
  return <FormPrimitive data-slot="form" className={cn("flex w-full flex-col gap-6", className)} {...props} />
}

export { Form }
