import Link from "next/link";
import { getAdminSizeChart } from "@/lib/admin/size-charts";
import { SizeChartForm } from "@/components/admin/size-chart-form";
import { DeleteSizeChartForm } from "@/components/admin/delete-size-chart-form";
import { PageHeader } from "@/components/admin/ui/page-header";
import { ChevronLeftIcon } from "@/components/admin/ui/icons";

export default async function EditSizeChartPage({ params, searchParams }: PageProps<"/admin/size-charts/[id]">) {
  const { id } = await params;
  const search = await searchParams;
  const saved = search.saved === "1";

  const chart = await getAdminSizeChart(id);

  return (
    <div>
      <Link
        href="/admin/size-charts"
        className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-800"
      >
        <ChevronLeftIcon className="h-3.5 w-3.5" />
        Plantillas de talles
      </Link>
      <PageHeader
        title={chart.name}
        description={chart.rows.map((r) => r.size).join(" · ")}
        action={<DeleteSizeChartForm id={chart.id} name={chart.name} variant="button" />}
      />
      <SizeChartForm chart={chart} saved={saved} />
    </div>
  );
}
