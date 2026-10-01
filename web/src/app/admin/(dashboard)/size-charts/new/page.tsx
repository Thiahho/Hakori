import Link from "next/link";
import { SizeChartForm } from "@/components/admin/size-chart-form";
import { PageHeader } from "@/components/admin/ui/page-header";
import { ChevronLeftIcon } from "@/components/admin/ui/icons";

export const metadata = { title: "Nueva plantilla de talles · Hakori Admin" };

export default function NewSizeChartPage() {
  return (
    <div>
      <Link
        href="/admin/size-charts"
        className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-800"
      >
        <ChevronLeftIcon className="h-3.5 w-3.5" />
        Plantillas de talles
      </Link>
      <PageHeader title="Nueva plantilla" />
      <SizeChartForm />
    </div>
  );
}
