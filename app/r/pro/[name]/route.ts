import { fetchProItem, isItemName, isValidLicense, licenseFromRequest } from "@/lib/pro"
import { site } from "@/lib/site"

const noStore = { "Cache-Control": "private, no-store" }

/**
 * Pro registry items, gated by license key. Buyers add to components.json:
 *   "@jds-pro": { "url": "<site>/r/pro/{name}.json", "headers": { "Authorization": "Bearer ${JDS_PRO_TOKEN}" } }
 * then run: npx shadcn@latest add @jds-pro/<name>
 */
export async function GET(request: Request, ctx: RouteContext<"/r/pro/[name]">) {
  const name = (await ctx.params).name.replace(/\.json$/, "")

  if (!(await isValidLicense(licenseFromRequest(request)))) {
    return Response.json(
      { error: `A valid JDS Pro license is required. Get one at ${site.url}/pro and set JDS_PRO_TOKEN.` },
      { status: 401, headers: { ...noStore, "WWW-Authenticate": 'Bearer realm="jds-pro"' } },
    )
  }
  if (!isItemName(name)) return Response.json({ error: "Not found" }, { status: 404, headers: noStore })

  const result = await fetchProItem(name)
  switch (result.status) {
    case "ok":
      return Response.json(result.item, { headers: noStore })
    case "not-found":
      return Response.json({ error: `No Pro item named "${name}".` }, { status: 404, headers: noStore })
    default:
      return Response.json({ error: "Pro registry unavailable. Try again shortly." }, { status: 503, headers: noStore })
  }
}
