"use client";

import { toast } from "sonner";

import {
  Message,
  MessageAction,
  MessageActions,
  MessageAvatar,
  MessageContent,
} from "@/components/ai/message";
import {
  CopyIcon,
  RegenerateIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "@/lib/icons";

export default function MessageDemo() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <Message from="user">
        <MessageContent>Can you shorten this paragraph?</MessageContent>
      </Message>
      <Message from="assistant">
        <MessageAvatar name="Agent" />
        <MessageContent>
          <p>
            Sure. Shipping is free over €50 and takes two to four working days.
          </p>
          <MessageActions>
            <MessageAction label="Copy" onClick={() => toast("Copied")}>
              <CopyIcon />
            </MessageAction>
            <MessageAction label="Regenerate">
              <RegenerateIcon />
            </MessageAction>
            <MessageAction label="Good response">
              <ThumbsUpIcon />
            </MessageAction>
            <MessageAction label="Bad response">
              <ThumbsDownIcon />
            </MessageAction>
          </MessageActions>
        </MessageContent>
      </Message>
    </div>
  );
}
