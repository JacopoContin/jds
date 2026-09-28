import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

const agents = [
  ["Support", "Answers customers and handles refunds with approval."],
  ["Researcher", "Searches the web and your docs, with citations."],
  ["Reviewer", "Reads pull requests and flags risky changes."],
] as const

export default function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Agents</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-96 gap-1 p-1">
              {agents.map(([title, body]) => (
                <li key={title}>
                  <NavigationMenuLink href="#">
                    <div className="text-sm font-medium">{title}</div>
                    <p className="text-sm text-muted-foreground">{body}</p>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#">Runs</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#">Settings</NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
