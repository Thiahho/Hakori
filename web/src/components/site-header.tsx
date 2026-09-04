import Image from "next/image";
import Link from "next/link";

const NAV_LINKS = [
  { href: "#drop", label: "Drop 001" },
  { href: "#coleccion", label: "Colección" },
  { href: "#historia", label: "Historia" },
];

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="flex items-center justify-between gap-4 bg-ink-soft/90 px-4 py-2 text-[10px] uppercase tracking-widest text-cream/70 backdrop-blur">
        <span className="hidden sm:inline">Stock limitado · Solo 50 unidades</span>
        <span className="mx-auto sm:mx-0">Drop 001 · Japón · Edición limitada</span>
        <span className="hidden sm:inline">Hakori.co · 2026</span>
      </div>
      <div className="relative flex items-center justify-between bg-ink px-6 py-4 text-cream">
        <nav className="hidden gap-6 text-xs uppercase tracking-widest sm:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:opacity-70">
              {link.label}
            </a>
          ))}
        </nav>
        <Link
          href="/"
          className="relative block h-6 w-32 sm:absolute sm:left-1/2 sm:-translate-x-1/2"
        >
          <Image
            src="/images/HAKORI_BLANCO.webp"
            alt="Hakori"
            fill
            className="object-contain"
            priority
          />
        </Link>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest">
          <span className="hidden sm:inline">Carrito</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream text-[10px] text-ink">
            0
          </span>
        </div>
      </div>
    </header>
  );
}
