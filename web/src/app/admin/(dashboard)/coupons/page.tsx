import Link from "next/link";
import { getAdminCoupons } from "@/lib/admin/coupons";
import {
  COUPON_STATUS,
  formatCouponDiscount,
  formatCouponExpiry,
  formatCouponUses,
} from "@/lib/admin/coupon-format";
import { DeleteCouponForm } from "@/components/admin/delete-coupon-form";
import { ToggleCouponForm } from "@/components/admin/toggle-coupon-form";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Card } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Alert } from "@/components/admin/ui/alert";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { LinkButton } from "@/components/admin/ui/button";
import { PencilIcon, PlusIcon, TagIcon } from "@/components/admin/ui/icons";

export const metadata = { title: "Cupones · Hakori Admin" };

export default async function AdminCouponsPage({ searchParams }: PageProps<"/admin/coupons">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const created = params.created === "1";
  const deleted = params.deleted === "1";

  const coupons = await getAdminCoupons();

  return (
    <div>
      <PageHeader
        title="Cupones"
        description={`${coupons.length} cupón${coupons.length === 1 ? "" : "es"}`}
        action={
          <LinkButton href="/admin/coupons/new" variant="primary">
            <PlusIcon className="h-4 w-4" />
            Nuevo cupón
          </LinkButton>
        }
      />

      {error && <Alert tone="error">{error}</Alert>}
      {created && <Alert tone="success">Cupón creado.</Alert>}
      {deleted && <Alert tone="success">Cupón eliminado.</Alert>}

      <Card className="overflow-hidden">
        {coupons.length === 0 ? (
          <EmptyState
            icon={<TagIcon className="h-5 w-5" />}
            title="Todavía no hay cupones"
            description="Creá el primero con “Nuevo cupón”."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-5 py-3 font-medium">Código</th>
                  <th className="px-5 py-3 text-right font-medium">Descuento</th>
                  <th className="px-5 py-3 text-right font-medium">Usos</th>
                  <th className="px-5 py-3 font-medium">Vence</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => {
                  const status = COUPON_STATUS[coupon.status];
                  return (
                    <tr key={coupon.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/80">
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="font-mono font-medium text-neutral-900">{coupon.code}</span>
                          {coupon.onePerEmail && <span className="text-xs text-neutral-400">Un uso por email</span>}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-neutral-700">
                        {formatCouponDiscount(coupon)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-neutral-700">
                        {formatCouponUses(coupon)}
                      </td>
                      <td className="px-5 py-3 text-neutral-600">{formatCouponExpiry(coupon.expiresAt)}</td>
                      <td className="px-5 py-3">
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <ToggleCouponForm id={coupon.id} isActive={coupon.isActive} />
                          <Link
                            href={`/admin/coupons/${coupon.id}`}
                            aria-label={`Editar ${coupon.code}`}
                            title="Editar"
                            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <DeleteCouponForm id={coupon.id} code={coupon.code} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
