import { NextRequest } from "next/server";

// Prefer an explicit public-origin env var over req.nextUrl.origin — the
// latter reflects the server's internal bind address behind most PaaS
// reverse proxies (e.g. Render terminates TLS and proxies to
// http://localhost:10000 internally), not the public HTTPS URL a client
// or Twilio actually reaches the app on.
export function getPublicBaseUrl(req: NextRequest): string {
  return (process.env.NEXT_PUBLIC_BASE_URL ?? req.nextUrl.origin).replace(/\/$/, "");
}
