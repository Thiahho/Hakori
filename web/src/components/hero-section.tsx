import Image from "next/image";
import { CountdownTimer } from "@/components/countdown-timer";
import { EmailCaptureForm } from "@/components/email-capture-form";
import { DROP_TARGET_DATE, DROP_TARGET_LABEL } from "@/lib/drop-config";

export function HeroSection() {
  return (
    <section
      id="drop"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink pt-24"
    >
      <Image
        src="/images/fondoweb.webp"
        alt="Monte Fuji, un torii y cerezos en flor"
        fill
        priority
        sizes="100vw"
        className="scale-105 object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40 md:bg-gradient-to-r md:from-ink/75 md:via-ink/45 md:to-ink/10" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/50 text-cream">
            <span className="font-display text-lg">壱</span>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-cream/80">
            001
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-cream/70">
            Primera colección · Japón
          </p>
          <h1 className="font-display text-6xl leading-[0.95] text-cream sm:text-7xl md:text-8xl">
            DROP
            <br />
            ARCHIVE
          </h1>
        </div>

        <CountdownTimer targetDate={DROP_TARGET_DATE} />

        <div className="max-w-sm">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-cream/70">
            Accedé antes que nadie
          </p>
          <EmailCaptureForm variant="dark" label="TU EMAIL" submitLabel="" />
        </div>

        <p className="text-xs uppercase tracking-widest text-cream/60">
          Fecha provisoria · {DROP_TARGET_LABEL}
        </p>
      </div>

      <a
        href="#coleccion"
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 text-xs uppercase tracking-widest text-cream/80 hover:text-cream"
      >
        Descubrir el drop
        <span aria-hidden>↓</span>
      </a>
    </section>
  );
}
