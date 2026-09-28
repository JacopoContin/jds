import { SidebarNav } from "@/components/docs/sidebar-nav"
import { Toc } from "@/components/docs/toc"

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="mx-auto grid w-full max-w-screen-2xl flex-1 md:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,1fr)_13rem]">
      <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] overflow-y-auto border-r py-8 pr-4 pl-4 md:block md:pl-6">
        <SidebarNav />
      </aside>
      <main data-docs className="min-w-0 px-4 py-10 md:px-10 lg:px-14">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">{children}</div>
      </main>
      <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] py-10 pr-6 xl:block">
        <Toc />
      </aside>
    </div>
  )
}
