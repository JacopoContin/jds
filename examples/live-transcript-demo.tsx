"use client";

import * as React from "react";

import {
  LiveTranscript,
  type TranscriptSegment,
} from "@/components/voice/live-transcript";

const script: Omit<TranscriptSegment, "final">[] = [
  { id: "1", speaker: "user", text: "What's on my calendar this afternoon?" },
  {
    id: "2",
    speaker: "agent",
    text: "Two things: design review at 2 and a call with Luca at 3.",
  },
  { id: "3", speaker: "user", text: "Push the call to tomorrow." },
];

export default function LiveTranscriptDemo() {
  const [segments, setSegments] = React.useState<TranscriptSegment[]>([]);

  React.useEffect(() => {
    let line = 0;
    let word = 0;
    const id = setInterval(() => {
      if (line >= script.length) {
        line = 0;
        word = 0;
        setSegments([]);
        return;
      }
      const words = script[line].text.split(" ");
      word++;
      const current = {
        ...script[line],
        text: words.slice(0, word).join(" "),
        final: word >= words.length,
      };
      setSegments((prev) => [
        ...prev.filter((s) => s.id !== current.id),
        current,
      ]);
      if (word >= words.length) {
        line++;
        word = 0;
      }
    }, 180);
    return () => clearInterval(id);
  }, []);

  return (
    <LiveTranscript segments={segments} className="h-40 w-full max-w-md" />
  );
}
