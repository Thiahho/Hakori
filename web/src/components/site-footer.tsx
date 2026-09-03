import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-cream px-6 pb-8 pt-4">
      <div className="relative mx-auto aspect-[2172/724] w-full max-w-4xl">
        <Image
          src="/images/HAKORI.png"
          alt="Hakori"
          fill
          className="object-contain"
        />
      </div>
      <div className="mt-6 flex flex-col items-center justify-between gap-2 text-[11px] uppercase tracking-widest text-ink/60 sm:flex-row">
        <span>© 2026 Hakori.co</span>
        <span>Buenos Aires · Argentina</span>
        <span>Instagram · @hakori.co</span>
      </div>
    </footer>
  );
}
