import { createUploadthing, type FileRouter } from "uploadthing/next";

// UploadThing v7 uses UPLOADTHING_TOKEN (base64-encoded JSON with apiKey, appId, regions)
// It is read automatically by the library — no manual passing needed.
if (!process.env.UPLOADTHING_TOKEN) {
  console.error(
    "[UploadThing] UPLOADTHING_TOKEN is missing from environment variables. " +
    "Set it in .env.local. It should be a base64-encoded JSON: { apiKey, appId, regions }."
  );
}

const f = createUploadthing();

/**
 * Authenticates user and enforces ADMIN role requirement for uploads.
 * Forwards cookies from the request to the backend /auth/me endpoint.
 */
async function authenticateAdmin(req: Request) {
  const cookieHeader = req.headers.get("cookie");

  if (!cookieHeader) {
    console.error("[UploadThing] No authentication cookies found");
    throw new Error("Unauthorized: No authentication cookies found");
  }

  const backendUrl = process.env.BACKEND_API_URL || "http://localhost:3001/api";
  const authUrl = `${backendUrl}/auth/me`;

  try {
    const response = await fetch(authUrl, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      credentials: "include",
    });

    if (!response.ok) {
      console.error(`[UploadThing] Authentication failed: ${response.status}`);
      throw new Error(
        `Unauthorized: Authentication failed (${response.status})`
      );
    }

    const responseBody = await response.json();

    // Backend wraps responses in { success, data, timestamp }
    // Extract the actual user from the wrapper
    const user = responseBody.data ?? responseBody;

    if (user.role !== "ADMIN") {
      console.error(`[UploadThing] User is not admin. Role: ${user.role}`);
      throw new Error("Forbidden: Admin role required for uploads");
    }

    return user;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[UploadThing] Auth error:`, error.message);
      throw error;
    }
    console.error("[UploadThing] Unknown auth error");
    throw new Error("Unauthorized: Authentication request failed");
  }
}

export const ourFileRouter = {
  variantMainImage: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      await authenticateAdmin(req);
      return {};
    })
    .onUploadComplete(async ({ file }) => ({
      url: file.ufsUrl ?? "",
    })),

  variantGallery: f({ image: { maxFileSize: "8MB", maxFileCount: 8 } })
    .middleware(async ({ req }) => {
      await authenticateAdmin(req);
      return {};
    })
    .onUploadComplete(async ({ file }) => ({
      url: file.ufsUrl ?? "",
    })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
