"use client"

import { MobilePushToTalk } from "@/recipes/mobile-push-to-talk/mobile-push-to-talk"
import { useSimulatedPushToTalk } from "@/recipes/mobile-push-to-talk/session"

export default function MobilePushToTalkScreen() {
  const session = useSimulatedPushToTalk()
  return <MobilePushToTalk session={session} subtitle="Calendar and email assistant" />
}
