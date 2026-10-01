import Link from "next/link";
import { CouponForm } from "@/components/admin/coupon-form";
import { PageHeader } from "@/components/admin/ui/page-header";
import { ChevronLeftIcon } from "@/components/admin/ui/icons";

export const metadata = { title: "Nuevo cupón · Hakori Admin" };

export default function NewCouponPage() {
  return (
    <div>
      <Link
        href="/admin/coupons"
        className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-800"
      >
        <ChevronLeftIcon className="h-3.5 w-3.5" />
        Cupones
      </Link>
      <PageHeader title="Nuevo cupón" />
      <CouponForm />
    </div>
  );
}
