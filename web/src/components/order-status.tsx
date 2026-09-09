import Link from "next/link";
import { getOrder } from "@/lib/cart";
import { formatPrice } from "@/lib/products";

const STATUS_LABELS: Record<string, string> = {
  Created: "Iniciada",
  PendingPayment: "Esperando confirmación de pago",
  Paid: "Pagada",
  Cancelled: "Cancelada",
  Expired: "Expirada",
};

export async function OrderStatus({
  orderNumber,
  heading,
}: {
  orderNumber: string | undefined;
  heading: string;
}) {
  const order = orderNumber ? await getOrder(orderNumber).catch(() => null) : null;

  return (
    <main className="mx-auto max-w-lg px-6 pb-24 pt-40 text-center">
      <h1 className="font-display text-3xl">{heading}</h1>

      {order ? (
        <div className="mt-8 border border-ink/15 p-6 text-left">
          <p className="text-xs uppercase tracking-widest text-ink/50">Orden</p>
          <p className="text-sm">{order.orderNumber}</p>
          <p className="mt-3 text-xs uppercase tracking-widest text-ink/50">Estado</p>
          <p className="text-sm">{STATUS_LABELS[order.status] ?? order.status}</p>
          <p className="mt-3 text-xs uppercase tracking-widest text-ink/50">Total</p>
          <p className="text-sm">{formatPrice(order.total)}</p>
          <ul className="mt-4 space-y-1 text-xs text-ink/70">
            {order.items.map((item, i) => (
              <li key={i}>
                {item.quantity}× {item.productName} (talle {item.size})
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-6 text-sm text-ink/60">No encontramos los datos de esa orden.</p>
      )}

      <Link
        href="/"
        className="mt-10 inline-block text-xs uppercase tracking-widest underline underline-offset-4"
      >
        Volver al inicio →
      </Link>
    </main>
  );
}
