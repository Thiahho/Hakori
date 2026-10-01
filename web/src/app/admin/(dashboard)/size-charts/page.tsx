import Link from "next/link";
import { getAdminSizeCharts, type AdminSizeChart } from "@/lib/admin/size-charts";
import { DeleteSizeChartForm } from "@/components/admin/delete-size-chart-form";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Card } from "@/components/admin/ui/card";
import { Alert } from "@/components/admin/ui/alert";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { LinkButton } from "@/components/admin/ui/button";
import { PencilIcon, PlusIcon, RulerIcon } from "@/components/admin/ui/icons";

export const metadata = { title: "Plantillas de talles · Hakori Admin" };

function formatCurve(chart: AdminSizeChart): string {
  return chart.rows.some((r) => r.curveUnits > 0) ? chart.rows.map((r) => r.curveUnits).join("-") : "—";
}

export default async function AdminSizeChartsPage({ searchParams }: PageProps<"/admin/size-charts">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const created = params.created === "1";
  const deleted = params.deleted === "1";

  const charts = await getAdminSizeCharts();

  return (
    <div>
      <PageHeader
        title="Plantillas de talles"
        description="Talles, medidas y curva de stock reutilizables por tipo de prenda."
        action={
          <LinkButton href="/admin/size-charts/new" variant="primary">
            <PlusIcon className="h-4 w-4" />
            Nueva plantilla
          </LinkButton>
        }
      />

      {error && <Alert tone="error">{error}</Alert>}
      {created && <Alert tone="success">Plantilla creada.</Alert>}
      {deleted && <Alert tone="success">Plantilla eliminada.</Alert>}

      <Card className="overflow-hidden">
        {charts.length === 0 ? (
          <EmptyState
            icon={<RulerIcon className="h-5 w-5" />}
            title="Todavía no hay plantillas"
            description="Creá una acá, o desde un producto con “Guardar esta tabla como plantilla”."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-5 py-3 font-medium">Nombre</th>
                  <th className="px-5 py-3 font-medium">Talles</th>
                  <th className="px-5 py-3 font-medium">Curva</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {charts.map((chart) => (
                  <tr key={chart.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/80">
                    <td className="px-5 py-3 font-medium text-neutral-900">{chart.name}</td>
                    <td className="px-5 py-3 text-neutral-600">{chart.rows.map((r) => r.size).join(" · ")}</td>
                    <td className="px-5 py-3 font-mono text-xs text-neutral-600">{formatCurve(chart)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/size-charts/${chart.id}`}
                          aria-label={`Editar ${chart.name}`}
                          title="Editar"
                          className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <DeleteSizeChartForm id={chart.id} name={chart.name} />
                      </div>
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
