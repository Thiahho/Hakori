import Link from "next/link";
import { confirmOrder, getOrder, type Order } from "@/lib/cart";
import { formatPrice } from "@/lib/products";

const STATUS_LABELS: Record<string, string> = {
  Created: "Iniciada",
  PendingPayment: "Esperando confirmación de pago",
  Paid: "Pagada",
  Cancelled: "Cancelada",
  Expired: "Expirada",
};

async function loadOrder(orderNumber: string, paymentId: string | undefined): Promise<Order | null> {
  // MP sends payment_id=null when the buyer leaves without paying.
  if (paymentId && /^\d+$/.test(paymentId)) {
    const confirmed = await confirmOrder(orderNumber, paymentId).catch(() => null);
    if (confirmed) return confirmed;
  }
  return getOrder(orderNumber).catch(() => null);
}

export async function OrderStatus({
  orderNumber,
  paymentId,
  heading,
  unpaidHeading,
}: {
  orderNumber: string | undefined;
  /** MercadoPago's payment_id from the return URL — lets us confirm without waiting for the webhook. */
  paymentId?: string;
  heading: string;
  /** Shown instead of `heading` while the order isn't confirmed as paid. */
  unpaidHeading?: string;
}) {
  const order = orderNumber ? await loadOrder(orderNumber, paymentId) : null;
  const title = unpaidHeading && order?.status !== "Paid" ? unpaidHeading : heading;

  return (
    <main className="mx-auto max-w-lg px-6 pb-24 pt-40 text-center">
      <h1 className="font-display text-3xl">{title}</h1>

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
