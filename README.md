# WhatsApp Ordering Bot — Sales Demo

A deterministic, menu-driven WhatsApp ordering bot: a customer messages in, picks from a
category/item menu, confirms a quantity, and gets back a branded PDF order confirmation.
Built as a **re-skinnable template** to demo and sell to local businesses (restaurants,
tour operators, salons, real estate) found via outreach — not a one-off for a single client.

Currently seeded as a demo restaurant ("Bella Vista Trattoria"). Re-skin for a prospect by
editing two things, nothing else in the app needs to change:

1. **Branding** — `prisma/seed.ts`, the `Business` record (name, logo text, brand colors, currency).
2. **Menu** — `prisma/seed.ts`, the `CatalogItem` rows (category, name, description, price).

Then run `npm run db:seed` again (it wipes and recreates both tables from that file).

## Running locally (no Twilio account needed)

```bash
npm install
npm run db:seed   # only needed once, or after editing prisma/seed.ts
npm run dev
```

Test the full conversation via the simulate endpoint — no Twilio account, no public URL:

```bash
PHONE="+15551234567"
curl -s -X POST localhost:3000/api/whatsapp/simulate -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"body\":\"hi\"}"
# keep posting the number each reply asks for, reusing the same $PHONE
```

Each response includes `documentUrl` once the order is confirmed — open it to see the
generated PDF. `RESTART` or `MENU` at any point starts a fresh order; `HELP` re-sends the
current prompt.

Admin view (who messaged in, what they picked, the full chat thread): `/admin/enquiries`.

## Going live on real WhatsApp

Uses Twilio's **WhatsApp Sandbox** — no business verification needed, testable within minutes.

1. Create a free Twilio account → in the console open **Messaging → Try it out → Send a
   WhatsApp message**, and follow the "join `<code>`" instructions from your own phone's WhatsApp.
2. Set in `.env`: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` (from the Twilio console), and
   `NEXT_PUBLIC_BASE_URL` to a public https URL that reaches this app (e.g. `ngrok http 3000`
   while developing, or your real deployed domain).
3. Point the Sandbox's webhook URL at `${NEXT_PUBLIC_BASE_URL}/api/whatsapp/webhook`.
4. Message the Sandbox number from WhatsApp — the bot's greeting should come back within seconds.

None of the above is required to test locally — only to receive real messages over WhatsApp.

## Architecture

- `src/lib/whatsapp/fsm.ts` — pure conversation state machine (no Prisma/Twilio imports).
- `src/lib/whatsapp/store.ts` — the only file that touches Prisma for this feature.
- `src/lib/whatsapp/engine.ts` — orchestrator wiring the fsm to the store; both the simulate
  route and the real webhook call this and nothing else.
- `src/app/api/whatsapp/simulate/route.ts` — JSON test harness (curl-testable).
- `src/app/api/whatsapp/webhook/route.ts` — real Twilio entrypoint.
- `src/lib/whatsapp/confirmation-pdf.ts` + `src/app/api/confirmation/[enquiryId]/route.ts` —
  on-demand branded PDF, generated in memory (not written to disk).
- `src/app/admin/enquiries` — list + per-conversation thread view.
