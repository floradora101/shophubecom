import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  variantMainImage: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    .middleware(async () => ({}))
    .onUploadComplete(async ({ file }) => ({
      url: file.ufsUrl ?? "",
    })),

  variantGallery: f({ image: { maxFileSize: "8MB", maxFileCount: 8 } })
    .middleware(async () => ({}))
    .onUploadComplete(async ({ file }) => ({
      url: file.ufsUrl ?? "",
    })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
