import { Meter, MeterLabel, MeterValue } from "@/components/ui/meter"

export default function MeterDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Meter value={62}>
        <MeterLabel>Monthly credits</MeterLabel>
        <MeterValue />
      </Meter>
      <Meter value={18_400} max={25_000} format={{ notation: "compact" }}>
        <MeterLabel>Knowledge base</MeterLabel>
        <MeterValue>{(formatted) => `${formatted} of 25K chunks`}</MeterValue>
      </Meter>
    </div>
  )
}
