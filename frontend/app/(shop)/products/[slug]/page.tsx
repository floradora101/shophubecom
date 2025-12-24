// Product detail page - server component shell
import { ProductDetailClient } from "./ProductDetailClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slugParam = resolvedParams.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

  return <ProductDetailClient slug={slug} />;
}
