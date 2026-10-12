import { createHash, timingSafeEqual } from "node:crypto"

/**
 * JDS Pro: registry items served only to license holders. The source never lives in this
 * public repo; the private repo builds each item's JSON and uploads it to `JDS_PRO_REGISTRY_URL`.
 *
 * Server-only environment:
 * - JDS_PRO_KEYS: comma-separated SHA-256 hex digests of issued license keys. Hashes, so a
 *   leaked env dump doesn't leak working keys. Swap `isValidLicense` for the payment
 *   provider's validation API once one is chosen.
 * - JDS_PRO_REGISTRY_URL: base URL of the private item store, without a trailing slash.
 * - JDS_PRO_REGISTRY_TOKEN: optional bearer token for that store.
 */

const sha256 = (value: string) => createHash("sha256").update(value).digest()

export function isValidLicense(key: string | null | undefined) {
  if (!key) return false
  const digest = sha256(key)
  const hashes = (process.env.JDS_PRO_KEYS ?? "").split(",").map((h) => h.trim()).filter(Boolean)
  // Compare against every hash so timing doesn't reveal which, or how many, matched.
  let ok = false
  for (const hex of hashes) {
    const expected = Buffer.from(hex, "hex")
    if (expected.length === digest.length && timingSafeEqual(expected, digest)) ok = true
  }
  return ok
}

/** Reads the key from `Authorization: Bearer <key>`, the header the shadcn CLI sends. */
export function licenseFromRequest(request: Request) {
  const match = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)
  return match?.[1].trim() ?? null
}

/** Item names are slugs; anything else never reaches the store. */
export const isItemName = (name: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)

export type ProFetchResult = { status: "ok"; item: unknown } | { status: "not-found" | "unconfigured" | "error" }

export async function fetchProItem(name: string): Promise<ProFetchResult> {
  const base = process.env.JDS_PRO_REGISTRY_URL
  if (!base) return { status: "unconfigured" }
  const token = process.env.JDS_PRO_REGISTRY_TOKEN
  const res = await fetch(`${base}/${name}.json`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: "no-store",
  }).catch(() => null)
  if (!res) return { status: "error" }
  if (res.status === 404 || res.status === 403) return { status: "not-found" }
  if (!res.ok) return { status: "error" }
  return { status: "ok", item: await res.json() }
}
