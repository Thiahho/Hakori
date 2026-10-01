import Link from "next/link";
import { getAdminCoupon } from "@/lib/admin/coupons";
import { COUPON_STATUS, formatCouponDiscount } from "@/lib/admin/coupon-format";
import { CouponForm } from "@/components/admin/coupon-form";
import { DeleteCouponForm } from "@/components/admin/delete-coupon-form";
import { PageHeader } from "@/components/admin/ui/page-header";
import { ChevronLeftIcon } from "@/components/admin/ui/icons";

export default async function EditCouponPage({ params, searchParams }: PageProps<"/admin/coupons/[id]">) {
  const { id } = await params;
  const search = await searchParams;
  const saved = search.saved === "1";

  const coupon = await getAdminCoupon(id);

  return (
    <div>
      <Link
        href="/admin/coupons"
        className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-800"
      >
        <ChevronLeftIcon className="h-3.5 w-3.5" />
        Cupones
      </Link>
      <PageHeader
        title={coupon.code}
        description={`${formatCouponDiscount(coupon)} de descuento · ${COUPON_STATUS[coupon.status].label}`}
        action={<DeleteCouponForm id={coupon.id} code={coupon.code} variant="button" />}
      />
      <CouponForm coupon={coupon} saved={saved} />
    </div>
  );
}
