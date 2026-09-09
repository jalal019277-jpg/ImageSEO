# AI Image SEO Optimizer

A single-page Next.js app that takes an image URL plus your brand context, hands both to an
n8n workflow, and returns a compressed image with AI-generated SEO metadata — filename, alt
text, title, caption, description and keywords.

Built with **Next.js 15 (App Router)**, **TypeScript** (strict) and **Tailwind CSS v4**.
Deploys to Vercel with no extra configuration.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # then set N8N_WEBHOOK_URL
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable                  | Required | Description                                                                 |
| ------------------------- | -------- | --------------------------------------------------------------------------- |
| `N8N_WEBHOOK_URL`         | yes      | Production webhook URL of your n8n workflow. Server-side only — never exposed to the browser. |
| `N8N_WEBHOOK_AUTH_HEADER` | no       | Header name for the shared secret. Defaults to `x-api-key`.                  |
| `N8N_WEBHOOK_AUTH_TOKEN`  | no       | Shared secret value. Sent only when set — pair it with an n8n *Header Auth* credential. |
| `N8N_TIMEOUT_MS`          | no       | How long to wait for n8n. Defaults to `240000` (4 minutes).                   |

On Vercel, add the same variables under **Project → Settings → Environment Variables**.

---

## Folder structure

```
app/
  layout.tsx                Root layout, metadata, fonts, global styles
  page.tsx                  The single page: form → processing → results
  globals.css               Tailwind v4 theme tokens and component classes
  api/
    image-seo/route.ts      Validates the form payload and proxies it to n8n
    download/route.ts       Streams the optimized image back as an attachment
components/
  Hero.tsx                  Landing header
  ImageSeoForm.tsx          Image URL + brand fields + output settings
  Field.tsx                 TextField / TextAreaField / SectionHeading
  FormatSelector.tsx        PNG · JPG/JPEG · WEBP selectable cards
  AiToggle.tsx              "Enable AI Image Analysis" switch
  ProcessingState.tsx       Staged loading indicator
  ResultsPanel.tsx          Results screen + download actions
  ImageComparison.tsx       Original vs optimized previews and stats
  SeoMetadataCard.tsx       Metadata fields with per-field copy buttons
  CopyField.tsx             CopyField + CopyButton
  ErrorBanner.tsx           Inline failure state with retry
  Icons.tsx                 Inline SVG icon set (no icon dependency)
services/
  imageSeoService.ts        Browser → /api/image-seo, form → payload mapping
  n8nClient.ts              Server → n8n webhook (auth, timeout, errors)
  n8nResponse.ts            Normalizes whatever shape n8n returns
lib/
  utils.ts                  Byte/dimension formatting, URL + filename validation
  download.ts               Blob/JSON/image downloads, clipboard helper
types/
  index.ts                  Shared request/response contracts
```

---

## The n8n contract

### What the app sends (`POST` to `N8N_WEBHOOK_URL`)

```json
{
  "image_url": "https://cdn.example.com/photo.jpg",
  "output_format": "webp",
  "use_ai_analysis": true,
  "brand": {
    "company_name": "Northwind Coffee Roasters",
    "industry": "Specialty coffee & e-commerce",
    "target_audience": "Home baristas aged 25–45",
    "target_market": "United Kingdom & Ireland",
    "primary_keyword": "single origin coffee beans",
    "secondary_keywords": ["ethiopian roast", "pour over beans"],
    "brand_description": "Small-batch, single-origin beans shipped within 48 hours of roasting."
  }
}
```

`output_format` is always one of `png`, `jpg`, `webp` (`jpeg` is normalized to `jpg`, and an
unknown value falls back to `webp`). When the toggle is off the payload carries
`"use_ai_analysis": false` so the workflow can skip the vision step.

### What the app expects back

The response is normalized, so any of these work: a bare object, an array of items, or an
`{ json: ... }` / `{ data: ... }` envelope; `snake_case` or `camelCase` keys; sizes as numbers
(`184320`) or strings (`"180.5 KB"`); the optimized image as a URL, a `data:` URL, or a bare
base64 string. The canonical shape is:

```json
{
  "original":  { "url": "https://…", "size": 1843200, "width": 1920, "height": 1280, "format": "jpeg" },
  "optimized": { "url": "https://…", "size": 412300,  "width": 1600, "height": 1067, "format": "webp" },
  "seo": {
    "filename": "single-origin-coffee-beans.webp",
    "alt_text": "Freshly ground single origin coffee beans beside a pour over brewer",
    "title": "Single Origin Coffee Beans | Northwind Coffee Roasters",
    "caption": "Small-batch Ethiopian beans, roasted and shipped within 48 hours.",
    "description": "A close-up of single origin coffee beans next to a pour over setup…",
    "primary_keyword": "single origin coffee beans",
    "secondary_keywords": ["ethiopian roast", "pour over beans"]
  }
}
```

Anything missing degrades gracefully: the submitted URL stands in for a missing original
preview, `size_reduction_percent` is computed from the two sizes when absent, and empty
metadata fields render as "Not returned by the workflow".

### Ready-made test workflow

`n8n/ai-image-seo-optimizer.test-workflow.json` is an importable workflow that runs the whole
round trip **without any credentials**. In n8n: *Workflows → ⋯ → Import from File*, open the JSON,
activate it, then copy the Webhook node's Production URL into `N8N_WEBHOOK_URL`.

It uses six core nodes — Webhook → Code (validate) → HTTP Request ×2 → Code (measure + write SEO)
→ Respond to Webhook. Real resizing and format conversion happen at
[images.weserv.nl](https://images.weserv.nl); file sizes and pixel dimensions are measured from the
actual bytes, and the SEO copy is composed from the brand fields (honouring `use_ai_analysis`).

Two things to expect: choosing **PNG output for a photo makes the file bigger**, so the reduction
badge goes negative — that is lossless PNG behaving correctly, not a bug. And the SEO copy is
template-written, not model-written; swap the *Build SEO response* node for an AI Agent to get real
AI copy while keeping every other node as-is.

### A minimal production workflow

1. **Webhook** (POST, response mode *When Last Node Finishes*) — optionally with a Header Auth credential.
2. **HTTP Request** — `GET {{ $json.image_url }}`, response format *File*, to pull the source image.
3. **Edit Image** — resize/compress and convert to `{{ $json.output_format }}`.
4. **IF** on `{{ $json.use_ai_analysis }}` — true branch runs an AI vision node describing the image;
   false branch skips it.
5. **AI Agent / LLM node** — feed the description (when present) plus the whole `brand` object and
   ask for JSON with the seven `seo` fields above.
6. Upload the optimized file to storage (S3, Supabase, Cloudinary…) or return it as base64.
7. **Respond to Webhook** — return the JSON shape above.

Because the app accepts base64, step 6 is optional for a quick MVP: return
`"optimized_base64": "<base64>"` and the download button still works.

---

## Notes on the API routes

- **`/api/image-seo`** validates the URL and format server-side, forwards a clean payload, and maps
  n8n failures onto readable messages (`502` unreachable / `504` timeout / `500` unconfigured).
  It runs on the platform's default function timeout — add `export const maxDuration = 300` to the
  route if your plan allows longer runs and your workflow needs them.
- **`/api/download`** exists because cross-origin images ignore the HTML `download` attribute — the
  proxy re-serves the file with `Content-Disposition: attachment` so it saves under the
  AI-generated SEO filename. It refuses non-HTTP schemes, loopback/private hosts, and files over 25 MB.

## Dependency security

`package.json` carries an `overrides` entry pinning `postcss` to `^8.5.28`. Next.js 15.5.x depends
on `postcss@8.4.31`, which carries build-time source-map path-traversal advisories; the override
lifts every copy in the tree to the patched release. `npm audit` reports zero vulnerabilities with
it in place — remove it only after moving to a Next.js release that ships a patched postcss itself.

```bash
npm audit          # should report: found 0 vulnerabilities
```

## Scripts

```bash
npm run dev        # local development
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```

## Deploying to Vercel

1. Push the repo to GitHub and import it into Vercel (framework is detected automatically).
2. Add `N8N_WEBHOOK_URL` (and the optional auth variables) to the project's environment variables.
3. Deploy. No other configuration is needed.
