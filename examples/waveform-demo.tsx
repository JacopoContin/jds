"use client"

import { Button } from "@/components/ui/button"
import { Waveform } from "@/components/voice/waveform"
import { useAudioLevel } from "@/hooks/use-audio-level"
import { useSimulatedSpectrum } from "@/hooks/use-simulated-spectrum"
import { MicIcon, MicOffIcon } from "@/lib/icons"

export default function WaveformDemo() {
  const mic = useAudioLevel({ bands: 32 })
  const simulated = useSimulatedSpectrum(!mic.active, 32)

  return (
    <div className="flex flex-col items-center gap-6">
      <Waveform spectrum={mic.active ? mic.spectrum : simulated.spectrum} className="w-64" />
      <Button variant="outline" size="sm" onClick={mic.active ? mic.stop : mic.start}>
        {mic.active ? <MicOffIcon /> : <MicIcon />}
        {mic.active ? "Stop microphone" : "Use microphone"}
      </Button>
      {mic.error && <p className="text-xs text-destructive">{mic.error.message}</p>}
    </div>
  )
}
