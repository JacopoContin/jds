import { ConversationEmpty } from "@/components/ai/conversation";
import { Suggestion, Suggestions } from "@/components/ai/suggestions";
import { SparkleIcon } from "@/lib/icons";

export default function ConversationEmptyDemo() {
  return (
    <ConversationEmpty
      icon={<SparkleIcon />}
      title="How can I help?"
      description="Ask about orders, refunds or shipping."
    >
      <Suggestions>
        <Suggestion suggestion="Where is my order?" />
        <Suggestion suggestion="Start a return" />
      </Suggestions>
    </ConversationEmpty>
  );
}
