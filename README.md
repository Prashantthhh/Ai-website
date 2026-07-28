# PAIRADOX — AI Automation Studio

Awwwards-style dark landing site. Pure HTML/CSS/JS — **no build step, no dependencies**. Deploys to Vercel as-is.

Live content: services (voice agents, lead scraping, workflow automation), projects
(Voice Agent for Appointment Booking, AI Lead Scraper — LinkedIn), team (Prashasth
Kamidri & Vyshnav Katamreddy) with LinkedIn / GitHub / email links.

## Files

| File | What it is |
|---|---|
| `index.html` | All content — text, links, team info |
| `styles.css` | Design system (tokens from `unified-architecture-DESIGN.md`) |
| `script.js` | Canvas topology animation, reveals, counters, custom cursor |
| `vercel.json` | Clean URLs + security headers |

## Editing

Everything lives in `index.html`. The hero metrics (uptime / pickup / hours saved)
are marked with an `EDIT:` comment — swap in real numbers as they grow. To add a
team member or project, copy an existing `.team-card` or `.momentum-row` block.

## Deploy to Vercel

**Option A — drag & drop (fastest):** go to [vercel.com/new](https://vercel.com/new), drag this folder in. Done.

**Option B — CLI:**
```bash
npm i -g vercel
cd "startup website"
vercel --prod
```

**Option C — Git (recommended for updates):** push this folder to a GitHub repo, then
import the repo at vercel.com/new. Framework preset: **Other**, no build command,
output directory: root. Every push auto-deploys.

## Preview locally

Open `index.html` in a browser, or:
```bash
npx serve .
```
