# AI Image SEO Optimizer

Upload an image, type your metadata, and download a compressed file that **carries that metadata
inside it** — visible in Windows Explorer under Properties → Details, not just in your CMS.

The web UI runs entirely inside Next.js: no external services, no storage. A separate, opt-in API
lets n8n (or anything else) drive it from a single HTTP Request node.

Built with **Next.js 15 (App Router)**, **TypeScript** (strict), **Tailwind CSS v4** and **sharp**.
By [Biomech Studio](https://www.biomechstudio.com).

---

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. Nothing to configure — the web UI needs no `.env` file. Set
`IMAGE_SEO_API_KEY` only if you want the n8n endpoint (see below).

---

## What Windows actually shows

Explorer reads image metadata differently per container, so the app writes each format the way that
format needs, and tells you in the results which fields made it in. Verified on Windows 11:

| Explorer field | JPG | PNG | WEBP | Comes from |
| -------------- | :-: | :-: | :--: | ---------- |
| Title          | ✅ | ✅ | ✅ | Title |
| Subject        | ✅ | ❌ | ❌ | Subject |
| Tags           | ✅ | ✅ | ✅ | Primary + secondary keywords |
| Authors        | ✅ | ✅ | ✅ | Author |
| Comments       | ✅ | ✅ | ✅ | Description |
| Copyright      | ✅ | ✅ | ✅ | Copyright |

**Only JPG carries Subject.** Explorer has no XMP mapping for it — a Windows limitation rather than
a gap in this app — so the results screen lists Subject under "Skipped" whenever you export PNG or
WEBP. Choose JPG if you need that field.

Alt text is never embedded: image formats have no alt field. It exists for the HTML `<img>` tag,
which the results screen gives you ready to paste.

### How each format is written

| Format | Technique |
| ------ | --------- |
| JPG  | EXIF APP1 segment with the Windows `XP*` tags (UCS-2), plus `ImageDescription`, `Artist` and `Copyright` |
| PNG  | XMP packet in an `iTXt` chunk inserted directly after `IHDR` — Explorer only finds it in that position, so sharp's own XMP output is bypassed |
| WEBP | XMP chunk written by sharp during encoding |

Explorer's "Comments" comes from `exif:UserComment`, not `dc:description`, so the XMP carries both.

---

## Calling it from n8n

There is a second, machine-facing endpoint built so a **single n8n HTTP Request node** can post
JSON and receive the finished image as binary.

Set `IMAGE_SEO_API_KEY` in the environment to enable it. Until you do, the route returns 503 — it
is never open to the public by accident.

```
POST /api/v1/optimize
x-api-key: <IMAGE_SEO_API_KEY>
content-type: application/json
```

```json
{
  "image_url": "https://example.com/product-shot.jpg",
  "output_format": "jpg",
  "quality": 82,
  "max_width": 1600,
  "metadata": {
    "title": "Orthopedic Shoe Last",
    "subject": "Custom shoe last for medicated insoles",
    "description": "Precision 3D orthotic shoe last.",
    "alt_text": "Close-up of a custom orthopedic shoe last",
    "primary_keyword": "orthopedic shoe last",
    "secondary_keywords": ["custom shoe last design"],
    "author": "Acme Footwear",
    "copyright": "© 2026 Acme Footwear"
  }
}
```

Send `image_base64` instead of `image_url` to upload bytes directly. Metadata fields may also be
sent flat at the top level rather than nested under `metadata`.

**The response is the image itself**, with everything else in headers, so one node gives you both
the file and the numbers:

| Header | Meaning |
| ------ | ------- |
| `X-Image-Filename` | SEO filename, also set in `Content-Disposition` |
| `X-Image-Width` / `X-Image-Height` | Output dimensions |
| `X-Image-Size-Bytes` / `X-Image-Original-Size-Bytes` | After and before |
| `X-Image-Reduction-Percent` | Savings |
| `X-Metadata-Written` / `X-Metadata-Skipped` | Which Explorer fields made it in |

Add `"response": "json"` to the body to get JSON with a `data:` URL instead of raw bytes.

### n8n node settings

| Setting | Value |
| ------- | ----- |
| Method | `POST` |
| URL | `https://your-app.vercel.app/api/v1/optimize` |
| Authentication | Generic Credential Type → Header Auth |
| Header name / value | `x-api-key` / your key |
| Send Body | On → JSON → the body above |
| Response Format | **File** — this is what makes the node output the image |

The running app has an **n8n API** section that fills in your live URL and offers the ready-made
one-node workflow as a download.

### Remote URLs are filtered

`image_url` is fetched server-side, so loopback, link-local and private ranges are refused and the
download is size-capped. The endpoint cannot be used to probe the host's network.

---

## Theming

The UI ships light and dark palettes plus a header toggle (light / system / dark). The choice is
stored in `localStorage` and applied by a small blocking script in `app/layout.tsx` before first
paint, so dark-mode users never see a flash of light.

Colours are semantic tokens defined once in `app/globals.css` — `--color-surface`, `--color-fg`,
`--color-line`, `--color-accent`, `--color-ok-*`, `--color-danger-*` — and redefined under
`[data-theme='dark']`. Components reference the roles (`bg-surface`, `text-fg-muted`), never raw
palette values, so changing a palette is a one-file edit.

---

## Folder structure

```
app/
  layout.tsx                  Root layout, metadata, pre-paint theme script
  page.tsx                    The single page: form → processing → results
  globals.css                 Semantic colour tokens for both themes
  api/image-seo/route.ts      The browser upload endpoint (multipart)
  api/v1/optimize/route.ts    The API-key endpoint n8n calls (JSON in, image out)
components/
  SiteHeader.tsx              Sticky header: brand, n8n link, theme toggle
  ThemeToggle.tsx             Light / system / dark switch
  BiomechBrand.tsx            Biomech Studio mark, header badge, marketing panel
  Hero.tsx                    Landing header
  ImageSeoForm.tsx            Upload + metadata + output settings
  ImageDropzone.tsx           Drag-and-drop / file picker with local preview
  IntegrationSection.tsx      n8n setup, JSON body, cURL, workflow download
  Field.tsx                   TextField / TextAreaField / SectionHeading
  FormatSelector.tsx          PNG · JPG/JPEG · WEBP selectable cards
  ProcessingState.tsx         Staged progress indicator
  ResultsPanel.tsx            Results screen + download actions
  ImageComparison.tsx         Before/after previews with size and dimensions
  SeoMetadataCard.tsx         Metadata fields, embedded-field summary, copy buttons
  CopyField.tsx               CopyField + CopyButton
  ErrorBanner.tsx             Inline failure state with retry
  Icons.tsx                   Inline SVG icon set (no icon dependency)
lib/
  imageProcessing.ts          The sharp pipeline (resize, encode, measure)
  metadata.ts                 EXIF / XMP writing and the per-format field report
  fetchImage.ts               SSRF-filtered remote fetch and base64 decoding
  limits.ts                   Upload size cap
  utils.ts                    Formatting, filename safety, JSON export
  download.ts                 Blob/JSON downloads and the clipboard helper
services/
  imageSeoService.ts          Builds the FormData and calls the API route
types/
  index.ts                    Shared contracts
  piexifjs.d.ts               Local typings for piexifjs
```

---

## The pipeline

1. The browser posts the file plus the metadata fields as `multipart/form-data` to `/api/image-seo`.
2. sharp auto-rotates from EXIF orientation, optionally scales the long edge down (never up), and
   re-encodes to the chosen format — mozjpeg for JPG, palette PNG, or WebP at the chosen quality.
3. `lib/metadata.ts` writes the metadata into the encoded bytes.
4. The route returns the optimized image as a `data:` URL alongside the before/after numbers and a
   report of which Explorer fields were written and which were skipped.
5. The browser previews the original from a local object URL — the source file is never sent back.

## Upload limit

Uploads are capped at **4 MB** (`lib/limits.ts`). Vercel's serverless functions reject request
bodies over 4.5 MB, so the cap keeps the failure friendly instead of opaque. Self-hosting with
`npm run start` has no such limit — raise the constant if you run your own server.

## Scripts

```bash
npm run dev        # local development
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm audit          # should report: found 0 vulnerabilities
```

## Dependency security

`package.json` pins `postcss` to `^8.5.28` through an `overrides` entry. Next.js 15.5.x depends on
`postcss@8.4.31`, which carries build-time source-map path-traversal advisories; the override lifts
every copy in the tree to the patched release. Remove it only after moving to a Next.js release
that ships a patched postcss itself.

`sharp` must stay at **0.35.4 or newer** — earlier releases carry the libvips and libheif CVEs, and
this app feeds user-supplied images straight into it.

## Deploying to Vercel

1. Push to GitHub and import the repo into Vercel — the framework is detected automatically.
2. Optional: add `IMAGE_SEO_API_KEY` to enable `/api/v1/optimize` for n8n.
3. Deploy.

`sharp` ships prebuilt binaries for every platform in `package-lock.json`, so Vercel's `npm ci`
installs the Linux build without any extra configuration.

## Credits

Built by **[Biomech Studio](https://www.biomechstudio.com)**. The marketing copy in
`components/BiomechBrand.tsx` is deliberately generic — replace it with your own positioning.
