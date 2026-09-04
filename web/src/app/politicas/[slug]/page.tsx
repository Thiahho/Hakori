import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { legalPages, getLegalPage } from "@/lib/legal";

export function generateStaticParams() {
  return legalPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/politicas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = getLegalPage(slug);

  if (!page) return {};

  return {
    title: `${page.title} · Hakori.Co`,
    description: page.intro,
  };
}

export default async function LegalPage({
  params,
}: PageProps<"/politicas/[slug]">) {
  const { slug } = await params;
  const page = getLegalPage(slug);

  if (!page) notFound();

  return (
    <>
      <SiteHeader />
      <main className="bg-cream px-6 pb-24 pt-32">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-ink/50">
            Actualizado · {page.updatedAt}
          </p>
          <h1 className="mt-3 font-display text-3xl italic text-ink sm:text-4xl">
            {page.title}
          </h1>
          <p className="mt-6 text-sm leading-relaxed text-ink/70">
            {page.intro}
          </p>

          <div className="mt-12 space-y-10">
            {page.sections.map((section) => (
              <div key={section.heading}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-ink">
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-3">
                  {section.paragraphs.map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-sm leading-relaxed text-ink/70"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
