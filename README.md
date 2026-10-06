# CardsIQ static pages: redesign demo

This is a reviewable, framework-free prototype of the redesigned CardsIQ sales pages. It's built *around the approved CardsIQ content*: copy from the live dev pages, the supplied PDFs, and the brief. It runs entirely on its own and does not touch the production app, APIs, auth, or data.

## Run it

**Option A: open the file.** Double-click `design-demo/index.html`, or open it in Chrome, Edge, Safari, or Firefox. Everything uses relative paths, so it works from `file://`.

**Option B: serve it locally** (closer to production, and lets you test on a phone over your LAN):

```bash
npx serve design-demo
```

Then open the printed URL (usually http://localhost:3000). Any static server works, for example `python -m http.server` run inside `design-demo/`.

Fonts (Outfit, Geist Mono) load from Google Fonts. Offline, the pages fall back to system fonts.

## Pages

| Demo file | Production route | Primary CTA |
|---|---|---|
| `index.html` | (demo hub) | n/a |
| `platform.html` | `/how-it-works` (flagship; absorbs the duplicate overview story) | Create account · Become a partner |
| `instant-buybacks.html` | `/instant-buybacks` | Become a buyback partner |
| `inventory-management.html` | `/inventory-management` | Become a partner |
| `streamiq.html` | `/streamiq` | Become a partner |
| `become-a-partner.html` | `/become-a-partner` | Submit inquiry |
| `about.html` | `/about` (re-focused on trust) | Become a partner · Create account |

### Useful review switches

- `?auth=member`: preview the signed-in shell (wallet balance, notifications, Logout) on any page.
- `become-a-partner.html?interest=instant-buybacks`: the CTA on each product page pre-selects *Primary interest* this way. Other values are `inventory-management`, `streamiq`, and `licensed-repacks`.
- **Reduced motion:** turn on your OS "reduce motion" setting. Every animated sequence then renders its end state with no timers. Without it, sequences play once and hold. The long ones (the Platform lifecycle and the StreamIQ event rail) have Pause / Play / Replay controls.
- **Demo routes:** *Create account* and *Sign in* show a notice instead of navigating. To wire production URLs, set them in `assets/js/shell.js` → `CIQ.routes`.

## What's where

```
design-demo/
  CRO-AUDIT.md          findings, page goals, IA + CTA strategy
  REDESIGN-PLAN.md      page architecture, visual system, components, canonical dataset
  index.html            demo hub
  *.html                one file per page
  assets/css/ciq.css    shared tokens, type, shell, buttons, product-UI primitives, record language, lifecycle, motion
  assets/css/page-*.css page compositions (layout uses @container queries on the content column)
  assets/js/shell.js    app shell (sidebar, top bar, account controls), route config, icon registry
  assets/js/ciq.js      reveal, stage sequences, count-up, card tilt, tabs, drawer, CTA routing, footer
  assets/js/page-*.js   page-specific behavior (hero wires, lifecycle detail, live event rail, form, …)
  assets/img/slabs/     PSA slab photography extracted from the supplied design files
  assets/img/brand/     CardsIQ mark + lockup (rendered from the PDFs; swap for /cardsiq-logo-lockup.svg)
  tools/shoot.mjs       headless screenshot + overflow/console checker
```

## Screenshot checker (optional)

The checker uses your installed Chrome or Edge. No browser download is needed.

```bash
cd design-demo/tools && npm install
```

```bash
cd design-demo && node tools/shoot.mjs platform.html shots/platform.png 1440 900 tiles
```

The modes are `1` (full page), `0` (first viewport), and `tiles` (viewport captures down the page). The flags are `--reduced`, `--member`, and `--scroll=#section`. The JSON output reports horizontal overflow (and its culprits) and console errors.

## Review status

One agent built each page, an independent agent reviewed it (CRO, art direction, copy fidelity, data, responsive, accessibility), and the builder fixed what came back. A second review then checked consistency across all pages, and a skeptical verifier pass confirmed or rejected each finding. All confirmed findings are fixed. The final validation results and the list of **copy to confirm** are in REDESIGN-PLAN.md §7.

## Notes and limitations

- **Live audit access.** dev.cardsiq.io sits behind a client-side password gate. The agent did not type the test credentials, because policy forbids entering passwords on non-local sites. The audit used each page's server-rendered copy, which is delivered before the gate, together with the V3 PDFs. To compare visually, log in yourself and open the demo side by side.
- **Data.** All product-view numbers are illustrative and are labelled that way in the footer. They come from one canonical dataset (see REDESIGN-PLAN.md §1), and grades and certs match the slab photos. Nothing is presented as company-wide performance.
- **Names.** ALT, Card Ladder, PSA, BGS, SGC, OBS, HG Breaks, and Rogue Rips appear as text only, because they appear in the current product or site. Confirm public-naming permissions before adding any logos.
- **Images.** The Burrow slab photo is only 380px wide in the source files. Use the original photography in production.
- **Porting.** Each section maps 1:1 onto a React component in the existing Next.js app. The tokens in `ciq.css` map onto the app's Tailwind v4 theme, and the partner form's `submitInquiry()` adapter is the single function to connect to the existing submission handler.
