import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CodeBlock } from "@/components/docs/code-block"
import { Command } from "@/components/docs/command"
import { ComponentPreview, readSource } from "@/components/docs/component-preview"
import { InstallTabs } from "@/components/docs/install-tabs"
import { Code, H2, H3, P, PageHeader, Pager } from "@/components/docs/prose"
import { PropsTable } from "@/components/docs/props-table"
import { addonsOf, componentBySlug, components, type ComponentDoc } from "@/lib/docs"
import { site } from "@/lib/site"
import registry from "@/registry.json"

const proRegistryConfig = `{
  "registries": {
    "${site.proNamespace}": {
      "url": "${site.url}/r/pro/{name}.json",
      "headers": { "Authorization": "Bearer \${JDS_PRO_TOKEN}" }
    }
  }
}`

const itemRef = (c: ComponentDoc) => `${c.pro ? site.proNamespace : site.namespace}/${c.slug}`

type RegistryItem = { name: string; dependencies?: string[]; registryDependencies?: string[] }

export const dynamicParams = false

export function generateStaticParams() {
  return components.filter((c) => !c.parent).map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps<"/docs/components/[slug]">): Promise<Metadata> {
  const doc = componentBySlug[(await params).slug]
  return doc ? { title: doc.title, description: doc.description } : {}
}

export default async function ComponentPage({ params }: PageProps<"/docs/components/[slug]">) {
  const { slug } = await params
  const doc = componentBySlug[slug]
  if (!doc || doc.parent) notFound()
  const addons = addonsOf(slug)

  const item = (registry.items as RegistryItem[]).find((i) => i.name === slug)
  const deps = item?.dependencies ?? []
  const regDeps = item?.registryDependencies ?? []
  // Pro source lives in the private repo; reading it here would fail and publish it if it didn't.
  const sources = doc.pro ? [] : await Promise.all(doc.files.map(async (file) => ({ file, code: await readSource(file) })))

  return (
    <>
      <PageHeader title={doc.title} description={doc.description} />

      <ComponentPreview name={`${slug}-demo`} install={itemRef(doc)} />

      <H2>Installation</H2>
      {doc.pro ? (
        <div className="flex flex-col gap-4">
          <P>
            Part of{" "}
            <Link href="/pro" className="font-medium text-foreground underline underline-offset-4">
              JDS Pro
            </Link>
            . Add the Pro registry to <Code>components.json</Code> and set <Code>JDS_PRO_TOKEN</Code> in{" "}
            <Code>.env</Code> to your license key:
          </P>
          <CodeBlock code={proRegistryConfig} lang="json" />
          <Command command={`shadcn@latest add ${itemRef(doc)}`} />
        </div>
      ) : (
        <InstallTabs
          cli={<Command command={`shadcn@latest add ${site.namespace}/${slug}`} />}
          manual={
            <>
              {deps.length > 0 && (
                <div className="flex flex-col gap-3">
                  <P>Install the dependencies:</P>
                  <Command type="install" command={deps.join(" ")} />
                </div>
              )}
              {regDeps.length > 0 && (
                <P>
                  Also add{" "}
                  {regDeps.map((d, i) => (
                    <span key={d}>
                      {i > 0 && ", "}
                      <Code>{d}</Code>
                    </span>
                  ))}
                  .
                </P>
              )}
              <P>Copy the source into your project:</P>
              {sources.map((s) => (
                <CodeBlock key={s.file} title={s.file} code={s.code} lang={s.file.endsWith(".ts") ? "ts" : "tsx"} />
              ))}
            </>
          }
        />
      )}

      {doc.usage && (
        <>
          <H2>Usage</H2>
          <CodeBlock code={doc.usage} />
        </>
      )}

      {doc.examples && doc.examples.length > 0 && (
        <>
          <H2>Examples</H2>
          {doc.examples.map((ex) => (
            <div key={ex.name} className="flex flex-col gap-4">
              <H3>{ex.title}</H3>
              <ComponentPreview name={ex.name} install={itemRef(doc)} />
            </div>
          ))}
        </>
      )}

      {addons.map((addon) => (
        <div key={addon.slug} className="flex flex-col gap-6">
          <H2 id={addon.parent!.section}>{addon.title}</H2>
          <P>{addon.description}</P>
          <ComponentPreview name={`${addon.slug}-demo`} install={itemRef(addon)} />
          <P>Installed separately, so the base component stays lean:</P>
          <Command command={`shadcn@latest add ${itemRef(addon)}`} />
          <CodeBlock code={addon.usage} />
          {addon.api?.map((a) => (
            <div key={a.component} className="flex flex-col gap-4">
              <H3 id={`api-${a.component.toLowerCase()}`}>{a.component}</H3>
              <PropsTable props={a.props} />
            </div>
          ))}
        </div>
      ))}

      {doc.api && doc.api.length > 0 && (
        <>
          <H2>API Reference</H2>
          {doc.api.map((a) => (
            <div key={a.component} className="flex flex-col gap-4">
              <H3 id={`api-${a.component.toLowerCase()}`}>{a.component}</H3>
              <PropsTable props={a.props} />
            </div>
          ))}
        </>
      )}

      <Pager href={`/docs/components/${slug}`} />
    </>
  )
}
