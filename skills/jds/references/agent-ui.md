# Agent and voice UI

Use the JDS components for these. Each one already handles its states; your job is to pick, place and connect them.

## Conversation

- Use `Conversation` and `Message` for a transcript. Don't build bubbles by hand.
- The user's turn and the agent's turn should look different; one side gets a bubble, the other usually doesn't.
- Streamed content enters with `rise`. Keep the view pinned to the bottom while streaming, unless the person scrolled up.

## Agent activity

- Show work as it happens: reasoning, a plan, tool calls, sources. Collapse it once the turn is done, so the answer is what stays.
- A tool call (`ToolCall`) shows its name, a short summary of its input and its status. Raw JSON goes behind a disclosure.
- Anything that changes data or spends money needs an `Approval` in the turn, with what will happen in plain words and Approve / Deny.
- Show the state the agent is in: working, needs you, done or failed. Never leave a spinner with no label.

## Composer

- Use `PromptInput`. Send turns into Stop while the agent is working.
- Enter sends by default. Attachments, model picker and tools live in the composer toolbar, not elsewhere on the page.

## Voice

- Use `VoiceOrb` with one state API: idle, connecting, listening, thinking, speaking, error. Every state must look different.
- Pair the orb with captions or a transcript. Voice alone is hard to trust.
- Always show how to end or mute a call, and the mic state.

## Placement

- A copilot belongs beside the work, in a side panel (`AgentPanel`), not as a full-page chat.
- A standalone assistant gets a full-page chat with a centered composer on an empty state.
- ⌘K covers quick commands and questions without opening a panel.
