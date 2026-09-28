import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { CodeBlock } from "@/components/docs/code-block"
import { Command } from "@/components/docs/command"
import { ComponentPreview, readSource } from "@/components/docs/component-preview"
import { InstallTabs } from "@/components/docs/install-tabs"
import { Code, H2, H3, P, PageHeader, Pager } from "@/components/docs/prose"
import { PropsTable } from "@/components/docs/props-table"
import { componentBySlug, components } from "@/lib/docs"
import { site } from "@/lib/site"
import registry from "@/registry.json"

type RegistryItem = { name: string; dependencies?: string[]; registryDependencies?: string[] }

export const dynamicParams = false

export function generateStaticParams() {
  return components.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps<"/docs/components/[slug]">): Promise<Metadata> {
  const doc = componentBySlug[(await params).slug]
  return doc ? { title: doc.title, description: doc.description } : {}
}

export default async function ComponentPage({ params }: PageProps<"/docs/components/[slug]">) {
  const { slug } = await params
  const doc = componentBySlug[slug]
  if (!doc) notFound()

  const item = (registry.items as RegistryItem[]).find((i) => i.name === slug)
  const deps = item?.dependencies ?? []
  const regDeps = item?.registryDependencies ?? []
  const sources = await Promise.all(doc.files.map(async (file) => ({ file, code: await readSource(file) })))

  return (
    <>
      <PageHeader title={doc.title} description={doc.description} />

      <ComponentPreview name={`${slug}-demo`} />

      <H2>Installation</H2>
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
              <ComponentPreview name={ex.name} />
            </div>
          ))}
        </>
      )}

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
