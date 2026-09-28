"use client";

import * as React from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoiceOrb, type VoiceState } from "@/components/voice/voice-orb";
import { useSimulatedSpectrum } from "@/hooks/use-simulated-spectrum";

const states: VoiceState[] = ["idle", "listening", "thinking", "speaking"];

export default function VoiceOrbDemo() {
  const [state, setState] = React.useState<VoiceState>("idle");
  const { level } = useSimulatedSpectrum(
    state === "listening" || state === "speaking",
  );

  return (
    <div className="flex flex-col items-center gap-8">
      <VoiceOrb state={state} level={level} size={260} />
      <Tabs value={state} onValueChange={(v) => setState(v as VoiceState)}>
        <TabsList>
          {states.map((s) => (
            <TabsTrigger key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
