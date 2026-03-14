import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Ensure cookies (auth) are sent only for same-origin requests to our API.
// Do NOT add credentials for cross-origin requests (e.g. UploadThing CDN) - that causes FetchError/CORS.
const uploadThingFetch: typeof fetch = (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const isSameOrigin =
    typeof window !== "undefined" &&
    (url.startsWith("/") || url.startsWith(window.location.origin));
  return fetch(input, {
    ...init,
    ...(isSameOrigin && { credentials: "include" as RequestCredentials }),
  });
};

const helpersOpts = { fetch: uploadThingFetch };

export const UploadButton = generateUploadButton<OurFileRouter>(helpersOpts);
export const UploadDropzone = generateUploadDropzone<OurFileRouter>(helpersOpts);

// Export useUploadThing hook for programmatic uploads
export const { useUploadThing } = generateReactHelpers<OurFileRouter>(helpersOpts);
