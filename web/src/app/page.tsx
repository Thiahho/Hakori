import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "@/components/hero-section";
import { ProductGrid } from "@/components/product-grid";
import { ManifestoSection } from "@/components/manifesto-section";
import { StorySection } from "@/components/story-section";
import { CommunitySection } from "@/components/community-section";
import { SiteFooter } from "@/components/site-footer";
import { products } from "@/lib/products";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <ProductGrid />
        <ManifestoSection />
        {products.map((product, i) => (
          <StorySection
            key={product.id}
            product={product}
            reverse={i % 2 === 1}
          />
        ))}
        <CommunitySection />
      </main>
      <SiteFooter />
    </>
  );
}
