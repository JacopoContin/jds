import type { Prop } from "@/lib/docs"

export function PropsTable({ props }: { props: Prop[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
          <tr>
            <th className="px-4 py-2.5 font-medium">Prop</th>
            <th className="px-4 py-2.5 font-medium">Type</th>
            <th className="px-4 py-2.5 font-medium">Default</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {props.map((p) => (
            <tr key={p.name} className="align-top">
              <td className="px-4 py-3">
                <code className="font-mono text-xs text-foreground">{p.name}</code>
                {p.description && <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-foreground">{p.type}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.default ?? "–"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
