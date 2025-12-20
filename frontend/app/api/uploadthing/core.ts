import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

/**
 * Authenticates user and enforces ADMIN role requirement for uploads.
 * Forwards cookies from the request to the backend /auth/me endpoint.
 */
async function authenticateAdmin(req: Request) {
  const cookieHeader = req.headers.get("cookie");

  if (!cookieHeader) {
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
      throw new Error(
        `Unauthorized: Authentication failed (${response.status})`
      );
    }

    const user = await response.json();

    if (user.role !== "ADMIN") {
      throw new Error("Forbidden: Admin role required for uploads");
    }

    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
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
