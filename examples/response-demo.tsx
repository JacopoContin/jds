"use client";

import * as React from "react";

import { Response } from "@/components/ai/response";
import { Button } from "@/components/ui/button";
import { RegenerateIcon } from "@/lib/icons";

const MARKDOWN = `### Retry with backoff

Wrap the call and **double the delay** after each failure:

\`\`\`ts
async function retry<T>(fn: () => Promise<T>, tries = 3) {
  for (let i = 0; ; i++) {
    try {
      return await fn()
    } catch (e) {
      if (i >= tries - 1) throw e
      await new Promise((r) => setTimeout(r, 2 ** i * 250))
    }
  }
}
\`\`\`

- Cap the delay so users aren't left waiting
- Only retry *idempotent* requests
`;

export default function ResponseDemo() {
  const [text, setText] = React.useState(MARKDOWN);
  const [streaming, setStreaming] = React.useState(false);

  const replay = () => {
    setStreaming(true);
    let i = 0;
    const id = setInterval(() => {
      i += 6;
      setText(MARKDOWN.slice(0, i));
      if (i >= MARKDOWN.length) {
        clearInterval(id);
        setStreaming(false);
      }
    }, 24);
  };

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <Response isAnimating={streaming}>{text}</Response>
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={replay}
        disabled={streaming}
      >
        <RegenerateIcon />
        Replay stream
      </Button>
    </div>
  );
}
