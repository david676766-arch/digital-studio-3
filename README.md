# DIGITAL STUDIO — premium digital studio website

Luxury black-and-gold website for an international digital studio: obsidian `#090909`,
ivory `#F4F1EA`, champagne gold `#B89B65` and graphite.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · GSAP · Lenis

---

## Quick start

Requirements: **Node.js 20.9+** (Node 22 LTS recommended).

```bash
cd digital-studio
npm install
npm run dev          # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

Type-check only: `npm run typecheck`

> `next/font` downloads Cormorant Garamond and Manrope (including Cyrillic) during the first build,
> so building requires an internet connection.

---

## Contact form — how to connect it

The form validates input and sends it to `/api/contact`, which delivers inquiries to the
channels you configure. **Until at least one channel is configured, nothing is delivered.** In
that case the website tells the visitor plainly that the message was *not* sent, keeps the text in
the form, and offers **Send by email** (pre-filled email to Digitalst@gmail.com) and
**Open Telegram** buttons. It never shows a false "sent" message.

Copy `.env.example` to `.env.local` (or add the variables in your hosting dashboard), then choose
one option or both:

### Option A — Telegram bot (recommended)
1. In Telegram, open **@BotFather**, send `/newbot` and copy the **token**.
2. Send any message to your new bot.
3. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy the number in `"chat":{"id": …}`.
4. Set the two variables:
   ```
   TELEGRAM_BOT_TOKEN=123456:ABC...
   TELEGRAM_CHAT_ID=123456789
   ```

### Option B — any webhook
Set `CONTACT_WEBHOOK_URL` to a URL that accepts JSON: Zapier, Make, n8n, a Slack incoming
webhook, a CRM, or an email service such as Formspree. Every inquiry is POSTed there as JSON.

Restart `npm run dev` (or redeploy) after changing environment variables. The visitor sees
"Thank you" only after a channel has confirmed delivery.

---

## Languages & URLs

| URL | Page |
| --- | --- |
| `/` | permanent redirect → `/en` (English is the primary language) |
| `/en`, `/de`, `/uk` | Home page in English, German, Ukrainian |
| `/{lang}/services/website-development` · `video-editing` · `digital-advertising` · `brand-identity` | Service pages |
| `/{lang}/work/{project}` | Concept project pages |
| `/work/{project}` (old URLs) | permanent redirect → `/en/work/{project}` |

Every page is server-rendered in its language (`<html lang>`, metadata and content). The UA / EN / DE switcher
opens the same page in the other language. Unknown URLs return a 404 (localized inside a language folder).

## SEO

- Unique title and meta description for each of the 27 pages (9 pages × 3 languages)
- Self-referencing canonical URL on every page
- `hreflang` alternates for `en`, `de`, `uk` and `x-default` (→ English) on every page and in the sitemap
- `sitemap.xml` with all 27 canonical URLs plus language alternates. `robots.txt` allows everything except `/api/`
- Open Graph and Twitter cards (1200×630 image `public/og-image.jpg`, localized `og:locale`)
- JSON-LD: `Organization` (name, website, email, phone, Telegram, contact languages), `WebSite`,
  `Service` on each service page, `BreadcrumbList` on service and project pages. **No address, ratings,
  reviews, customer numbers, awards or founding date are published.** Add these only once they are real.
- Semantic HTML: one `h1` per page, ordered headings, breadcrumb navigation, `lang` attributes,
  descriptive alt text in all three languages

### Before going live
1. **Set `NEXT_PUBLIC_SITE_URL`** to your domain (e.g. `https://digitalstudio.com`). It's used in the canonical, hreflang,
   sitemap, robots and structured data URLs. On Vercel the production domain is detected automatically
   (`VERCEL_PROJECT_PRODUCTION_URL`), but setting the variable explicitly is recommended. The build prints a warning when neither is set.
2. Deploy, then add the domain to **Google Search Console** and **Bing Webmaster Tools** and submit
   `https://your-domain/sitemap.xml`.
3. Validate a few URLs with Google's Rich Results Test and a social preview debugger.

## Configuration (`src/config/site.ts`)

| Setting | Notes |
| --- | --- |
| `site.contacts` | Email **Digitalst@gmail.com**, Telegram **@davu_li** (https://t.me/davu_li), phone **+38097847158**. They are used in the contact cards, mobile menu, footer, service pages and structured data. |
| `site.socials` | Empty by default. Add `{ label, href }` entries only for real profiles. They then appear in the footer and in the structured data (`sameAs`). |
| `SERVICE_SLUGS` | URL slugs of the service pages. |
| `PROJECTS` | The four concept projects and their mockup themes. |
| `photos` | Unsplash photo IDs. Credits appear in the footer. |

Copy for all three languages lives in `src/i18n/en.ts`, `uk.ts` and `de.ts`. This includes the SEO titles and descriptions
(`seo`, `servicePages.items.*.metaTitle/metaDescription`) and image alt text (`media.alts`). The English
file defines the structure, so TypeScript fails the build if a key is missing in UA or DE.

## Performance notes

- Images are served by Unsplash's CDN in AVIF/WebP at the exact width each layout needs
  (`next/image` + responsive `sizes`). They are lazy-loaded below the fold, and the main image on service pages is prioritised.
  The browser preconnects to the image CDN early.
- Fonts are self-hosted by `next/font` with `display: swap` and fallback metrics, which avoids layout shift.
- The hero shader pauses when off-screen or in a background tab, and renders at reduced resolution on touch devices.
- The cinematic intro plays **once per browser session**. Repeat visits and deep links (e.g. `/en#contact`)
  show content immediately. On a first visit the intro delays the hero headline by about 3.5 s, which affects
  Largest Contentful Paint for that one view.
- All pages are statically generated at build time. Security and caching headers are set in `next.config.ts`.

## What's on the site

- **Loading animation:** a WebGL liquid-gold wave reveals and then washes away the DIGITAL STUDIO
  title (about 3.5 s). It has a Skip button and works with `Esc`. It plays once per browser session. A calm fade is used for reduced motion, and a CSS version when WebGL is unavailable.
- **Hero:** real-time WebGL golden silk with floating particles, a slowly sweeping light reflection and a
  gentle response to the mouse. It pauses when off-screen. A pause button is provided. Under reduced motion the
  hero shows a static frame. Without WebGL it falls back to the looping video, then to a photo.
  The headline reveals word by word, followed by the magnetic **LET'S WORK TOGETHER** button.
- **Motion:** Lenis smooth scrolling (desktop pointers only, off for reduced motion), word-by-word text reveals,
  curtain-reveal images, GSAP parallax, magnetic buttons, gold section dividers that draw in, and
  a custom gold cursor (desktop mouse only, with a "View" label on projects).
- **Services:** Website Development, Video Editing, Digital Advertising and Brand Identity. Each has a photo,
  description, deliverables and a **Send an inquiry** button that pre-selects that service in the form.
- **Portfolio:** four **concept projects** for fictional brands, each clearly labelled as a concept.
  CSS MacBook + iPhone mockups show fully designed concept websites that scroll on hover. Each
  project has its own page at `/work/<slug>` with desktop and three mobile screens, the idea, the approach,
  a palette, typography and a disclaimer.
- **About:** vision, creative philosophy, what makes the studio different, and how it works. There's no invented
  history, team members, clients or metrics.
- **Process:** an animated timeline: 01 Discovery · 02 Strategy · 03 Design · 04 Development · 05 Launch.
- **Contact:** LET'S CREATE SOMETHING GREAT., three contact cards with a gold hover, a large Telegram CTA and
  the project inquiry form (full name, email, service, optional budget, description). The form has validation,
  a loading state, and success, not-connected and error messages.
- **Navigation:** Home · Services · Work · About · Process · Contact. On narrow screens it's an animated
  full-screen menu with your contact links and the language switcher.
- **Languages:** 🇺🇦 UA / 🇬🇧 EN / 🇩🇪 DE, with separate URLs (see above). Every section, button, form message and notification is translated.
  The text inside the device mockups is intentionally left as the fictional brands' own English copy (marked `lang="en"`).
- **Service pages:** each service has its own page with a breadcrumb, details, approach, a related concept project and an inquiry link
  that pre-selects the service in the form.

## Project structure

```
src/
  app/
    [locale]/layout.tsx                  <html lang>, fonts, base metadata, Organization JSON-LD, header/footer
    [locale]/page.tsx                    home page (+ localized metadata)
    [locale]/services/[service]/page.tsx service pages (+ Service & Breadcrumb JSON-LD)
    [locale]/work/[slug]/page.tsx        concept project pages
    [locale]/not-found.tsx  [locale]/[...rest]/page.tsx   localized 404
    layout.tsx  not-found.tsx            pass-through root + global 404
    sitemap.ts  robots.ts  icon.svg  api/contact/route.ts
  components/
    Intro.tsx  Hero.tsx  Services.tsx  ServicePage.tsx  Portfolio.tsx  ProjectDetail.tsx  Devices.tsx
    About.tsx  Process.tsx  Contact.tsx  Header.tsx  Footer.tsx  Cursor.tsx  SmoothScroll.tsx  ui.tsx
  lib/
    goldSilk.ts      hero WebGL silk + particles shader
    liquidGold.ts    intro WebGL liquid-gold shader
    scroll.ts        smooth-scroll controller and scroll locking
    seo.ts           site URL, metadata/hreflang builder, structured data
    intro.tsx  images.ts
  i18n/              en / uk / de dictionaries, locale config, LanguageProvider
  config/site.ts     contacts, services, photos, concept projects
public/videos/       hero.mp4 + poster (fallback when WebGL is unavailable)
```

## Replacing concept projects with real work

Edit `PROJECTS` in `site.ts` and `work.items` in the three language files. For real case studies,
remove the "Concept project" badges (`t.work.conceptBadge`) and the disclaimer copy (`work.notice`,
`work.disclaimer`, `work.typeValue`).
