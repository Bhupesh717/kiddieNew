import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/storefront/product-detail";
import type { StoreProduct } from "@/src/lib/store/catalog";

export const dynamic = "force-dynamic";

async function getLiveProduct(slug: string): Promise<StoreProduct | null> {
  try {
    const res = await fetch(
      `http://127.0.0.1:8000/api/products/${encodeURIComponent(slug)}`,
      {
        cache: "no-store",
      },
    );
    const payload = await res.json().catch(() => null);
    if (payload?.success && payload.data) {
      return payload.data;
    }
  } catch (e) {
    console.error("Failed to fetch product by slug", e);
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getLiveProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} · KiddieQuick`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getLiveProduct(slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
