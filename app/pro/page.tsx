import type { Metadata } from "next"
import Link from "next/link"

import { CodeBlock } from "@/components/docs/code-block"
import { Command } from "@/components/docs/command"
import { Code, P, Step, Steps } from "@/components/docs/prose"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { components, docHref } from "@/lib/docs"
import { CheckIcon, SuccessIcon } from "@/lib/icons"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Pro",
  description: "Premium motion components and blocks for JDS. One payment, every Pro component, current and future.",
}

const included = [
  "Every Pro component and block, installed with the shadcn CLI",
  "Every future Pro release, at no extra cost",
  "Unlimited personal and client projects",
  "Source you own and can edit, like the rest of JDS",
]

const registryConfig = `{
  "registries": {
    "${site.namespace}": "${site.url}/r/{name}.json",
    "${site.proNamespace}": {
      "url": "${site.url}/r/pro/{name}.json",
      "headers": { "Authorization": "Bearer \${JDS_PRO_TOKEN}" }
    }
  }
}`

export default async function ProPage({ searchParams }: PageProps<"/pro">) {
  const purchased = (await searchParams).checkout === "success"
  const pro = components.filter((c) => c.pro && !c.parent)
  const { price, checkoutUrl } = site.pro

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-14 px-4 py-16 md:px-6">
      {purchased && (
        <Alert>
          <SuccessIcon />
          <AlertTitle>Thanks for buying JDS Pro</AlertTitle>
          <AlertDescription>
            Your license key is in the receipt email from Polar. Follow the setup below to install your first component.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-10 md:grid-cols-2 md:items-start">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">JDS Pro</h1>
          <p className="text-muted-foreground">
            Premium motion components and blocks for agent and voice interfaces. The same conventions as the free
            components: theme tokens, Base UI, reduced-motion support, and source you own.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight">{price}</span>
                <span className="text-sm font-normal text-muted-foreground">one-time, per developer</span>
              </span>
            </CardTitle>
            <CardDescription>Pay once. No subscription.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm">
              {included.map((line) => (
                <li key={line} className="flex gap-2">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  {line}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <div className="flex w-full flex-col gap-2">
              {checkoutUrl ? (
                <a href={checkoutUrl} className={buttonVariants({ size: "lg" })}>
                  Get JDS Pro
                </a>
              ) : (
                <span aria-disabled className={buttonVariants({ size: "lg", variant: "secondary" })}>
                  Coming soon
                </span>
              )}
              <p className="text-center text-xs text-muted-foreground">
                Secure checkout by Polar. VAT and sales tax handled for you.
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>

      {pro.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">What&apos;s in Pro</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {pro.map((c) => (
              <li key={c.slug}>
                <Link href={docHref(c)} className="flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-muted/50">
                  <span className="flex items-center gap-2 font-medium">
                    {c.title}
                    {c.isNew && <Badge variant="secondary">New</Badge>}
                  </span>
                  <span className="text-sm text-muted-foreground">{c.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="setup" className="flex max-w-2xl scroll-mt-20 flex-col gap-4">
        <h2 className="text-lg font-semibold">After you buy</h2>
        <Steps>
          <Step title="Find your license key">
            <P>
              It&apos;s in your receipt email from Polar. Lost it? Sign in to the Polar customer portal with the same email
              to see it again.
            </P>
          </Step>
          <Step title="Add it to your project">
            <P>
              Put the key in <Code>.env</Code> as <Code>JDS_PRO_TOKEN</Code>, then add both registries to{" "}
              <Code>components.json</Code>:
            </P>
            <CodeBlock code={registryConfig} lang="json" />
          </Step>
          <Step title="Install">
            <Command command={`shadcn@latest add ${site.proNamespace}/<name>`} />
          </Step>
        </Steps>
      </section>
    </main>
  )
}
