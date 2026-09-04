export type Product = {
  id: string;
  index: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  image: string;
  storyImage: string;
  storyQuote: string;
  storyText: string;
};

export const products: Product[] = [
  {
    id: "katana",
    index: "01",
    slug: "katana-oversize",
    name: "Katana",
    price: 42000,
    description: "Oversize · Premium",
    image: "/images/katana-sinfondo.webp",
    storyImage: "/images/FINAL_KATANA.webp",
    storyQuote: "La verdadera batalla siempre es contra uno mismo.",
    storyText:
      "La katana representa el honor, la disciplina y la determinación. Más que un arma, simboliza el carácter de quien elige superarse cada día. Esta pieza es un recordatorio de que la fuerza más grande nace del autocontrol y la constancia.",
  },
  {
    id: "torii",
    index: "02",
    slug: "torii-oversize",
    name: "Torii",
    price: 42000,
    description: "Oversize · Premium",
    image: "/images/TORI-sinfondo.webp",
    storyImage: "/images/FINALTORIH.webp",
    storyQuote: "Todo gran camino comienza con una decisión.",
    storyText:
      "El Torii marca el inicio de un nuevo recorrido. Representa el valor de dejar atrás los miedos, aceptar el cambio y dar el primer paso hacia el crecimiento personal. Cada gran historia comienza al cruzar una puerta.",
  },
  {
    id: "sakura",
    index: "03",
    slug: "sakura-oversize",
    name: "Sakura",
    price: 42000,
    description: "Oversize · Premium",
    image: "/images/SAKURA-sinfondo.webp",
    storyImage: "/images/FINAL_Sakura.webp",
    storyQuote: "La belleza de la vida está en los momentos que no vuelven.",
    storyText:
      "El Sakura nos recuerda que todo es pasajero y que, precisamente por eso, cada instante tiene un valor único. Simboliza la renovación, la esperanza y la importancia de vivir el presente con gratitud.",
  },
  {
    id: "fuji",
    index: "04",
    slug: "montefuji-oversize",
    name: "Monte Fuji",
    price: 42000,
    description: "Oversize · Premium",
    image: "/images/MONTE-sinfondo.webp",
    storyImage: "/images/FINAL_MONTEFUJIH.webp",
    storyQuote: "Las cimas pertenecen a quienes nunca dejan de avanzar.",
    storyText:
      "El Monte Fuji representa la perseverancia, la paciencia y la fortaleza para alcanzar grandes objetivos. Cada paso cuenta, y la verdadera grandeza se construye con constancia, incluso cuando el camino parece interminable.",
  },
];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}
