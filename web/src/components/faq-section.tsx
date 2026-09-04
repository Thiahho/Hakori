const FAQ_ITEMS = [
  {
    question: "¿Cuándo abre el Drop 001?",
    answer:
      "Es una edición limitada de 50 unidades por diseño. La apertura se anuncia primero por email a quienes están en la lista de espera y en nuestras redes.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Tarjetas de crédito, débito y Mercado Pago. El pago se procesa de forma segura, no almacenamos los datos de tu tarjeta.",
  },
  {
    question: "¿Hacen envíos a todo el país?",
    answer:
      "Sí, hacemos envíos a todo Argentina a través de correo y empresas de logística.",
  },
  {
    question: "¿Cuánto tarda en llegar mi pedido?",
    answer:
      "Entre 3 y 7 días hábiles dependiendo de tu ubicación, una vez despachado el pedido.",
  },
  {
    question: "¿Puedo cambiar o devolver mi producto?",
    answer:
      "Sí, tenés 10 días desde que lo recibís para solicitar un cambio o devolución, siempre que la prenda esté sin uso y con sus etiquetas originales.",
  },
  {
    question: "¿Cómo elijo mi talle?",
    answer:
      "Todas las prendas son oversize por diseño. Si estás entre dos talles, te recomendamos elegir el más chico para un fit más ajustado a la silueta.",
  },
  {
    question: "¿Es una edición realmente limitada?",
    answer:
      "Sí. Cada diseño se produce en una tirada única de 50 unidades y no se repone una vez agotado.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="bg-cream px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <p className="mb-4 text-center text-xs uppercase tracking-[0.3em] text-ink/60">
          ¿Dudas?
        </p>
        <h2 className="text-center font-sans text-4xl font-black uppercase leading-tight sm:text-5xl">
          Preguntas frecuentes
        </h2>

        <div className="mt-12 divide-y divide-ink/10 border-t border-ink/10">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold uppercase tracking-widest text-ink">
                {item.question}
                <span className="shrink-0 text-lg text-ink/50 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/70">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
