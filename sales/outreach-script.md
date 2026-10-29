# Outreach script — WhatsApp ordering bot, Tamil Nadu restaurants

Leads: Airtable base "Outreach — TN Restaurants (WhatsApp Bot)" (46 leads with phone numbers, Ramanathapuram/Tiruvannamalai/Tirupathur/Vaniyambadi area).

Pricing — two tiers, since you have zero case studies yet and need fast first "yes"es more than margin right now:

**Founding client offer (first 10 clients only):**
- Setup: ₹0 (waived — removes the only real objection to trying it)
- Monthly: ₹999/month for the first 3 months, then ₹1,499/month after
- 14-day free trial before the first charge — they can cancel with zero cost if it's not working
- In exchange: ask for a short testimonial/review once they've used it for 2 weeks (this is what sells the next 10 clients)

**Standard pricing (once you have 5-10 paying/testimonial clients):**
- Setup: ₹1,999 one-time (menu loaded, branding, number connected)
- Monthly: ₹1,499/month flat (unlimited orders, PDF confirmations, admin dashboard)

Quote the founding-client offer on every call until you hit 10 signups, then switch the script to standard pricing.

## Cold call script

**Opening (10 sec):**
"Vanakkam! Naan Shekin Isaac, Purewish-la irundhu. Neenga restaurant business pathi oru 2 minute pேசலाம்? [Hi, this is Shekin Isaac from Purewish — do you have 2 minutes about your restaurant?]"

**Hook:**
"Nowadays a lot of customers try to order on WhatsApp but you have to pick up every call or reply manually, right? I built a WhatsApp bot that takes the order automatically — customer messages, picks from your menu, confirms quantity, and gets a bill/confirmation PDF instantly. No app, no training needed, works on the WhatsApp number you already use."

**Qualify:**
"Do you get WhatsApp or phone orders already?" → if yes: "This is built exactly for that — saves your staff from answering every call."

**If they ask price:**
"Right now I'm onboarding the first 10 restaurants for free — no setup cost, and the first 3 months are ₹999/month instead of ₹1,499. You try it free for 14 days first, cancel anytime with zero cost. All I ask is a quick review once you've used it a couple weeks."

**Offer:**
"I can show you a working demo — takes 2 minutes over a call or I can send you a short video on WhatsApp right now. Interested?"

**If yes:** Get their WhatsApp number (if different from business line), say "I'll message you within the day with a live demo you can try yourself, no cost to look."
**If hesitant:** "No pressure — I'll just send a 1-minute video, you can watch whenever," then send the recorded demo (see below) to their number via regular WhatsApp message.

**If not interested:** Thank them, mark "Called - not interested" in the tracker, move on.

## Follow-up WhatsApp message (send manually from your own WhatsApp, after a call or as cold first touch)

> Vanakkam [Restaurant Name]! This is Shekin Isaac from Purewish. I help restaurants auto-take WhatsApp orders without you lifting the phone — customer messages, picks from menu, gets instant confirmation. Takes 2 min to try. Want me to set up a live demo number for you to test? No cost to look. 🙂

## Demo video (ready to send — no hosting needed)

**[sales/assets/whatsapp-bot-demo.gif](assets/whatsapp-bot-demo.gif)** — the one to actually send. A 14-second animated GIF of the real conversation (greeting → menu → item pick → quantity → confirmation), captured from the WhatsApp-style demo page at `/demo` in this project. GIFs play on every WhatsApp client with zero codec risk — send it as an attachment straight from the cold-call thread or a fresh first-touch message.

(`whatsapp-bot-demo.webm` also exists alongside it as a slightly higher-quality backup, but it needs VP9 support the GIF doesn't depend on — default to the GIF.)

To re-record (e.g. after changing the menu/branding): run `npm run dev`, open `http://localhost:3000/demo`, click "Play demo conversation", and ask me to re-run the Playwright recording script.

## Second touch — once a lead is interested

This is the point to actually spin up the **Twilio WhatsApp Sandbox** so the lead can message a *real* number and get real bot replies. Don't do this for every cold lead — set it up now, once, so it's ready the moment someone says yes.

**Your part (5 minutes, has to be you — I can't create accounts on your behalf):**
1. Go to twilio.com/try-twilio and sign up free (email + phone verification, no business/ID verification needed for the Sandbox).
2. In the Console, go to **Messaging → Try it out → Send a WhatsApp message** — this activates your Sandbox and gives you a shared Twilio number + a join code (e.g. "join <two-words>").
3. From the Console home, copy your **Account SID** and **Auth Token** (click to reveal).
4. Send me those two values (SID + Auth Token) plus the Sandbox WhatsApp number it gave you.

**My part, once you hand those over:**
- Set `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` in the project's env.
- Stand up a public HTTPS webhook (just the `/api/whatsapp/webhook` + `/api/confirmation` routes — **not** `/admin/enquiries`, to avoid exposing customer data without auth) and point Twilio's Sandbox webhook at it.
- Confirm it live by messaging the Sandbox number myself before you demo it to anyone.

When a lead says yes on a call: tell them to WhatsApp the Sandbox number with the join code, then message it — they'll get real bot replies within seconds.

Treat the Account SID and Auth Token as a password: send them to me directly (not in a doc or chat that others can see), and never share them with a lead or anyone else.

## Tracking

Update the lead's **Status** in Airtable after every touch: Called - no answer / Called - interested / Called - not interested / WhatsApp sent / Demo shown / Follow-up needed / Won / Lost. Add context in **Notes** (e.g. "owner's son handles orders, call back evening").
