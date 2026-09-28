"use client";

import * as React from "react";

import { Approval, type ApprovalDecision } from "@/components/ai/approval";
import { Button } from "@/components/ui/button";

export default function ApprovalDemo() {
  const [decision, setDecision] = React.useState<ApprovalDecision>("pending");
  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <Approval
        title="Delete 214 archived invoices"
        description="They'll be removed from storage permanently."
        approveLabel="Delete"
        decision={decision}
        onApprove={() => setDecision("approved")}
        onDeny={() => setDecision("denied")}
      />
      {decision !== "pending" && (
        <Button
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() => setDecision("pending")}
        >
          Reset
        </Button>
      )}
    </div>
  );
}
