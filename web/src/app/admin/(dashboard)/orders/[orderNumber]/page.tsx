import Link from "next/link";
import { getAdminOrder } from "@/lib/admin/orders";
import { formatPrice } from "@/lib/products";
import { markOrderPaidAction, cancelOrderAction } from "@/lib/admin/orders-actions";
import { Card, CardHeader } from "@/components/admin/ui/card";
import { OrderStatusBadge } from "@/components/admin/ui/order-status-badge";
import { Button } from "@/components/admin/ui/button";
import { ChevronLeftIcon } from "@/components/admin/ui/icons";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 px-5 py-3">
      <span className="text-xs uppercase tracking-wide text-neutral-500">{label}</span>
      <span className="text-sm text-neutral-800">{value}</span>
    </div>
  );
}

export default async function AdminOrderDetailPage({ params }: PageProps<"/admin/orders/[orderNumber]">) {
  const { orderNumber } = await params;
  const order = await getAdminOrder(orderNumber);
  const canAct = order.status !== "Paid" && order.status !== "Cancelled";

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-800"
      >
        <ChevronLeftIcon className="h-3.5 w-3.5" />
        Órdenes
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-lg font-semibold text-neutral-900">{order.orderNumber}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        {canAct && (
          <div className="flex gap-2">
            <form action={cancelOrderAction}>
              <input type="hidden" name="orderNumber" value={order.orderNumber} />
              <Button type="submit" variant="destructive" size="sm">
                Cancelar orden
              </Button>
            </form>
            <form action={markOrderPaidAction}>
              <input type="hidden" name="orderNumber" value={order.orderNumber} />
              <Button type="submit" variant="primary" size="sm">
                Marcar como pagada
              </Button>
            </form>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader title="Productos" />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
                    <th className="px-5 py-3 font-medium">Producto</th>
                    <th className="px-5 py-3 font-medium">Talle</th>
                    <th className="px-5 py-3 text-right font-medium">Precio unit.</th>
                    <th className="px-5 py-3 text-right font-medium">Cant.</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={i} className="border-b border-neutral-50 last:border-0">
                      <td className="px-5 py-3 text-neutral-800">{item.productName}</td>
                      <td className="px-5 py-3 text-neutral-500">{item.size}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-neutral-700">
                        {formatPrice(item.unitPrice)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-neutral-700">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  {order.discountAmount > 0 && (
                    <>
                      <tr className="border-t border-neutral-100">
                        <td colSpan={3} className="px-5 pt-3 text-right text-sm text-neutral-500">
                          Subtotal
                        </td>
                        <td className="px-5 pt-3 text-right text-sm tabular-nums text-neutral-700">
                          {formatPrice(order.subtotal)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-5 pt-1 text-right text-sm text-neutral-500">
                          Descuento
                          {order.couponCode && (
                            <span className="ml-1 font-mono text-xs text-neutral-700">({order.couponCode})</span>
                          )}
                        </td>
                        <td className="px-5 pt-1 text-right text-sm tabular-nums text-emerald-700">
                          −{formatPrice(order.discountAmount)}
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className={order.discountAmount > 0 ? "" : "border-t border-neutral-100"}>
                    <td colSpan={3} className="px-5 py-3 text-right text-sm font-medium text-neutral-500">
                      Total
                    </td>
                    <td className="px-5 py-3 text-right text-sm font-semibold tabular-nums text-neutral-900">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card className="divide-y divide-neutral-50">
            <CardHeader title="Cliente y envío" />
            <Row label="Email" value={order.email} />
            <Row
              label="Dirección"
              value={
                <>
                  {order.shippingName} — {order.shippingAddress}, {order.shippingCity} ({order.shippingPostalCode})
                </>
              }
            />
            <Row label="Teléfono" value={order.shippingPhone} />
          </Card>

          <Card className="divide-y divide-neutral-50">
            <CardHeader title="Pago" />
            <Row label="Preferencia de Mercado Pago" value={order.mercadoPagoPreferenceId ?? "—"} />
            <Row label="ID de pago" value={order.mercadoPagoPaymentId ?? "—"} />
            <Row label="Creada" value={new Date(order.createdAt).toLocaleString("es-AR")} />
            <Row label="Pagada" value={order.paidAt ? new Date(order.paidAt).toLocaleString("es-AR") : "—"} />
          </Card>
        </div>
      </div>
    </div>
  );
}
