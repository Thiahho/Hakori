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
    slug: "katana-tee",
    name: "Katana Tee",
    price: 42000,
    description: "Oversize · Bordado premium",
    image: "/images/katana-sinfondo.png",
    storyImage: "/images/FINAL_KATANA.png",
    storyQuote: "La verdadera batalla siempre es contra uno mismo.",
    storyText:
      "Honor, disciplina y determinación. La fuerza no nace del acero, sino de quien decide levantarse una vez más.",
  },
  {
    id: "torii",
    index: "02",
    slug: "torii-tee",
    name: "Torii Tee",
    price: 42000,
    description: "Oversize · Bordado premium",
    image: "/images/TORI-sinfondo.png",
    storyImage: "/images/FINALTORIH.png",
    storyQuote: "Hay lugares que no solo se atraviesan. Se sienten.",
    storyText:
      "El instante en el que dejás atrás una versión de vos mismo para convertirte en alguien mejor.",
  },
  {
    id: "sakura",
    index: "03",
    slug: "sakura-tee",
    name: "Sakura Tee",
    price: 42000,
    description: "Oversize · Bordado premium",
    image: "/images/SAKURA-sinfondo.png",
    storyImage: "/images/FINAL_Sakura.png",
    storyQuote: "La belleza de la vida está en los momentos que no vuelven.",
    storyText:
      "Una pieza sobre renovación, presencia y la decisión de valorar aquello que existe ahora.",
  },
  {
    id: "fuji",
    index: "04",
    slug: "monte-fuji-tee",
    name: "Monte Fuji Tee",
    price: 42000,
    description: "Oversize · Bordado premium",
    image: "/images/MONTE-sinfondo.png",
    storyImage: "/images/FINAL_MONTEFUJIH.png",
    storyQuote: "Las cimas pertenecen a quienes nunca dejan de avanzar.",
    storyText:
      "Perseverancia, paciencia y un paso más. Incluso cuando la cima todavía parece lejana.",
  },
];

export function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}
