import { createHash, timingSafeEqual } from "node:crypto"

/**
 * JDS Pro: registry items served only to license holders. The source never lives in this
 * public repo; the private repo builds each item's JSON and uploads it to `JDS_PRO_REGISTRY_URL`.
 *
 * Licenses are sold through Polar, which emails each buyer a key and lets them recover it
 * from its customer portal. Server-only environment:
 * - POLAR_ORGANIZATION_ID: the Polar organization whose license keys unlock Pro.
 * - JDS_PRO_KEYS: optional comma-separated SHA-256 hex digests of keys issued by hand (comps,
 *   reviewers), checked before Polar. Hashes, so a leaked env dump doesn't leak working keys.
 * - JDS_PRO_REGISTRY_URL: base URL of the private item store, without a trailing slash.
 * - JDS_PRO_REGISTRY_TOKEN: optional bearer token for that store.
 */

const sha256 = (value: string) => createHash("sha256").update(value).digest()

function isManualKey(digest: Buffer) {
  const hashes = (process.env.JDS_PRO_KEYS ?? "").split(",").map((h) => h.trim()).filter(Boolean)
  // Compare against every hash so timing doesn't reveal which, or how many, matched.
  let ok = false
  for (const hex of hashes) {
    const expected = Buffer.from(hex, "hex")
    if (expected.length === digest.length && timingSafeEqual(expected, digest)) ok = true
  }
  return ok
}

/** Validation results, keyed by key hash, so an install of many items asks Polar once. */
const cache = new Map<string, { ok: boolean; until: number }>()
const CACHE_MS = { valid: 10 * 60_000, invalid: 60_000 }

async function isPolarKey(key: string, digest: string) {
  const organization = process.env.POLAR_ORGANIZATION_ID
  if (!organization) return false
  const hit = cache.get(digest)
  if (hit && hit.until > Date.now()) return hit.ok

  // Public endpoint: needs no Polar token. Unknown keys answer 404.
  const res = await fetch("https://api.polar.sh/v1/customer-portal/license-keys/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, organization_id: organization }),
    cache: "no-store",
  }).catch(() => null)
  // Polar unreachable or erroring: refuse this request but don't remember the answer.
  if (!res || res.status >= 500) return false

  const body = res.ok ? ((await res.json()) as { status?: string; expires_at?: string | null }) : null
  const ok = body?.status === "granted" && (!body.expires_at || Date.parse(body.expires_at) > Date.now())
  // Keys arrive from anyone; cap the cache so random guesses can't grow it without bound.
  if (cache.size >= 1000) cache.clear()
  cache.set(digest, { ok, until: Date.now() + (ok ? CACHE_MS.valid : CACHE_MS.invalid) })
  return ok
}

export async function isValidLicense(key: string | null | undefined) {
  if (!key) return false
  const digest = sha256(key)
  return isManualKey(digest) || isPolarKey(key, digest.toString("hex"))
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
