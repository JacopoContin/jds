import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const runs = [
  { id: "#1284", agent: "Support", status: "Completed", tokens: "18.2k" },
  { id: "#1283", agent: "Researcher", status: "Running", tokens: "42.9k" },
  { id: "#1282", agent: "Support", status: "Needs approval", tokens: "7.4k" },
  { id: "#1281", agent: "Reviewer", status: "Failed", tokens: "3.1k" },
]

export default function TableDemo() {
  return (
    <Table className="max-w-lg">
      <TableHeader>
        <TableRow>
          <TableHead>Run</TableHead>
          <TableHead>Agent</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Tokens</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {runs.map((r) => (
          <TableRow key={r.id}>
            <TableCell>
              <span className="font-mono">{r.id}</span>
            </TableCell>
            <TableCell>{r.agent}</TableCell>
            <TableCell>
              <Badge variant={r.status === "Failed" ? "destructive" : "secondary"}>{r.status}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <span className="font-mono tabular-nums">{r.tokens}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
