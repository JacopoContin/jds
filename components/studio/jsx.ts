/** Tiny JSX printer for Studio code tabs: a tree of tags, props and text, printed with Prettier-like wrapping. */

export type Node =
  | string
  | { tag: string; props?: string[]; children?: Node[]; text?: string }
  /** Rendered only while `when` is true: {when && (…)} */
  | { when: string; node: Node }

export function render(node: Node, depth = 0): string {
  const pad = "  ".repeat(depth)
  if (typeof node === "string") return pad + node
  if ("when" in node) {
    if (typeof node.node === "string") return `${pad}{${node.when} && ${node.node}}`
    return [`${pad}{${node.when} && (`, render(node.node, depth + 1), `${pad})}`].join("\n")
  }
  const props = node.props ?? []
  // Past about 100 columns, put one prop per line, the way Prettier would.
  const wide = pad.length + node.tag.length + props.join(" ").length > 96
  const open = wide
    ? `${node.tag}\n${props.map((prop) => `${pad}  ${prop}`).join("\n")}\n${pad}`
    : [node.tag, ...props].join(" ")
  if (node.text !== undefined) return `${pad}<${open}>${node.text}</${node.tag}>`
  if (!node.children?.length) return `${pad}<${open}${wide ? "" : " "}/>`
  return [`${pad}<${open}>`, ...node.children.map((child) => render(child, depth + 1)), `${pad}</${node.tag}>`].join(
    "\n",
  )
}
