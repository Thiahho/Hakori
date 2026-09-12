import Link from "next/link";
import { getAdminOrders, ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/admin/orders";
import { formatPrice } from "@/lib/products";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Card } from "@/components/admin/ui/card";
import { OrderStatusBadge } from "@/components/admin/ui/order-status-badge";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { ReceiptIcon } from "@/components/admin/ui/icons";

function FilterPill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-ink text-white" : "bg-white text-neutral-600 hover:bg-neutral-100"
      }`}
    >
      {children}
    </Link>
  );
}

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";

  const orders = await getAdminOrders(status || undefined);

  return (
    <div>
      <PageHeader title="Órdenes" description={`${orders.length} orden${orders.length === 1 ? "" : "es"}`} />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        <FilterPill href="/admin/orders" active={!status}>
          Todos los estados
        </FilterPill>
        {ORDER_STATUSES.map((s) => (
          <FilterPill key={s} href={`/admin/orders?status=${s}`} active={status === s}>
            {ORDER_STATUS_LABELS[s]}
          </FilterPill>
        ))}
      </div>

      <Card className="overflow-hidden">
        {orders.length === 0 ? (
          <EmptyState
            icon={<ReceiptIcon className="h-5 w-5" />}
            title="No hay órdenes"
            description={status ? "Probá con otro estado." : "Todavía no se generó ninguna orden."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-5 py-3 font-medium">Orden</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderNumber} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/80">
                    <td className="px-5 py-3 font-mono text-xs text-neutral-700">{order.orderNumber}</td>
                    <td className="px-5 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 text-neutral-700">{order.email}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-neutral-700">{formatPrice(order.total)}</td>
                    <td className="px-5 py-3 text-neutral-500">
                      {new Date(order.createdAt).toLocaleString("es-AR")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.orderNumber}`}
                        className="text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:underline"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
