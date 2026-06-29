# Pastor Site — Light & Grace

A bilingual (EN/ZH) Christian ministry website built with Astro, featuring:

- **Personal testimony** with photo carousel (Hero section)
- **3D Scripture verse carousel** with CSS 3D transforms
- **Product showcase** with size selection, cart, and WhatsApp checkout
- **Prayer request form** with Cloudflare Workers backend + Google Sheets integration
- **i18n routing** — auto-detects browser language, manual toggle available

## Tech Stack

- **Astro 5** — static site generation + island architecture
- **Tailwind CSS** — utility-first styling
- **Swiper.js** — mobile product carousel (CDN)
- **Cloudflare Pages** — hosting + Functions for prayer form API
- **Cloudflare D1** — prayer request database (optional)
- **Google Sheets** — prayer request viewer dashboard

## Project Structure

```
src/
  layouts/BaseLayout.astro    — Shared layout (nav, footer, WhatsApp button)
  components/
    Hero.astro                — Testimony + photo fade carousel
    Scripture3D.astro         — 3D rotating Scripture cards
    ProductShowcase.astro     — Product grid + Swiper + cart drawer
    PrayerForm.astro          — Prayer request form
  pages/
    index.astro               — Language redirect
    en/index.astro            — English homepage
    zh/index.astro            — Chinese homepage
  content/
    hero.json                 — Hero section text (en/zh)
    products.json             — Product catalog
    scriptures.json           — Scripture verses
    site.json                 — Site config (name, WhatsApp, email)
  stores/cart.ts              — Shopping cart state (nanostores + localStorage)
functions/api/prayer.js       — Cloudflare Pages Function for prayer form
```

## How to Edit Content

All content is in JSON/MD files under `src/content/`. No coding needed:

| Task | File |
|------|------|
| Change your name, testimony, verse | `src/content/hero.json` |
| Add/remove products | `src/content/products.json` |
| Change Scripture verses | `src/content/scriptures.json` |
| Update WhatsApp number, email | `src/content/site.json` |
| Replace photos | `public/images/hero-*.svg` → upload real `.jpg` files, update paths in `Hero.astro` |

Changes are deployed automatically via GitHub + Cloudflare Pages integration.

## Local Development

```bash
npm install
npm run dev
```

## Deployment

1. Push to GitHub
2. Connect repo to Cloudflare Pages
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy

### Prayer Form Backend (Cloudflare Pages Functions)

1. Create D1 database: `wrangler d1 create pastor-db`
2. Run schema: `wrangler d1 execute pastor-db --file=src/content/schema.sql`
3. Bind D1 in Cloudflare Pages dashboard → Settings → Functions → D1 database bindings
4. (Optional) Add `GOOGLE_SHEETS_WEBHOOK` environment variable for Google Sheets integration
