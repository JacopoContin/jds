import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

const prompts = [
  ["Summarize", "Turn a long thread into three bullet points."],
  ["Draft", "Write a reply in your tone, ready to send."],
  ["Research", "Find sources and compare the options."],
  ["Plan", "Break a goal into steps with owners and dates."],
  ["Review", "Check a document for gaps and risky claims."],
] as const

export default function CarouselDemo() {
  return (
    <Carousel className="w-full max-w-xs">
      <CarouselContent>
        {prompts.map(([title, body]) => (
          <CarouselItem key={title}>
            <div className="flex aspect-4/3 flex-col justify-end gap-1 rounded-xl border bg-card p-5">
              <span className="text-lg font-semibold">{title}</span>
              <span className="text-sm text-muted-foreground">{body}</span>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
