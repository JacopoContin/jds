"use client"

import * as React from "react"
import { Toggle } from "@base-ui/react/toggle"
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { AttachIcon, CloseIcon, FileIcon, SendIcon, SpinnerIcon, StopIcon } from "@/lib/icons"
import { spring } from "@/lib/motion"

/** Mirrors the AI SDK `useChat` status so it can be passed straight through. */
type ChatStatus = "ready" | "submitted" | "streaming" | "error"

type PromptInputContextValue = {
  value: string
  setValue: (value: string) => void
  files: File[]
  addFiles: (files: FileList | File[]) => void
  removeFile: (index: number) => void
  status: ChatStatus
  submitOn: SubmitKey
  submit: () => void
  openFilePicker: () => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  /**
   * Lets add-ons (like mentions) claim keys before the composer handles them.
   * Return true from the handler to consume the key. Returns an unregister function.
   */
  registerKeyHandler: (handler: KeyHandler) => () => void
  /** Internal: read by the textarea. */
  keyHandlers: React.RefObject<Set<KeyHandler>>
}

type KeyHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => boolean

/** "enter" sends on Enter (Shift+Enter for a new line); "mod-enter" sends on ⌘/Ctrl+Enter, so Enter adds lines. */
type SubmitKey = "enter" | "mod-enter"

const PromptInputContext = React.createContext<PromptInputContextValue | null>(null)

function usePromptInput() {
  const ctx = React.useContext(PromptInputContext)
  if (!ctx) throw new Error("PromptInput parts must be used inside <PromptInput>")
  return ctx
}

type PromptInputProps = Omit<React.ComponentProps<"form">, "onSubmit"> & {
  value?: string
  onValueChange?: (value: string) => void
  onSubmit: (message: { text: string; files: File[] }) => void
  status?: ChatStatus
  submitOn?: SubmitKey
  accept?: string
}

function PromptInput({
  value: controlledValue,
  onValueChange,
  onSubmit,
  status = "ready",
  submitOn = "enter",
  accept,
  className,
  children,
  ...props
}: PromptInputProps) {
  const [uncontrolled, setUncontrolled] = React.useState("")
  const [files, setFiles] = React.useState<File[]>([])
  const [dragging, setDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const keyHandlers = React.useRef(new Set<KeyHandler>())
  const registerKeyHandler = React.useCallback((handler: KeyHandler) => {
    keyHandlers.current.add(handler)
    return () => {
      keyHandlers.current.delete(handler)
    }
  }, [])

  const value = controlledValue ?? uncontrolled
  const setValue = React.useCallback(
    (next: string) => {
      if (controlledValue === undefined) setUncontrolled(next)
      onValueChange?.(next)
    },
    [controlledValue, onValueChange]
  )

  const addFiles = React.useCallback((list: FileList | File[]) => {
    setFiles((prev) => [...prev, ...Array.from(list)])
  }, [])
  const removeFile = React.useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const submit = React.useCallback(() => {
    const text = value.trim()
    if (!text && files.length === 0) return
    if (status === "submitted" || status === "streaming") return
    onSubmit({ text, files })
    setValue("")
    setFiles([])
  }, [value, files, status, onSubmit, setValue])

  const ctx: PromptInputContextValue = {
    value,
    setValue,
    files,
    addFiles,
    removeFile,
    status,
    submitOn,
    submit,
    openFilePicker: () => fileInputRef.current?.click(),
    textareaRef,
    registerKeyHandler,
    keyHandlers,
  }

  return (
    <PromptInputContext.Provider value={ctx}>
      <form
        data-slot="prompt-input"
        data-dragging={dragging || undefined}
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes("Files")) return
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
        }}
        className={cn(
          "relative flex w-full flex-col rounded-2xl border border-input bg-card shadow-xs transition-[border-color,box-shadow] duration-200",
          "focus-within:border-ring/60 focus-within:ring-4 focus-within:ring-ring/10",
          "data-dragging:border-ring data-dragging:ring-4 data-dragging:ring-ring/20",
          className
        )}
        {...props}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          hidden
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.target.value = ""
          }}
        />
        {children}
      </form>
    </PromptInputContext.Provider>
  )
}

function PromptInputTextarea({
  className,
  onKeyDown,
  placeholder = "Ask anything…",
  ...props
}: React.ComponentProps<"textarea">) {
  const { value, setValue, submit, submitOn, addFiles, textareaRef, keyHandlers } = usePromptInput()
  return (
    <textarea
      ref={textareaRef}
      data-slot="prompt-input-textarea"
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => setValue(e.target.value)}
      onPaste={(e) => {
        if (e.clipboardData.files.length) {
          e.preventDefault()
          addFiles(e.clipboardData.files)
        }
      }}
      onKeyDown={(e) => {
        for (const handler of keyHandlers.current) {
          if (handler(e)) {
            e.preventDefault()
            return
          }
        }
        onKeyDown?.(e)
        if (e.defaultPrevented) return
        if (e.key !== "Enter" || e.nativeEvent.isComposing) return
        const send = submitOn === "mod-enter" ? e.metaKey || e.ctrlKey : !e.shiftKey
        if (send) {
          e.preventDefault()
          submit()
        }
      }}
      className={cn(
        "field-sizing-content max-h-60 min-h-12 w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-sm outline-none placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function PromptInputAttachments({ className, ...props }: React.ComponentProps<"div">) {
  const { files, removeFile } = usePromptInput()
  if (files.length === 0) return null
  return (
    <div data-slot="prompt-input-attachments" className={cn("flex flex-wrap gap-2 px-3 pt-3", className)} {...props}>
      <AnimatePresence initial={false}>
        {files.map((file, i) => (
          <motion.div
            key={`${file.name}-${i}`}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={spring.snappy}
            className="group/file flex h-8 items-center gap-1.5 rounded-lg border bg-muted/50 pr-1 pl-2 text-xs"
          >
            <FileIcon className="size-3.5 text-muted-foreground" />
            <span className="max-w-40 truncate">{file.name}</span>
            <button
              type="button"
              aria-label={`Remove ${file.name}`}
              onClick={() => removeFile(i)}
              className="grid size-5 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <CloseIcon className="size-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function PromptInputToolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="prompt-input-toolbar"
      className={cn("flex items-center justify-between gap-2 p-2", className)}
      {...props}
    />
  )
}

function PromptInputTools({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="prompt-input-tools" className={cn("flex min-w-0 items-center gap-1", className)} {...props} />
}

function PromptInputAttachButton(props: React.ComponentProps<typeof Button>) {
  const { openFilePicker } = usePromptInput()
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label="Attach files"
      className="text-muted-foreground"
      onClick={openFilePicker}
      {...props}
    >
      <AttachIcon />
    </Button>
  )
}

function PromptInputSubmit({
  onStop,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { onStop?: () => void }) {
  const { status, value, files } = usePromptInput()
  const busy = status === "submitted" || status === "streaming"
  const empty = !value.trim() && files.length === 0
  const icon =
    status === "submitted" ? (
      <SpinnerIcon className="animate-spin" />
    ) : status === "streaming" ? (
      <StopIcon className="fill-current" />
    ) : (
      <SendIcon />
    )

  return (
    <Button
      type={busy ? "button" : "submit"}
      size="icon-sm"
      aria-label={busy ? "Stop generating" : "Send message"}
      disabled={!busy && empty}
      onClick={busy ? onStop : undefined}
      className={cn("rounded-full", className)}
      {...props}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.6, rotate: 30 }}
          transition={spring.snappy}
          className="grid place-items-center"
        >
          {icon}
        </motion.span>
      </AnimatePresence>
    </Button>
  )
}

/**
 * Optional outer layer. Wrap <PromptInput> to add a context line on top
 * (<PromptInputHeader>), options below (<PromptInputFooter>), or both.
 * Header and footer animate in and out when conditionally rendered.
 */
function PromptInputFrame({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="prompt-input-frame"
      className={cn(
        "flex w-full flex-col rounded-3xl border border-transparent transition-[padding,background-color,border-color] duration-200",
        // The tray only appears when there's a header or footer to hold.
        "has-data-[slot=prompt-input-footer]:border-border has-data-[slot=prompt-input-footer]:bg-muted/70 has-data-[slot=prompt-input-footer]:p-1",
        "has-data-[slot=prompt-input-header]:border-border has-data-[slot=prompt-input-header]:bg-muted/70 has-data-[slot=prompt-input-header]:p-1",
        "has-data-[slot=prompt-input-footer]:[&_[data-slot=prompt-input]]:shadow-none has-data-[slot=prompt-input-header]:[&_[data-slot=prompt-input]]:shadow-none",
        className
      )}
      {...props}
    >
      <AnimatePresence initial={false}>{React.Children.toArray(children)}</AnimatePresence>
    </div>
  )
}

type SlotProps = Omit<HTMLMotionProps<"div">, "children"> & { children?: React.ReactNode }

const collapse = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: spring.gentle,
} as const

/** Context line above the input, for guidance, the current scope, or attached context. */
function PromptInputHeader({
  icon,
  className,
  children,
  ...props
}: SlotProps & { icon?: React.ReactNode }) {
  return (
    <motion.div data-slot="prompt-input-header" className="overflow-hidden" {...collapse} {...props}>
      <div
        className={cn(
          "flex items-center gap-2 px-3 pt-1.5 pb-2.5 text-sm text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0",
          className
        )}
      >
        {icon}
        {children}
      </div>
    </motion.div>
  )
}

/** Options row below the input: toggles, modes, scopes. */
function PromptInputFooter({ className, children, ...props }: SlotProps) {
  return (
    <motion.div data-slot="prompt-input-footer" className="overflow-hidden" {...collapse} {...props}>
      <div className={cn("flex flex-wrap items-center gap-1.5 px-1.5 pt-1.5 pb-0.5", className)}>{children}</div>
    </motion.div>
  )
}

/** A pressable option chip for the footer, e.g. web search or deep research. */
function PromptInputOption({ icon, className, children, ...props }: Toggle.Props & { icon?: React.ReactNode }) {
  return (
    <Toggle
      data-slot="prompt-input-option"
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border border-transparent px-2.5 text-xs text-muted-foreground transition-colors outline-none select-none",
        "hover:bg-background/60 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        "data-pressed:border-border data-pressed:bg-background data-pressed:text-foreground data-pressed:shadow-xs",
        "[&_svg]:size-3.5 [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </Toggle>
  )
}

export {
  PromptInput,
  PromptInputTextarea,
  PromptInputAttachments,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputAttachButton,
  PromptInputSubmit,
  PromptInputFrame,
  PromptInputHeader,
  PromptInputFooter,
  PromptInputOption,
  usePromptInput,
  type ChatStatus,
  type SubmitKey,
}
