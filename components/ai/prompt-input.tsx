"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
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
  submit: () => void
  openFilePicker: () => void
}

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
  accept?: string
}

function PromptInput({
  value: controlledValue,
  onValueChange,
  onSubmit,
  status = "ready",
  accept,
  className,
  children,
  ...props
}: PromptInputProps) {
  const [uncontrolled, setUncontrolled] = React.useState("")
  const [files, setFiles] = React.useState<File[]>([])
  const [dragging, setDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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
    submit,
    openFilePicker: () => fileInputRef.current?.click(),
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
  const { value, setValue, submit, addFiles } = usePromptInput()
  return (
    <textarea
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
        onKeyDown?.(e)
        if (e.defaultPrevented) return
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
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
  return <div data-slot="prompt-input-tools" className={cn("flex items-center gap-1", className)} {...props} />
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

export {
  PromptInput,
  PromptInputTextarea,
  PromptInputAttachments,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputAttachButton,
  PromptInputSubmit,
  usePromptInput,
  type ChatStatus,
}
