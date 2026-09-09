/**
 * Vercel's serverless functions reject request bodies larger than 4.5 MB, so
 * uploads are capped below that. `next start` on your own machine has no such
 * limit — raise this if you self-host.
 */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
