// Product detail page - server component shell
import type { Metadata } from "next";
import { mockProducts, mockProductToProduct } from "@/lib/mock-data/mock-data";
import { ProductDetailClient } from "./ProductDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = Array.isArray(resolvedParams.slug)
    ? resolvedParams.slug[0]
    : resolvedParams.slug;

  // Find product in mock data
  const mockProduct = mockProducts.find((p) => p.slug === slug);

  if (mockProduct) {
    const product = mockProductToProduct(mockProduct);
    return {
      title: product.name,
      description:
        product.description ||
        `Shop ${product.name} at ShopHub. ${
          product.price ? `Price: $${product.price}` : ""
        }`,
      openGraph: {
        images: product.images?.length ? [product.images[0]] : [],
      },
    };
  }

  // Fallback metadata if product not found
  return {
    title: "Product Not Found",
    description: "The requested product could not be found.",
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slugParam = resolvedParams.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  return <ProductDetailClient slug={slug} />;
}
