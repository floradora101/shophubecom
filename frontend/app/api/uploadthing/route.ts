import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// UploadThing route handler for Next.js App Router
// Use Node runtime (not edge) to avoid self-fetch limitations
export const runtime = "nodejs";

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
