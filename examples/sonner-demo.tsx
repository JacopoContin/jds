"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export default function SonnerDemo() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toast("Agent finished", {
          description: "Refund issued for order #4821.",
        })
      }
    >
      Show toast
    </Button>
  );
}
