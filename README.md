# AI Image SEO Optimizer

Upload an image, type your metadata, and download a compressed file that **carries that metadata
inside it** — visible in Windows Explorer under Properties → Details, not just in your CMS.

Everything runs inside Next.js. No external services, no API keys, no webhooks, no storage.

Built with **Next.js 15 (App Router)**, **TypeScript** (strict), **Tailwind CSS v4** and **sharp**.

---

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. There is nothing to configure — no `.env` file is required.

---

## What Windows actually shows

Explorer reads image metadata differently per container, so the app writes each format the way
that format needs, and tells you in the results which fields made it in. Verified on Windows 11:

| Explorer field | JPG | PNG | WEBP | Comes from |
| -------------- | :-: | :-: | :--: | ---------- |
| Title          | ✅ | ✅ | ✅ | Title |
| Subject        | ✅ | ❌ | ❌ | Subject |
| Tags           | ✅ | ✅ | ✅ | Primary + secondary keywords |
| Authors        | ✅ | ✅ | ✅ | Author |
| Comments       | ✅ | ✅ | ✅ | Description |
| Copyright      | ✅ | ✅ | ✅ | Copyright |

**Only JPG carries Subject.** Explorer has no XMP mapping for it, which is a Windows limitation
rather than a gap in this app — so the results screen lists Subject under "Skipped" whenever you
export PNG or WEBP. Choose JPG if you need that field.

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

## Folder structure

```
app/
  layout.tsx                Root layout, metadata, global styles
  page.tsx                  The single page: form → processing → results
  globals.css               Tailwind v4 theme tokens and component classes
  api/image-seo/route.ts    Accepts the upload, validates it, returns the result
components/
  Hero.tsx                  Landing header
  ImageSeoForm.tsx          Upload + metadata + output settings
  ImageDropzone.tsx         Drag-and-drop / file picker with local preview
  Field.tsx                 TextField / TextAreaField / SectionHeading
  FormatSelector.tsx        PNG · JPG/JPEG · WEBP selectable cards
  ProcessingState.tsx       Staged progress indicator
  ResultsPanel.tsx          Results screen + download actions
  ImageComparison.tsx       Before/after previews with size and dimensions
  SeoMetadataCard.tsx       Metadata fields, embedded-field summary, copy buttons
  CopyField.tsx             CopyField + CopyButton
  ErrorBanner.tsx           Inline failure state with retry
  Icons.tsx                 Inline SVG icon set (no icon dependency)
lib/
  imageProcessing.ts        The sharp pipeline (resize, encode, measure)
  metadata.ts               EXIF / XMP writing and the per-format field report
  limits.ts                 Upload size cap
  utils.ts                  Formatting, filename safety, JSON export
  download.ts               Blob/JSON downloads and the clipboard helper
services/
  imageSeoService.ts        Builds the FormData and calls the API route
types/
  index.ts                  Shared contracts
  piexifjs.d.ts             Local typings for piexifjs
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

## Deploying to Vercel

1. Push to GitHub and import the repo into Vercel — the framework is detected automatically.
2. Deploy. There are no environment variables to set.

`sharp` ships prebuilt binaries for every platform in `package-lock.json`, so Vercel's `npm ci`
installs the Linux build without any extra configuration.
