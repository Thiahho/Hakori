import Link from "next/link";
import { logoutAction } from "@/lib/admin/auth-actions";
import { NavLink } from "@/components/admin/ui/nav-link";
import { DialogProvider } from "@/components/admin/ui/dialog-provider";
import {
  BoxIcon,
  ExternalLinkIcon,
  LogOutIcon,
  MailIcon,
  ReceiptIcon,
  RulerIcon,
  TagIcon,
} from "@/components/admin/ui/icons";

export const metadata = { title: "Hakori Admin" };

const NAV_ITEMS = [
  { href: "/admin/products", label: "Productos", icon: <BoxIcon className="h-4.5 w-4.5" /> },
  { href: "/admin/size-charts", label: "Plantillas de talles", icon: <RulerIcon className="h-4.5 w-4.5" /> },
  { href: "/admin/orders", label: "Órdenes", icon: <ReceiptIcon className="h-4.5 w-4.5" /> },
  { href: "/admin/coupons", label: "Cupones", icon: <TagIcon className="h-4.5 w-4.5" /> },
  { href: "/admin/subscribers", label: "Suscriptores", icon: <MailIcon className="h-4.5 w-4.5" /> },
];

function SidebarContent() {
  return (
    <>
      <Link href="/admin/products" className="flex items-center gap-2 px-3 py-2">
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-cream">Hakori</span>
        <span className="text-sm text-cream/40">Admin</span>
      </Link>

      <nav className="mt-6 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} href={item.href} icon={item.icon}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-cream/60 transition-colors hover:bg-white/5 hover:text-cream"
        >
          <ExternalLinkIcon className="h-4.5 w-4.5 text-cream/40" />
          Ver sitio
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-cream/60 transition-colors hover:bg-white/5 hover:text-cream"
          >
            <LogOutIcon className="h-4.5 w-4.5 text-cream/40" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </>
  );
}

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col overflow-y-auto bg-ink px-4 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile top bar: same nav, laid out horizontally, no JS/drawer needed */}
      <div className="flex flex-col bg-ink px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <Link href="/admin/products" className="flex items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-cream">Hakori</span>
            <span className="text-sm text-cream/40">Admin</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/"
              aria-label="Ver sitio"
              className="rounded-lg p-2 text-cream/60 hover:bg-white/5 hover:text-cream"
            >
              <ExternalLinkIcon className="h-4.5 w-4.5" />
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Cerrar sesión"
                className="rounded-lg p-2 text-cream/60 hover:bg-white/5 hover:text-cream"
              >
                <LogOutIcon className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        </div>
        <nav className="-mx-1 mt-3 flex gap-1 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} icon={item.icon}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <main className="flex-1 px-4 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <DialogProvider>{children}</DialogProvider>
        </div>
      </main>
    </div>
  );
}
