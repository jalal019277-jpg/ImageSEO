import piexif from 'piexifjs';

import type { OutputFormat, SeoMetadata } from '@/types';

/**
 * Writes the user's metadata into the image binary so Windows Explorer's
 * Details tab shows it. Each container needs a different technique:
 *
 *   JPEG  EXIF APP1 with the Windows XP* tags   → Title, Subject, Tags,
 *                                                 Authors, Comments, Copyright
 *   PNG   XMP packet in an iTXt chunk after IHDR → all but Subject
 *   WEBP  XMP chunk (written by sharp)           → all but Subject
 *
 * Only JPEG can carry "Subject"; Explorer has no mapping for it in the XMP
 * that PNG and WebP use. That is a Windows limitation, not a missing feature.
 */

const SOFTWARE = 'AI Image SEO Optimizer';

/** Windows XP* EXIF tags hold UCS-2 LE text with a null terminator. */
function ucs2Bytes(text: string): number[] {
  return [...Buffer.from(text, 'ucs2'), 0, 0];
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function keywordList(seo: SeoMetadata): string[] {
  return [seo.primary_keyword, ...seo.secondary_keywords].map((k) => k.trim()).filter(Boolean);
}

/** Explorer shows Tags as a semicolon-separated list. */
function keywordString(seo: SeoMetadata): string {
  return keywordList(seo).join('; ');
}

// --- JPEG -------------------------------------------------------------------

function embedJpegExif(image: Buffer, seo: SeoMetadata): Buffer {
  const zeroth: Record<number, unknown> = {};
  const ifd = piexif.ImageIFD;

  // Explorer reads Title from ImageDescription, so both carry the title.
  if (seo.title) {
    zeroth[ifd.XPTitle] = ucs2Bytes(seo.title);
    zeroth[ifd.ImageDescription] = seo.title;
  }
  if (seo.subject) zeroth[ifd.XPSubject] = ucs2Bytes(seo.subject);
  if (seo.description) zeroth[ifd.XPComment] = ucs2Bytes(seo.description);
  if (seo.author) {
    zeroth[ifd.XPAuthor] = ucs2Bytes(seo.author);
    zeroth[ifd.Artist] = seo.author;
  }
  if (seo.copyright) zeroth[ifd.Copyright] = seo.copyright;

  const keywords = keywordString(seo);
  if (keywords) zeroth[ifd.XPKeywords] = ucs2Bytes(keywords);

  zeroth[ifd.Software] = SOFTWARE;

  const exifBytes = piexif.dump({
    '0th': zeroth,
    Exif: {},
    GPS: {},
    Interop: {},
    '1st': {},
    thumbnail: null,
  });

  return Buffer.from(piexif.insert(exifBytes, image.toString('binary')), 'binary');
}

// --- XMP (PNG and WebP) -----------------------------------------------------

export function buildXmpPacket(seo: SeoMetadata): string {
  const parts: string[] = [];

  if (seo.title) {
    parts.push(
      `<dc:title><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(seo.title)}</rdf:li></rdf:Alt></dc:title>`,
    );
  }
  if (seo.description) {
    parts.push(
      `<dc:description><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(
        seo.description,
      )}</rdf:li></rdf:Alt></dc:description>`,
      // Explorer's "Comments" comes from exif:UserComment, not dc:description.
      `<exif:UserComment><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(
        seo.description,
      )}</rdf:li></rdf:Alt></exif:UserComment>`,
    );
  }

  const keywords = keywordList(seo);
  if (keywords.length) {
    parts.push(
      `<dc:subject><rdf:Bag>${keywords
        .map((k) => `<rdf:li>${escapeXml(k)}</rdf:li>`)
        .join('')}</rdf:Bag></dc:subject>`,
    );
  }

  if (seo.author) {
    parts.push(`<dc:creator><rdf:Seq><rdf:li>${escapeXml(seo.author)}</rdf:li></rdf:Seq></dc:creator>`);
  }
  if (seo.copyright) {
    parts.push(
      `<dc:rights><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(
        seo.copyright,
      )}</rdf:li></rdf:Alt></dc:rights>`,
    );
  }
  parts.push(`<xmp:CreatorTool>${SOFTWARE}</xmp:CreatorTool>`);

  return (
    `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>` +
    `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">` +
    `<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" ` +
    `xmlns:exif="http://ns.adobe.com/exif/1.0/" xmlns:xmp="http://ns.adobe.com/xap/1.0/">` +
    parts.join('') +
    `</rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>`
  );
}

// --- PNG --------------------------------------------------------------------

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer: Buffer): number {
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeBuffer = Buffer.from(type, 'latin1');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

/**
 * Inserts the XMP packet as an iTXt chunk directly after IHDR. Explorer only
 * finds it in that position, which is why sharp's own XMP support is bypassed
 * for PNG.
 */
function embedPngXmp(image: Buffer, xmp: string): Buffer {
  const data = Buffer.concat([
    Buffer.from('XML:com.adobe.xmp', 'latin1'),
    Buffer.from([0, 0, 0, 0, 0]), // null separator, compression flag/method, empty language + translated keyword
    Buffer.from(xmp, 'utf8'),
  ]);

  // 8-byte signature, then the IHDR chunk (length + type + data + crc).
  const ihdrEnd = 8 + 4 + 4 + image.readUInt32BE(8) + 4;
  return Buffer.concat([image.subarray(0, ihdrEnd), pngChunk('iTXt', data), image.subarray(ihdrEnd)]);
}

// --- entry point ------------------------------------------------------------

/**
 * Adds metadata that sharp could not write itself. WebP metadata is attached
 * during encoding, so it arrives here already done.
 */
export function embedMetadata(image: Buffer, format: OutputFormat, seo: SeoMetadata): Buffer {
  if (format === 'jpg') return embedJpegExif(image, seo);
  if (format === 'png') return embedPngXmp(image, buildXmpPacket(seo));
  return image;
}

const ALL_FIELDS = ['Title', 'Subject', 'Tags', 'Authors', 'Comments', 'Copyright'] as const;

/** Which Explorer fields the output carries, given the format and the input. */
export function describeEmbeddedFields(format: OutputFormat, seo: SeoMetadata) {
  const provided: Record<(typeof ALL_FIELDS)[number], boolean> = {
    Title: Boolean(seo.title),
    Subject: Boolean(seo.subject),
    Tags: keywordList(seo).length > 0,
    Authors: Boolean(seo.author),
    Comments: Boolean(seo.description),
    Copyright: Boolean(seo.copyright),
  };

  const written: string[] = [];
  const skipped: string[] = [];

  for (const field of ALL_FIELDS) {
    if (!provided[field]) continue;
    // Only JPEG carries Subject into Explorer.
    if (field === 'Subject' && format !== 'jpg') skipped.push(field);
    else written.push(field);
  }

  return { written, skipped };
}
