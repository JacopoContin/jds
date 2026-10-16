"use client"

import * as React from "react"

/**
 * A row the agent writes into your table: its title first, then each value in turn, e.g. an
 * order's quantity and then the email to its supplier.
 */
type TakeoverRow = { id: string; title: string; values: string[] }

type TakeoverState = "idle" | "working" | "paused" | "done"

/** The cell the agent is writing right now: the row's title (field -1) or one of its values. */
type TakeoverFocus = { index: number; field: number }

/**
 * Everything <AgentTakeover> and the inline signals read while an agent works on your UI.
 * Implement it on top of your agent's actions; `useSimulatedTakeover` scripts one so the UI
 * runs first. The agent commits one step at a time, so taking back never leaves a half edit.
 */
type TakeoverSession = {
  state: TakeoverState
  rows: TakeoverRow[]
  /** Committed steps: one per row, then one per value of each row. */
  step: number
  /** What the agent is doing, e.g. "Emailing supplier". */
  status: string
  /** What it's doing it to, e.g. the row's title. */
  detail?: string
  /** Bumps once when the agent finishes, to flash the frame. */
  finished: number
  start: () => void
  /** Stop after the current step and hand the page back. */
  takeBack: () => void
  resume: () => void
  /** Back to before the agent started. */
  reset: () => void
}

/**
 * Where the agent is after `step` steps over `count` rows of `fields` values each: first it
 * writes every row, then goes back down the table filling each row's values in order.
 */
function takeoverProgress(step: number, count: number, fields: number) {
  const total = count * (1 + fields)
  const cursor = Math.max(0, Math.min(step, total))
  const fieldStep = cursor - count
  const focus: TakeoverFocus | null =
    cursor === total
      ? null
      : cursor < count
        ? { index: cursor, field: -1 }
        : { index: Math.floor(fieldStep / fields), field: fieldStep % fields }
  return {
    /** Rows written, plus the one being written. */
    rows: Math.min(count, cursor + 1),
    focus,
    complete: cursor === total,
    /** Whether a row's value is in yet. */
    written: (index: number, field: number) => cursor >= count + index * fields + field + 1,
  }
}

/** What the agent says it's doing: one label for writing a row, one per value. */
type TakeoverScript = { rows: TakeoverRow[]; row: string; fields: string[] }

/** A sample job: restock a café's low items and email each supplier. Replace the hook with your own. */
const sample: TakeoverScript = {
  row: "Adding order",
  fields: ["Working out quantity", "Emailing supplier"],
  rows: [
    { id: "oat-milk", title: "Oat milk, 1L", values: ["24 cases", "Emailed"] },
    { id: "espresso", title: "Espresso beans, 1kg", values: ["12 bags", "Emailed"] },
    { id: "cups", title: "Paper cups, 12oz", values: ["2,000", "Emailed"] },
    { id: "croissants", title: "Frozen croissants", values: ["160", "Emailed"] },
    { id: "vanilla", title: "Vanilla syrup", values: ["8 bottles", "Emailed"] },
  ],
}

/** How long each kind of step takes. Slow enough to follow: you should be able to read each value as it lands. */
const ROW_MS = 2200
const FIELD_MS = 1600

/** A scripted agent that works through `script`, for demos and for building the UI first. */
function useSimulatedTakeover(script: TakeoverScript = sample): TakeoverSession {
  const [state, setState] = React.useState<TakeoverState>("idle")
  const [step, setStep] = React.useState(0)
  const [finished, setFinished] = React.useState(0)
  const { rows, fields } = script
  const total = rows.length * (1 + fields.length)
  const { focus } = takeoverProgress(step, rows.length, fields.length)
  // A number, so a re-render from elsewhere doesn't restart the step's timer.
  const field = focus?.field

  // One step at a time. Taking back stops the timer, so the next step only runs on resume.
  React.useEffect(() => {
    if (state !== "working" || field === undefined) return
    const id = setTimeout(
      () => {
        const next = step + 1
        setStep(next)
        if (next >= total) {
          setState("done")
          setFinished((f) => f + 1)
        }
      },
      field < 0 ? ROW_MS : FIELD_MS,
    )
    return () => clearTimeout(id)
  }, [state, step, field, total])

  return {
    state,
    rows,
    step,
    status: focus ? (focus.field < 0 ? script.row : fields[focus.field]) : "Done",
    detail: focus ? rows[focus.index].title : undefined,
    finished,
    start: () => {
      setStep(0)
      setState("working")
    },
    takeBack: () => setState((s) => (s === "working" ? "paused" : s)),
    resume: () => setState((s) => (s === "paused" ? "working" : s)),
    reset: () => {
      setStep(0)
      setState("idle")
    },
  }
}

export {
  takeoverProgress,
  useSimulatedTakeover,
  type TakeoverFocus,
  type TakeoverRow,
  type TakeoverScript,
  type TakeoverSession,
  type TakeoverState,
}
