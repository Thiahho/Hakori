export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export type LegalPage = {
  slug: string;
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
};

export const legalPages: LegalPage[] = [
  {
    slug: "privacidad",
    title: "Política de Privacidad",
    updatedAt: "Septiembre 2026",
    intro:
      "En Hakori.co respetamos tu privacidad. Esta política explica qué datos personales recolectamos, para qué los usamos y qué derechos tenés sobre ellos, conforme a la Ley 25.326 de Protección de Datos Personales de Argentina.",
    sections: [
      {
        heading: "Qué datos recolectamos",
        paragraphs: [
          "Recolectamos los datos que nos proporcionás directamente, como nombre, email, dirección de envío y datos de pago al realizar una compra o suscribirte a nuestra lista de espera.",
          "También recolectamos datos técnicos de forma automática, como dirección IP, tipo de navegador y páginas visitadas, para entender cómo se usa el sitio.",
        ],
      },
      {
        heading: "Para qué usamos tus datos",
        paragraphs: [
          "Usamos tu información para procesar pedidos, gestionar envíos, responder consultas, enviarte novedades sobre nuevos drops (solo si te suscribiste) y mejorar la experiencia del sitio.",
          "No vendemos ni alquilamos tus datos personales a terceros.",
        ],
      },
      {
        heading: "Con quién compartimos tus datos",
        paragraphs: [
          "Compartimos datos únicamente con proveedores necesarios para operar el negocio: pasarelas de pago, empresas de logística y herramientas de email marketing, siempre bajo acuerdos de confidencialidad.",
        ],
      },
      {
        heading: "Tus derechos",
        paragraphs: [
          "Podés solicitar acceso, rectificación o eliminación de tus datos personales en cualquier momento escribiéndonos a hola@hakori.co. La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley 25.326, tiene la atribución de atender denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.",
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: "Política de Cookies",
    updatedAt: "Septiembre 2026",
    intro:
      "Este sitio utiliza cookies propias y de terceros para mejorar tu experiencia de navegación, recordar tus preferencias y analizar el uso del sitio.",
    sections: [
      {
        heading: "Qué es una cookie",
        paragraphs: [
          "Una cookie es un pequeño archivo de texto que se guarda en tu navegador cuando visitás un sitio web. Nos permite reconocer tu dispositivo en futuras visitas.",
        ],
      },
      {
        heading: "Qué cookies usamos",
        paragraphs: [
          "Cookies esenciales: necesarias para el funcionamiento del sitio, como recordar el contenido de tu carrito o tu elección de consentimiento de cookies.",
          "Cookies de analítica: nos ayudan a entender cómo los usuarios navegan el sitio, para poder mejorarlo. Solo se activan si aceptás su uso.",
        ],
      },
      {
        heading: "Cómo administrar tus cookies",
        paragraphs: [
          "Podés aceptar o rechazar el uso de cookies no esenciales desde el banner que aparece al ingresar al sitio. También podés borrar las cookies almacenadas o bloquearlas desde la configuración de tu navegador en cualquier momento.",
        ],
      },
    ],
  },
  {
    slug: "seguridad",
    title: "Política de Seguridad",
    updatedAt: "Septiembre 2026",
    intro:
      "La seguridad de tus datos y tus compras es una prioridad. Acá te contamos qué medidas tomamos para protegerlos.",
    sections: [
      {
        heading: "Protección de datos",
        paragraphs: [
          "Toda la comunicación entre tu navegador y nuestro sitio viaja cifrada mediante HTTPS. No almacenamos datos completos de tarjetas de crédito en nuestros servidores: el pago se procesa a través de pasarelas de pago certificadas.",
        ],
      },
      {
        heading: "Acceso a la información",
        paragraphs: [
          "El acceso a los datos de clientes está restringido al personal que lo necesita para operar el negocio (procesar pedidos, atender consultas, gestionar envíos).",
        ],
      },
      {
        heading: "Reportar un problema",
        paragraphs: [
          "Si detectás una vulnerabilidad de seguridad en el sitio o creés que tu cuenta fue comprometida, escribinos de inmediato a hola@hakori.co.",
        ],
      },
    ],
  },
];

export function getLegalPage(slug: string) {
  return legalPages.find((page) => page.slug === slug);
}
