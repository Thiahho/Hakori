import Image from "next/image";

export function ManifestoSection() {
  return (
    <section id="historia" className="bg-ink text-cream">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-2">
        <div className="relative mx-auto aspect-[385/596] w-40 sm:w-56">
          <Image
            src="/images/manifesto-torii.webp"
            alt="Ícono torii, kanji de Japón"
            fill
            className="object-contain"
          />
        </div>
        <div className="border-t border-cream/20 pt-8 md:border-l md:border-t-0 md:pl-12 md:pt-0">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-cream/60">
            El origen del drop
          </p>
          <p className="font-sans text-4xl font-black uppercase leading-tight sm:text-5xl">
            No vestimos
            <br />
            símbolos.
          </p>
          <p className="font-display text-4xl italic leading-tight text-accent sm:text-5xl">
            Vestimos
            <br />
            decisiones.
          </p>
          <p className="mt-8 max-w-md text-sm text-cream/70">
            Japón inspira este primer capítulo por su manera de encontrar
            fuerza en la disciplina, belleza en lo efímero y sentido en cada
            transición.
          </p>
        </div>
      </div>
    </section>
  );
}
