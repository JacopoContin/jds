import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  ["What can the agent access?", "Only the tools and files you connect. You can revoke access at any time in settings."],
  ["Does it act without asking?", "Anything irreversible, like refunds or deletions, waits for your approval first."],
  ["Where is my data stored?", "In the EU region. Conversations are kept for 30 days unless you pin them."],
]

export default function AccordionDemo() {
  return (
    <Accordion defaultValue={["0"]} className="w-full max-w-md">
      {faqs.map(([q, a], i) => (
        <AccordionItem key={q} value={String(i)}>
          <AccordionTrigger>{q}</AccordionTrigger>
          <AccordionContent>{a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
