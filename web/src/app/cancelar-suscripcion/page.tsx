import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { UnsubscribeForm } from "@/components/unsubscribe-form";

export const metadata: Metadata = {
  title: "Cancelar suscripción · Hakori.Co",
};

export default async function CancelarSuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <>
      <SiteHeader />
      <main className="bg-cream px-6 pb-24 pt-32">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-3xl italic text-ink sm:text-4xl">
            Cancelar suscripción
          </h1>
          <p className="mt-6 text-sm leading-relaxed text-ink/70">
            Vas a dejar de recibir novedades sobre el Drop 001 y futuros
            lanzamientos de Hakori.co. Confirmá tu email para dar de baja la
            suscripción.
          </p>

          <div className="mt-10">
            <UnsubscribeForm initialEmail={email ?? ""} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
