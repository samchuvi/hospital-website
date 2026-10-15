# Hospital Website

A modern, responsive public website for a hospital in Uganda, with online appointment requests and a contact form.

- **Frontend** (`client/`): React 19 + Vite, React Router, plain CSS design system, self-hosted fonts. Deploys to **Vercel**.
- **API** (`server/`): Node.js + Express. Validates, rate-limits and stores appointment requests and contact messages, emails staff (optional), and lets authorised staff export requests. Deploys to **Render** (free) with **MongoDB Atlas** (free).

> The site ships in **draft mode** with clearly marked `[… to be confirmed]` placeholders. No hospital name, staff, credentials, contact details, opening hours or services have been invented. While in draft mode every page carries `noindex` so placeholder content is never indexed.

---

## Pages

| Route | Contents |
|---|---|
| `/` | Hero, quick actions (appointment / call / directions), services overview, about intro, team preview (only when doctors are configured), "visiting us", appointment call-to-action, contact + map |
| `/about` | Overview, history, mission & vision, values, facilities, photo section |
| `/services` | Service cards with "Request appointment" links (pre-selects the service in the form) |
| `/doctors` | Team directory with department filter; empty state until real staff are added |
| `/appointments` | Appointment request form with validation, loading, success (reference number) and error states |
| `/contact` | Contact details, contact form, Google Maps location and directions |
| `/gallery` | Photo grid with category filter and lightbox; labelled placeholders until photos are added |
| `/faq` | Accordion of common questions (answers adapt to the configured details) |
| `/privacy` | Privacy policy **template** — flagged for hospital review |
| `*` | Custom 404 page |

Also included: sticky header with mobile menu (focus-trapped, Escape to close), skip link, breadcrumbs, back-to-top button, WhatsApp button (only once a number is configured), click-to-call and click-to-email links, per-page titles/descriptions/Open Graph tags, `Hospital` structured data (only from filled-in fields), `robots.txt`, `sitemap.xml`, favicon, social share image, reduced-motion support.

---

## 1. Run it locally

Requires Node.js 20+.

```powershell
cd hospital-website
npm run install:all

# Terminal 1 — API on http://localhost:4000
cd server
copy .env.example .env      # macOS/Linux: cp .env.example .env
npm run dev

# Terminal 2 — website on http://localhost:5173
cd client
npm run dev
```

In development the website proxies `/api` to the local API, and requests are saved to `server/data/requests.json`.

## 2. Add the hospital's real details

**Everything hospital-specific is in one file: `client/src/config/hospital.js`.** Leave a value as `null` until the hospital confirms it.

Checklist before publishing:

- [ ] `name`, `shortName`, `tagline`, `logo` (put logo file in `client/public/images/`)
- [ ] `contact.phone`, `contact.email`, `contact.whatsapp` (digits only, e.g. `256700000000`)
- [ ] `address` fields and `location.mapEmbedUrl` / `location.mapLink` (see below)
- [ ] `openingHours` (add `schema: 'Mo-Fr 08:00-17:00'` to each entry for search engines)
- [ ] `emergencyNote` — only if the hospital confirms a 24-hour/emergency service
- [ ] `about` (overview, mission, vision, values, history, facilities)
- [ ] `services` — delete services not offered, edit wording, set `verified: true` on confirmed ones
- [ ] `doctors` — only staff who approved publication, with verified qualifications
- [ ] `gallery` — authorised photos in `client/public/images/gallery/` (no identifiable patients without consent). The first two images also appear on the home page.
- [ ] `social` — only accounts the hospital owns
- [ ] Privacy policy (`client/src/pages/Privacy.jsx`) reviewed and completed by the hospital; set `LAST_UPDATED`
- [ ] Brand colours in `client/src/styles/tokens.css` if the hospital has its own
- [ ] Finally set **`draftMode: false`** (removes the preview banner and draft badges, hides unverified services, allows indexing)

**Google Maps (free, no API key):** open Google Maps, search for the hospital's verified listing → *Share* → *Embed a map* → copy only the `src="…"` URL into `location.mapEmbedUrl`. Then *Share* → *Send a link* → copy into `location.mapLink` (used by the "Get directions" button).

## 3. Tests

```powershell
npm test                 # API tests (11) + client validation tests (5)
npm --prefix client run build
```

API tests cover: storing a valid request, field validation, honeypot and too-fast bot rejection, malformed JSON, contact messages, admin authentication and CSV export, CORS allow-list, rate limiting, and refusing (503) rather than faking success when no storage is configured.

## 4. Deploy

### 4a. Database — MongoDB Atlas (free M0)
1. Create a free cluster at <https://www.mongodb.com/cloud/atlas>.
2. *Database Access*: create a user with a strong password. *Network Access*: allow `0.0.0.0/0` (Render free instances have no fixed IP).
3. *Connect → Drivers*: copy the connection string (`mongodb+srv://…`). This is `MONGODB_URI`.

### 4b. API — Render (free web service)
1. Push this project to a GitHub repository.
2. Render → *New* → *Blueprint* → select the repo (uses `render.yaml`). Or create a Web Service with root directory `server`, build `npm ci`, start `npm start`.
3. Set environment variables (see `server/.env.example`):
   - `MONGODB_URI` — from Atlas
   - `ALLOWED_ORIGINS` — your Vercel URL(s), e.g. `https://your-hospital.vercel.app` (add the custom domain later)
   - `ADMIN_API_KEY` — auto-generated by the blueprint (copy it from the dashboard and keep it private)
   - `HOSPITAL_NAME`, and email settings if wanted (4d)
4. Check `https://<your-api>.onrender.com/api/health` → `{"ok":true,"storage":"mongodb",…}`.

> Render free services sleep after inactivity; the first form submission after a quiet period can take ~30–60 seconds. The form shows a loading state and times out after 20 s with a clear message. A paid instance (or any always-on host) removes this. **Without `MONGODB_URI` the production API refuses submissions** (the form shows an error and asks people to call) instead of saving them to a disk that would be wiped.

### 4c. Website — Vercel
1. Vercel → *Add New Project* → import the repo → **Root Directory: `client`** (framework: Vite, settings come from `client/vercel.json`).
2. Environment variables:
   - `VITE_API_URL` = `https://<your-api>.onrender.com`
   - `VITE_SITE_URL` = the public site URL (e.g. `https://your-hospital.vercel.app`, later the real domain)
3. Deploy. `vercel.json` rewrites all routes to `index.html` so refreshing `/services` etc. works, adds security headers, and caches hashed assets for a year.
4. Add the Vercel URL to `ALLOWED_ORIGINS` on Render if you haven't already.

If `VITE_API_URL` is not set, the site still works but the forms clearly say online requests are not switched on yet and point visitors to the phone number.

### 4d. Email notifications (optional)
Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` and `NOTIFY_EMAIL` on the API. Any SMTP provider works, e.g. Brevo (free tier, `smtp-relay.brevo.com:587`) or a Google Workspace / Gmail account with an *app password* (`smtp.gmail.com:587`). Set `SEND_PATIENT_ACK=true` to also email patients a "request received — not yet confirmed" note. `/api/health` reports `"email": true` once configured. If email fails, the request is still saved and the failure is logged.

### 4e. Custom domain
Buy/point the domain (e.g. a `.ug` domain from a local registrar) in Vercel → *Settings → Domains*. Then update `VITE_SITE_URL` (redeploy) and `ALLOWED_ORIGINS`.

## 5. How staff access requests

Requests are stored in MongoDB. Authorised staff (or the site administrator) can:

**Download a CSV** (opens in Excel):
```powershell
$key = "<ADMIN_API_KEY>"
Invoke-WebRequest -Uri "https://<your-api>.onrender.com/api/admin/appointments?format=csv" -Headers @{ Authorization = "Bearer $key" } -OutFile appointments.csv
Invoke-WebRequest -Uri "https://<your-api>.onrender.com/api/admin/messages?format=csv" -Headers @{ Authorization = "Bearer $key" } -OutFile messages.csv
```
(macOS/Linux: `curl -H "Authorization: Bearer $KEY" "https://…/api/admin/appointments?format=csv" -o appointments.csv`)

**Or from the project folder:** `npm --prefix server run export-requests -- appointments > appointments.csv` (uses the `MONGODB_URI` in `server/.env`).

**Or** read them in MongoDB Atlas → *Browse Collections* (`appointments`, `messages`), and via email notifications if configured.

Keep `ADMIN_API_KEY` secret; rotate it in Render if it is ever shared. CSV exports neutralise spreadsheet formula injection. This is intentionally *not* a patient-records system — that belongs in the separate hospital management system.

## 6. Security and privacy measures

- Server-side validation and sanitisation of every field; unexpected fields are ignored; 10 KB body limit
- Honeypot field and minimum fill time to block bots; rate limiting (5 submissions / 15 min per IP by default)
- Helmet security headers, strict CORS allow-list, `x-powered-by` removed, generic error messages
- Admin endpoints use a constant-time key comparison and are separately rate-limited
- Forms explicitly ask visitors **not** to submit medical history, results or ID numbers; only contact and scheduling details are collected
- Appointment requests are always described as **requests**, never confirmed appointments
- No analytics, ad trackers or cookies; fonts are self-hosted (no Google Fonts calls). Google Maps loads only where the hospital's map is embedded.

## 7. Google Search Console (after the domain is live and `draftMode` is `false`)
1. Go to <https://search.google.com/search-console> → *Add property* → *Domain* → enter the domain.
2. Verify with the DNS TXT record Google provides (add it at your domain registrar; for Vercel-managed DNS add it in Vercel → Domains).
3. *Sitemaps* → submit `https://<domain>/sitemap.xml` (generated at build when `VITE_SITE_URL` is set).
4. Use *URL Inspection* on the home page → *Request indexing*.
5. Also create/claim the hospital's **Google Business Profile** with the same name, address and phone — this matters most for local "hospital near me" searches.

## 8. Project structure

```
hospital-website/
├─ client/                     React + Vite website
│  ├─ public/                  favicon, share image, images/gallery/
│  ├─ scripts/generate-seo-files.mjs   robots.txt + sitemap.xml after build
│  ├─ src/config/hospital.js   ← ALL hospital details
│  ├─ src/config/routes.js     page list (nav + sitemap)
│  ├─ src/components/          Header, Footer, ServiceCard, MapSection, Field, Seo, …
│  ├─ src/pages/               one file per page
│  ├─ src/hooks/, src/lib/     form submission, validation, API client
│  ├─ src/styles/              tokens, base, components, pages
│  └─ vercel.json
├─ server/                     Express API
│  ├─ src/app.js               routes, security, admin export
│  ├─ src/validation.js, storage.js (MongoDB / file), mailer.js, config.js
│  ├─ scripts/export-requests.js
│  └─ tests/api.test.js
└─ render.yaml                 Render blueprint for the API
```

## 9. Performance notes
Pages other than Home are code-split and load on demand. CSS is ~9 KB gzipped; the React vendor bundle is cached for a year on Vercel. Images use lazy loading — export gallery photos at ~1600 px wide, ideally WebP, under ~250 KB each.
