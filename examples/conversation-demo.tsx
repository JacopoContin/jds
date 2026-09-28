"use client";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai/conversation";
import { Message, MessageContent } from "@/components/ai/message";

const turns = [
  ["user", "What changed in the Q3 pricing?"],
  [
    "assistant",
    "Two things: the Team plan moved from €12 to €14 per seat, and annual billing now gets two months free instead of one.",
  ],
  ["user", "Which customers are affected?"],
  [
    "assistant",
    "Everyone on monthly Team billing at renewal. Annual customers keep their price until their term ends.",
  ],
  ["user", "Draft the email."],
  [
    "assistant",
    "Here's a first draft. I kept it short and led with the annual discount so the change reads as an option, not only a price rise.",
  ],
] as const;

export default function ConversationDemo() {
  return (
    <div className="flex h-96 w-full max-w-lg flex-col rounded-xl border">
      <Conversation>
        <ConversationContent className="gap-4 py-4">
          {turns.map(([from, text], i) => (
            <Message key={i} from={from}>
              <MessageContent>{text}</MessageContent>
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  );
}
