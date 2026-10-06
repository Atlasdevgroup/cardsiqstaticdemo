# CardsIQ static pages: CRO and UX audit

**Scope:** `/how-it-works`, `/about`, `/instant-buybacks`, `/inventory-management`, `/streamiq`, `/become-a-partner` on dev.cardsiq.io. I also reviewed the supplied design files: *One operating system*, *Connect every hobby*, *instant buyback*, *V3 Instant Buybacks*, *Inventory Management*, *V3 Inventory Management*, *StreamIQ*, *V3 StreamIQ*, *Become a Partner*, and both concept boards.

**Method:** The dev site sits behind a client-side "Restricted Access" gate. I didn't enter the test credentials, because agents may not type passwords into non-local sites. I audited each page's server-rendered copy and structure, which the site serves before the gate. Visual review used the V3 PDFs, which match the live copy almost line for line.

---

## The verdict in one paragraph

The product story is strong, and most of the copy is already right. "One card. One record. Every movement." is a better idea than any page currently makes visible. The pages lose sales for three reasons:

1. **There is almost no conversion path.** No page has a hero CTA. The only CTA anywhere is the same "Become a Partner" banner at the bottom of every page. "Create account" doesn't appear at all.
2. **The pages read like an admin console.** They show dozens of equal-weight bordered panels, 11–13px labels, and tiny dashboard widgets. The product is shown in small pieces, and the story and the physical card are never shown together.
3. **Pages contradict and repeat each other.** Copy is pasted between products, demo data is inconsistent, and two pages tell the same overview story.

The fix is not more UI. It's one story per page, one dominant visual per section, consistent demo data, and a CTA hierarchy that sends collectors to sign-up and businesses to the partner form.

---

## Findings that cost conversions (ranked)

| # | Problem | Evidence | Impact |
|---|---|---|---|
| 1 | **No CTA above the fold on any page** | Every hero ends in feature pills ("Break Hits / Instant Offers / Fast Settlement") instead of a button | Visitors must scroll the full page to find the only action |
| 2 | **No self-serve path** | "Create account" or "Get started" appears nowhere. Every page ends in "Become a Partner" | Collectors, the largest audience, have nowhere to go, and they flood the partner form |
| 3 | **Visitors can't navigate between product pages** | The logged-out sidebar only links Home and Licensed Repacks (HG Breaks, Rogue Rips). The design files show the *logged-in* shell (wallet $250.00, Logout, Buybacks › Generate) | A buyer on Buybacks has no route to Inventory or StreamIQ, and the shell looks like someone else's account |
| 4 | **Identical closing banner on every page** | "Built on CardsIQ" banner with a gradient and slabs, same layout on all 6 pages | Banner blindness. The final ask carries no page-specific reason to act |
| 5 | **Copy pasted between products** | StreamIQ v1 has an "Inventory Management" eyebrow, "intake to outcome" headline, and intake body copy. V3 StreamIQ "Multiple breaks" rows read *Scan card / Match + identify / Value + cost / Create SKU*. Partner page subhead is StreamIQ's "Create the live production session…" | Shows the product isn't understood. Fatal for a skeptical enterprise buyer |
| 6 | **Duplicated modules** | Partner page shows Inventory Management and Instant Buybacks **twice**. Inventory V3 uses "Every card enters with an identity." twice and the same Burrow row five times. Connect-every-hobby has "Know what you have" under Identify, Value **and** Operate | Repetition reads as filler and erodes trust |
| 7 | **Demo data contradicts the card photos** | The live table lists the 2000 Bowman Brady as PSA 9 (slab says **NM-MT 8**), the 1958 Mantle as PSA 6 (slab says **VG-EX 4**), and the Optic Mahomes Lime as PSA 10 (slab says **MINT 9**). Burrow's cert is shown as #855345645 and 6087388009, but the slab reads **103207853** | Hobby professionals read labels. Mismatched grades on a "we know the asset" page undercut the core claim |
| 8 | **Numbers that don't reconcile** | Product summary: 1,248 rows = 1,198 valid + 30 dup + 30 errors (adds to 1,258), "Total est. value $1,030". Buyback offer of $1,116 sits beside a $1,030 market value. "Settled in 12 minutes" beside a timeline that spans ~1 minute. StreamIQ "Break 03 live" beside "Break 04 live" | Small, but these are exactly what a finance-minded buyer checks |
| 9 | **Unsupported claims** | "68% faster than manual", "98.4% verification rate", "+12.4% vs last month", plus the concept-board stats (50K+ cards, 500+ businesses, $250M+ volume) | Must be sourced or removed. Inside product UI they're fine as demo data. As marketing claims they're a liability |
| 10 | **Overview story told twice** | `/about` = "One operating system…" and `/how-it-works` = "Connect every hobby workflow…" use the same operating graph, the same fragmented-vs-connected idea, and the same CTA | Splits authority, and neither page is the definitive "what is CardsIQ" answer |
| 11 | **Physical card and data never meet** | Slabs sit in decorative banners. Data sits in separate panels | The differentiator ("CardsIQ knows the asset") is never shown in one glance |
| 12 | **No objection handling or trust layer** | Nothing answers "Do I have to buy every hit?" (answered only implicitly), "Does this replace my marketplace?", "Where does pricing come from?", or "What happens after I submit?" | Qualified prospects stall at the last step |
| 13 | **Partner form feels like a support ticket** | Placeholder for Work Email is "Jane Smith". There's no "what happens next" and no sign of who it's for. Four module cards (two duplicated) push the form below the fold | Lower completion, and lower-quality leads |
| 14 | **Typography is too small and too even** | 11–13px uppercase labels everywhere, and section titles barely larger than panel titles | Nothing leads the eye. Every section has equal weight |
| 15 | **Spelling and consistency** | "Cards IQ", "live commerces", "fulfilment", "card shop, re-pack companies", "What are you usignt" | Mostly fixed on live, but still in the design source |

---

## Page-by-page conversion goal

| Page | Primary visitor | Primary CTA | Secondary CTA | The one idea the page must sell |
|---|---|---|---|---|
| **How it works → Platform** (flagship) | Anyone new to CardsIQ, from collectors to businesses | **Create account** | Become a partner | CardsIQ is the operating layer: one persistent record per card, across every workflow |
| **Instant Buybacks** | Breakers and buyback-capital partners | **Become a buyback partner** | See hit to settlement (in-page) | A hit becomes cash for the buyer in minutes, on rules the business controls |
| **Inventory Management** | Card shops, breakers, repack companies, show vendors | **Become a partner** | See intake to outcome (in-page) | Inventory is an operating record, not a spreadsheet row, from scan to sold |
| **StreamIQ** | Breakers and live-commerce operators | **Become a partner** | Watch a break run (in-page) | The stream *is* the business system. Every on-camera event writes to CardsIQ |
| **Become a Partner** | Qualified hobby businesses | **Submit inquiry** | Collector? Create account | Starting a conversation with an infrastructure partner |
| **About** | Late-stage evaluators checking credibility | **Become a partner** | Create account | Why connected infrastructure is necessary, and what CardsIQ believes |

### Answers to the brief's key questions (condensed)

- **Value prop in 5 seconds?** Headlines pass. Heroes fail because the visual (feature pills, dashboard tiles) doesn't *show* the claim.
- **Features or outcomes?** Mostly features ("Break Fills / Live Production / Offer Delivery"). Outcomes ("buyer gets paid", "no reconciliation") are buried in body copy.
- **Proof buried?** Yes. The best proof (the event trail from hit to paid, the inventory ledger) sits at the bottom inside small panels.
- **Screenshots too small?** Yes. The inventory directory is a 600px thumbnail, and StreamIQ's best UI is a laptop mockup.
- **Why is CardsIQ different from using multiple tools?** The idea exists ("Infrastructure, not another destination") but it's a closing tagline, not an argument.
- **Physical card ↔ software relationship?** Not shown anywhere as a single image.
- **Credible to a large breaker or marketplace?** Not yet. Contradictory data, pasted copy, and a missing trust layer.
- **What blocks a qualified prospect?** No route to act early, no answer to "do we have to buy everything / replace our tools", and a partner form that promises nothing about next steps.

---

## Recommended information architecture

```
Platform (/how-it-works)      ← flagship; absorbs /about's overview story
 ├─ Instant Buybacks           ← financial; transaction-led
 ├─ Inventory Management       ← operational; record-led
 ├─ StreamIQ                   ← live; time/event-led
 ├─ About (/about)             ← trust page: beliefs, problem, who it's for (no feature tour)
 └─ Become a Partner           ← conversion page; form above the fold
```

**Consolidation:** `/how-it-works` becomes the single "what is CardsIQ" page. It uses "One operating system for the modern hobby." as the hero and "Connect every hobby workflow in one place." as the product-modules section. `/about` keeps its URL, but its job changes to trust and belief: the problem, the operating principles, and who it serves. It no longer repeats the operating graph. Both routes stay live, so nothing breaks.

**Shell for logged-out visitors:** keep the sidebar and search, and replace the wallet, notifications, and Logout with **Sign in / Create account**. Add a *Platform* nav group (How it works, Instant Buybacks, Inventory Management, StreamIQ, About, Become a partner) above the existing Licensed Repacks group.

## CTA system

- **Exactly two labels site-wide:** `Create account` (self-serve) and `Become a partner` (business; on Buybacks: `Become a buyback partner`). No "Talk to sales", "Get started", or "See it in action" variants pointing at the same destination.
- **Hero:** one primary button and one secondary. The secondary is either the *other audience's* path or an in-page anchor. Two buttons never lead to the same place.
- **After the hero:** a compact sticky CTA in the top bar keeps the page's primary action one click away.
- **Partner links carry intent:** `become-a-partner?interest=instant-buybacks` pre-selects *Primary interest*. This means less typing and better routing.
- **Closing CTA:** a shared button style with a page-specific composition and reason (see the redesign plan).

## Data and claims hygiene (do before production)

1. Use one canonical demo dataset across pages: the same Burrow record, Stream #1842, Break 04, and @northstarcards everywhere. The "one record" story then becomes literally true across the site.
2. Match every grade and cert to the slab photo it appears with.
3. Remove or source "68% faster", "98.4%", "+12.4%", and any portfolio-level stats. Keep numbers inside product UI, labelled as product views.
4. Confirm that ALT, Card Ladder, PSA/BGS/SGC cert data, OBS, and the licensed repack names (HG Breaks, Rogue Rips) can be named publicly before any logo wall is built.
