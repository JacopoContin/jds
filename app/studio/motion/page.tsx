import type { Metadata } from "next"

import { MotionBuilder } from "@/components/studio/motion-builder"

export const metadata: Metadata = {
  title: "Motion · Studio",
  description: "Tune the springs, durations and easing every JDS component uses, feel them live, and copy lib/motion.ts.",
}

export default function MotionStudioPage() {
  return <MotionBuilder />
}
