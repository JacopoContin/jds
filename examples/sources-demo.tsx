import { Citation, Sources, type Source } from "@/components/ai/sources"

const sources: Source[] = [
  {
    url: "https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia",
    title: "MediaDevices: getUserMedia() method",
    snippet: "Prompts the user for permission to use a media input which produces a MediaStream.",
  },
  {
    url: "https://www.w3.org/WAI/WCAG22/Understanding/",
    title: "Understanding WCAG 2.2",
    snippet: "Explains the intent of each success criterion and how to meet it.",
  },
]

export default function SourcesDemo() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-4 text-sm leading-relaxed">
      <p>
        Browsers only grant microphone access after a user gesture
        <Citation index={1} source={sources[0]} />, and live captions should be available for any audio content{" "}
        <Citation index={2} source={sources[1]} />.
      </p>
      <Sources sources={sources} />
    </div>
  )
}
