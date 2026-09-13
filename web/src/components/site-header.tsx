import Image from "next/image";
import Link from "next/link";
import { CartBadge } from "@/components/cart-badge";
import { AdminLink } from "@/components/admin-link";

const NAV_LINKS = [
  { href: "/#drop", label: "Drop 001" },
  { href: "/#coleccion", label: "Colección" },
  { href: "/#historia", label: "Historia" },
];

const MARQUEE_ITEMS = [
  "Stock limitado · Solo 50 unidades",
  "Drop 001 · Japón · Edición limitada",
  "Hakori.co · 2026",
];

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="relative h-8 overflow-hidden bg-ink-soft/90 text-[10px] uppercase tracking-widest text-cream/70 backdrop-blur">
        {MARQUEE_ITEMS.map((item) => (
          <span key={item} className="cycle-item whitespace-nowrap">
            {item}
          </span>
        ))}
      </div>
      <div className="relative flex items-center justify-between bg-ink px-6 py-4 text-cream">
        <nav className="hidden gap-6 text-xs uppercase tracking-widest sm:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:opacity-70">
              {link.label}
            </Link>
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
        <div className="flex items-center gap-4">
          <AdminLink />
          <Link
            href="/admin/login"
            aria-label="Iniciar sesión"
            className="flex items-center gap-2 text-xs uppercase tracking-widest hover:opacity-70"
          >
            <span className="hidden sm:inline">Ingresar</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream text-ink">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 2a4 4 0 100 8 4 4 0 000-8zM3.5 16.25a6.5 6.5 0 0113 0v.25a.75.75 0 01-.75.75h-11.5a.75.75 0 01-.75-.75v-.25z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </Link>
          <CartBadge />
        </div>
      </div>
    </header>
  );
}
