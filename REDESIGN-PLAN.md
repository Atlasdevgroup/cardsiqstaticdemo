# CardsIQ static pages: redesign plan

> New design around the approved CardsIQ content, not new content around a new design.
> Copy comes from the live dev pages, the supplied PDFs, and the brief. New sentences were written only where a section had no approved copy: objection answers and "what happens next". Each of those is assembled from approved facts (graders, ALT + Card Ladder, imports, OBS, rules).

## 1. Design idea

**ONE CARD. ONE RECORD. EVERY MOVEMENT.**

A single, canonical card record runs through the whole site. Each page shows a different portion of the same record:

| Page | Portion of the record | Visual language |
|---|---|---|
| Platform | Full lifecycle: Identity → Inventory → Value → Product → Break → Buyer → Offer → Verification → Settlement → History | Editorial and cinematic. The card is annotated with what CardsIQ knows |
| Instant Buybacks | Break → Buyer → Offer → Verify → Settle | Financial. A transaction ticket, money states, a rules engine |
| Inventory Management | Card → Identity → SKU → Value → Available → Product → Ledger | Physical-to-structured. Slabs become rows, rows become a product |
| StreamIQ | Show → Break → Spot → Hit → Offer → Outcome | Live and temporal. Timecode, a two-lane event rail, run-of-show ledgers |
| About | Why the record matters | Manifesto. Type-led, minimal UI |
| Become a Partner | Your operation onto the record | Conversion. Form above the fold |

### Canonical demo dataset (used everywhere)

| Field | Value |
|---|---|
| Card | 2023 Donruss Optic Joe Burrow **Downtown!** #D4 |
| Grade / cert | PSA 9 MINT · Cert **103207853** (matches the slab photo) |
| SKU | CIQ-P123891 |
| Market value | $1,030 (ALT + Card Ladder context) |
| Cost basis | $540 |
| Product | Football Premium 02 (10 cards · cost $4,820 · market $5,430 · chase $1,420) |
| Show / break | Stream **#1842** · 2026 NFL Mixer · **Break 04** (32 spots, 28 filled) |
| Buyer | @northstarcards (Bengals spot) |
| Offer | **$927** · 90% of market · Offer available → accepted |
| Trail | Hit 8:52:03 PM → Offer 8:52:04 → Accepted 8:52:41 → Verified 8:54:09 → Settled 8:54:12 |
| StreamIQ hit | Malik Nabers · 2024 Prizm Gold /10 · PSA 10 → @nycards (Giants spot) |

Data was reconciled with the photos and brief: grades and certs match each slab, offers equal 90% of market, sums add up, and Break 04 is the live break everywhere. In the "multiple breaks" view, Breaks 01–03 are completed, 04 is live, and 05 is queued.

## 2. Visual system

- **Base:** near-black navy `#03061a` (sampled from the design PDFs), one elevated navy for product UI only. Most sections sit directly on the background, with no box.
- **Brand:** electric blue → violet gradient, reserved for headline emphasis, primary buttons, the lifecycle line, and ambient light. Never on borders, icons, or pills.
- **Semantic color, used only to mean something:** green = verified/paid, amber = pending/pricing rules, cyan = data/infrastructure, purple = product relationships, red = LIVE (StreamIQ only).
- **Type:** Outfit, already loaded by the app via `next/font`, does the heavy lifting. Hero 88px, section titles 56px, lead 20px, body 17px. Geist Mono (also already in the app) is used for certs, SKUs, timecodes, and money in product UI. Nothing smaller than 12px. Labels are 12px with tracked caps.
- **Rhythm:** hero → large visual → editorial explanation → system visual → real UI → proof → objections → CTA. Section spacing is 140–180px. Each section has one dominant visual.
- **Product UI** is drawn as the real app surface (same pills, chips, table, and tabs as the dev app), at 60–70% section width instead of thumbnails.
- **Physical cards:** real PSA slab photography from the supplied files, with depth lighting and a subtle pointer tilt. Cards are always shown *with* their record data, never as decoration. Cards without a photo (e.g. Nabers) use a neutral CSS slab, with no fake grader branding.

## 3. Page architecture

### Platform: `/how-it-works` (flagship; absorbs /about's overview)
1. **Hero:** "One operating system for the modern hobby." + approved sub. CTAs: **Create account** / Become a partner. The visual is the Burrow slab annotated with seven callouts: *what it is, what it's worth, where it is, what it belongs to, who it belongs to, what can happen, what has happened*. These callouts are the brief's "final standard", made literal.
2. **Problem:** "The hobby has plenty of destinations. It doesn't have enough infrastructure." The diagram runs left to right: disconnected tools, each losing context, pass through the CardsIQ layer and come out as one record. On mobile this becomes progressive stages.
3. **Lifecycle:** "One card. One record. Every movement." A 10-stage rail. The active stage shows exactly what the record holds at that moment. It auto-advances, can be clicked or keyboard-driven, and is vertical on mobile.
4. **Modules:** "Connect every hobby workflow in one place." Four editorial rows (Inventory, Buybacks, StreamIQ, Licensed Repacks). Each row shows its slice of the record and links to its page. This also fixes cross-page navigation.
5. **Audiences:** "Different roles. One connected system." A tabbed editorial selector (Collectors, Breakers, Card shops, Repack companies, Hobby businesses). Each tab names its outcome and its own CTA path.
6. **Trust:** what CardsIQ runs on (ALT + Card Ladder, PSA/BGS/SGC cert data, OBS bridge, licensed repack programs) as a text strip, not a logo wall.
7. **Objections:** a 5-question FAQ built from approved facts.
8. **Final CTA:** "Infrastructure, not another destination." Split into two paths: collector → Create account, business → Become a partner.

### Instant Buybacks
1. **Hero:** "Turn break hits into instant buyer liquidity." Slab plus offer ticket: $1,030 market, **$927** offer, 90%, @northstarcards, Stream #1842 · Break 04, *Offer available*. CTA: **Become a buyback partner**.
2. **"The card never leaves the workflow."** HIT → OFFER → VERIFY → SETTLE as one timed progression on the record, with real timestamps and the computed "hit to settled".
3. **Objection:** "You control what you buy. CardsIQ handles what happens next." A rules sheet (graders, value range, buyback %, duplicates, identity checks, business rules) evaluates the Burrow card live, rule by rule, and returns Eligible → $927.
4. **Product proof:** a large buyback review queue (partner console) with buying power, pending, verification, and settled.
5. **Value by user:** breakers, buyers, businesses. One line each, approved copy, no boxes.
6. **FAQ**, then the **final CTA:** "Put liquidity behind every eligible hit." The composition shows the offer ticket in its accepted state.

### Inventory Management
1. **Hero:** "Manage every card from intake to outcome." A row of physical slabs resolves into structured rows. A metric strip shows 184 / 126 / 42 / $84,420.
2. **"From scan to available."** (intro: "Every card enters with an identity.") One card passes through 5 connected stages and the record fills in as it goes.
3. **Inventory directory:** large and real-looking. Columns are card, certification, FMV (ALT/CL), last sale, cost, and status. Eight distinct cards, no repeats. Below 768px it becomes condensed rows.
4. **"Inventory becomes product without losing its history."** Inventory rows move into *Football Premium 02*, with the same certs and costs and totals that add up.
5. **Ledger:** "One card. One record. Every movement." A sticky slab on the left, and a breathing event trail on the right that updates the record state as you scroll.
6. **FAQ**, then the **final CTA:** "Operate inventory from intake to outcome."

### StreamIQ (deliberately different: live, time-based)
1. **Hero:** "Run the stream and the operation together." A full-width live command view: LIVE timer, Stream #1842 · 2026 NFL Mixer, Break 04 spot board (28/32), current card Malik Nabers Gold /10 → @nycards, *Buyback eligible*, OBS bridge, and an event ticker.
2. **Event rail:** "Every event in the stream updates CardsIQ." Two synchronized lanes, *On stream* and *In CardsIQ*, on a timecode ruler with Show / Break / Production / Post-break phase bands.
3. **"One show. Multiple breaks. Separate ledgers."** A run-of-show rundown with five break lanes, each with its own ledger totals.
4. **Outcomes:** fewer manual handoffs, preserved buyer context, instant buybacks, clean break history, operational visibility.
5. **FAQ**, then the **final CTA:** "Run every break from show to settlement."

### Become a Partner
- Above the fold: headline, a 1–2 sentence sub, and a capabilities line (Inventory · Instant Buybacks · Live Commerce · Operations + Integrations). The **form** sits on the right.
- The form has the same fields and options as production: Full Name, Company / Shop, Work Email, Primary Interest, Monthly Card Volume, Current Workflow, and What are you trying to solve? It validates on submit and pre-selects interest from `?interest=`.
- Around the form: what happens next (3 steps), who it's for, what CardsIQ connects to, and a collector off-ramp ("Create account").

### About: `/about` (trust, not a feature tour)
"The hobby grew faster than its infrastructure." → the problem in one paragraph → four operating principles as editorial type → who CardsIQ is built for (6 roles) → "Operate the business. / Stay connected to the card." → closing CTA (Become a partner / Create account).

## 4. Shared components (`assets/css/ciq.css`, `assets/js/ciq.js`)

| Component | Purpose |
|---|---|
| App shell (`shell.js`) | Quieter sidebar with a Platform nav group, search, and visitor account controls (Sign in / Create account). Drawer on mobile, sticky top-bar CTA after the hero. `?auth=member` previews the signed-in shell |
| `.slab` / `.css-slab` | Physical card with lighting and pointer tilt. Neutral CSS slab when no photo exists |
| `.callout` | A record annotation: label + value + hairline to the asset |
| `.lifecycle` | Shared stage rail (horizontal on desktop, vertical on mobile) used by Platform, Buybacks, and Inventory intake |
| `[data-sequence]` | Stage activation engine: in-view, timed, looping or one-shot. Shows the end state under reduced motion |
| `.ui-*` | App-faithful product surfaces: panel, table, tabs, chips (PSA, CERT, RAW, ALT/CL), status pills |
| `.metric-strip` | Big numbers separated by hairlines, no tiles |
| `.faq` | Native `<details>` objection handling |
| `.cta-final` | Shared button and type rules. Each page supplies its own composition |

Motion is functional only: stages activate, connections light, offers resolve, events stream in. Everything respects `prefers-reduced-motion`.

## 5. What changes and why

- **Hero CTAs on every page.** This is the single largest conversion fix.
- **Two-path CTA hierarchy:** collectors to Create account, businesses to Become a partner.
- **Every page is a different shape.** No shared template beyond type, color, and buttons. StreamIQ in particular reads as live operations, not inventory.
- **No pasted or duplicate copy.** One canonical dataset, and grades that match the photos.
- **Objection handling and a trust layer** are added from approved facts, not invented claims.
- **About becomes a credibility page**, and How it works becomes the flagship.

## 6. Production integration notes

- The demo is framework-free HTML/CSS/JS, so it can't break the app. To port it, each page section maps onto a React component in the existing Next.js app, and the CSS tokens map to the Tailwind v4 theme the app already ships.
- Fonts in the demo come from Google Fonts. Production should keep using the `next/font` Outfit and Geist Mono instances it already loads.
- The partner form's `submitInquiry()` adapter in `become-a-partner.js` is the single function to wire to the existing submission handler. Field names and options match production.
- Replace the logo raster (rendered from the PDF) with `/cardsiq-logo-lockup.svg` from the app.

## 7. As built: review notes

### Copy to confirm before production
Every headline and body line comes from the live pages, the PDFs, or the brief. Where a section had no approved copy, short lines were assembled from approved facts. Please sign these off:

- **Platform**
  - Hero callout questions ("What it is / What it's worth / Where it is / What it belongs to / Who it belongs to / What can happen / What has happened"). These are the brief's "final standard" turned into labels.
  - The lifecycle stage descriptions.
  - The five FAQ answers.
  - Role headlines "Know what you own / Run smarter breaks / Grow with confidence" (from the PDFs).
- **Instant Buybacks**
  - Console heading "Every eligible offer. One review queue." and its sub-line.
  - "Who Instant Buybacks is for".
  - The FAQ answers.
  - Rules-sheet cell wording, e.g. "No other offer on 103207853".
  - The cross-link line "The same record started in …".
- **Inventory Management**
  - "Graded and raw. One directory."
  - "Inventory questions." and its FAQ answers.
  - The product note, the "Spread" figure (market − cost, labelled illustrative), and the cross-link line.
- **StreamIQ**
  - The outcome sub-lines.
  - Rail state words: Passed, Accepted, Settled.
  - The FAQ answers.
  - The collector note "Watching breaks as a collector?".
- **Become a Partner**
  - "What happens next" (3 steps).
  - The closing "Bring CardsIQ infrastructure into your collectibles business." (adapted from the page's meta description).
- **About**
  - The labels "For hobby businesses / For collectors".
  - The Mantle "On the label" readout.

### Data model notes
- Every view shows the same Burrow record and the same 10-event trail. Platform's hero counts 6 events up to the hit, and Inventory's ledger groups them into 6 inventory movements.
- The Buybacks console is a queue snapshot. The Nabers row shows "Offer accepted" before verification, and its context deliberately avoids Break 04 timing.
- StreamIQ's rail shows Break 04 "so far", through the Nabers buyback, because Break 04 is still live.
- Mahomes, Mantle, and Brady appear in both the inventory directory and the buyback queue, as the brief's dataset specifies. If that reads as contradictory to reviewers, swap the queue rows for cards that are not in inventory.

### Accessibility and motion decisions
- Primary buttons use `--grad-btn`, a deeper version of the brand gradient. White button text is ≥ 4.5:1 at every stop. The bright `--grad` is kept for headline emphasis, progress, and light.
- `--text-3` was raised to `#858ea9`, which passes 4.5:1 on both the page and the product panels. Nothing renders below 12px.
- Autoplay sequences play once and hold their end state; nothing loops. Platform's 10-stage lifecycle and StreamIQ's event rail have Pause / Play / Replay controls (WCAG 2.2.2). Under reduced motion every sequence renders its end state, and the controls are hidden.
- The interactive lifecycle stages are real `<button>`s with `aria-current="step"`. The detail panel announces only stages the visitor picks.
- The mobile drawer is removed from the tab order when closed and makes the page inert when open. The sticky top-bar CTA is not focusable while hidden.
- One gradient primary leads each view. The sidebar "Create account" is only a primary on Platform, where sign-up is the page's primary action.

### Validation (final run)
- All 7 pages were checked at 1440, 1280, 1024, and 390 px, plus a reduced-motion capture: 35 runs, with zero horizontal overflow and zero console errors.
- Scripted interaction tests: 35/35 passing. They cover form validation and success, `?interest=` preselect, CTA routing, tabs and lifecycle keyboard, the drawer, the sticky CTA, reduced-motion end states, and the member shell.
- `html-validate`: no structural errors. The remaining notices are lowercase `<!doctype html>`, which is valid HTML5, and `aria-label` on `<ol>`/`<ul>`, which ARIA permits for lists.
