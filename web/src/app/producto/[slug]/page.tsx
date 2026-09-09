import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getProductBySlug } from "@/lib/products";

export async function generateMetadata({
  params,
}: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return {};

  return {
    title: `${product.name} · Hakori.Co`,
    description: product.storyText,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/producto/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <>
      <SiteHeader />
      <main className="bg-cream px-6 pb-24 pt-32">
        <div className="mx-auto max-w-6xl">
          <ProductDetail product={product} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
