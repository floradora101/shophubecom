/**
 * Image Helper Utilities
 *
 * Determines if an image URL should use Next.js optimization or be served unoptimized.
 * External images (UploadThing, Unsplash, etc.) should be unoptimized to prevent 404 errors.
 */

/**
 * Check if an image URL should be served unoptimized
 * @param url - Image URL to check
 * @returns true if image should be unoptimized, false otherwise
 */
export function shouldUnoptimizeImage(url: string | null | undefined): boolean {
  if (!url) return false;

  // Data URLs (base64) should be unoptimized
  if (url.startsWith("data:")) return true;

  // Blob URLs (temporary) should be unoptimized
  if (url.startsWith("blob:")) return true;

  // External CDN URLs should be unoptimized to prevent 404 errors
  if (
    url.includes("uploadthing.com") ||
    url.includes("utfs.io") ||
    url.includes("ufs.sh") ||
    url.includes("unsplash.com") ||
    url.includes("picsum.photos")
  ) {
    return true;
  }

  return false;
}
