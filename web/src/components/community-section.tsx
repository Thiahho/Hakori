import { EmailCaptureForm } from "@/components/email-capture-form";

export function CommunitySection() {
  return (
    <section className="bg-cream px-6 py-24 text-center">
      <p className="mb-4 text-xs uppercase tracking-[0.3em] text-ink/60">
        Hakori community
      </p>
      <h2 className="mx-auto max-w-3xl font-sans text-4xl font-black uppercase leading-tight sm:text-5xl">
        El próximo capítulo empieza acá.
      </h2>
      <div className="mx-auto mt-10 max-w-md">
        <EmailCaptureForm variant="light" label="TU EMAIL" submitLabel="Sumarme" />
      </div>
    </section>
  );
}
