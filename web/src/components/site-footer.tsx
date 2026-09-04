import { EmailCaptureForm } from "@/components/email-capture-form";

const FOOTER_COLUMNS = [
  {
    title: "Políticas",
    links: ["Envíos", "Cambios y devoluciones", "Canal legal", "Políticas de privacidad"],
  },
  {
    title: "General",
    links: ["Centro de ayuda", "Cookies", "Contacto"],
  },
  {
    title: "RRSS",
    links: ["Instagram", "TikTok", "WhatsApp"],
  },
];

export function SiteFooter() {
  return (
    <footer className="overflow-hidden border-t border-ink/10 bg-cream pt-16 text-ink">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_auto]">
          <div className="max-w-sm">
            <h2 className="text-sm font-semibold uppercase tracking-widest">
              Sumate a la lista
            </h2>
            <p className="mt-2 text-xs text-ink/60">
              Enterate primero cuando abra el Drop 001.
            </p>
            <div className="mt-6">
              <EmailCaptureForm
                variant="light"
                label="CORREO ELECTRÓNICO"
                submitLabel=""
              />
            </div>
            <label className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-ink/60">
              <input
                type="checkbox"
                className="mt-0.5 h-3.5 w-3.5 shrink-0 border-ink/40"
              />
              He leído y acepto la{" "}
              <a href="#" className="underline underline-offset-2 hover:text-ink">
                Política de Privacidad
              </a>
              .
            </label>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-3 lg:gap-x-16">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="text-xs font-semibold uppercase tracking-widest">
                  {column.title}
                </p>
                <ul className="mt-4 space-y-2 text-xs uppercase tracking-widest text-ink/60">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-ink">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-16 pb-8 text-center text-[11px] uppercase tracking-widest text-ink/50">
          Buenos Aires · Argentina · © 2026 Hakori.co
        </p>
      </div>

      <p
        aria-hidden
        className="select-none whitespace-nowrap px-2 text-center font-sans text-[19vw] font-black uppercase leading-none tracking-tight text-ink/10 sm:text-[16vw] lg:text-[13vw]"
      >
        HAKORI
      </p>
    </footer>
  );
}
