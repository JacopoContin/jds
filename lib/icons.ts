/**
 * Semantic icon map. Components import from here, never from lucide-react
 * directly, so the underlying set can be swapped without touching consumers.
 */
export {
  ArrowUp as SendIcon,
  Square as StopIcon,
  Paperclip as AttachIcon,
  X as CloseIcon,
  Copy as CopyIcon,
  Check as CheckIcon,
  RefreshCw as RegenerateIcon,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon,
  ChevronDown as ChevronDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Sparkles as SparkleIcon,
  Brain as ReasoningIcon,
  Wrench as ToolIcon,
  CircleCheck as SuccessIcon,
  CircleX as ErrorIcon,
  CircleDashed as PendingIcon,
  Loader2 as SpinnerIcon,
  Link as SourceIcon,
  FileText as FileIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  AudioLines as VoiceIcon,
  ShieldAlert as ApprovalIcon,
  ArrowDown as ScrollDownIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  Terminal as TerminalIcon,
  Menu as MenuIcon,
} from "lucide-react"

export type { LucideIcon as IconComponent } from "lucide-react"
