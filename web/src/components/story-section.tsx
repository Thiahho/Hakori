import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";

export function StorySection({
  product,
  reverse,
}: {
  product: Product;
  reverse: boolean;
}) {
  return (
    <div className="grid grid-cols-1 border-t border-cream/10 bg-ink text-cream md:grid-cols-2">
      <div
        className={`flex flex-col justify-center gap-6 px-6 py-20 sm:px-12 ${
          reverse ? "md:order-2" : ""
        }`}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-accent">
          {product.index} — {product.name.replace(" Tee", "")}
        </p>
        <p className="font-display text-3xl leading-tight sm:text-4xl">
          &ldquo;{product.storyQuote}&rdquo;
        </p>
        <p className="max-w-md text-sm text-cream/70">{product.storyText}</p>
        <Link
          href={`/producto/${product.slug}`}
          className="text-xs uppercase tracking-widest text-cream underline decoration-cream/40 underline-offset-8 hover:decoration-cream"
        >
          Elegir esta pieza →
        </Link>
      </div>
      <div
        className={`relative min-h-[320px] bg-ink-soft ${
          reverse ? "md:order-1" : ""
        }`}
      >
        <Image
          src={product.storyImage}
          alt={product.name}
          fill
          className="object-contain p-12"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </div>
    </div>
  );
}
