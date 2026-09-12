import { getAdminSubscribers } from "@/lib/admin/subscribers";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Card } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { MailIcon } from "@/components/admin/ui/icons";

export default async function AdminSubscribersPage() {
  const subscribers = await getAdminSubscribers();
  const activeCount = subscribers.filter((s) => !s.unsubscribed).length;

  return (
    <div>
      <PageHeader
        title="Suscriptores"
        description={`${activeCount} activo${activeCount === 1 ? "" : "s"} de ${subscribers.length} en total`}
      />

      <Card className="overflow-hidden">
        {subscribers.length === 0 ? (
          <EmptyState icon={<MailIcon className="h-5 w-5" />} title="Todavía no hay suscriptores" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 font-medium">Suscripto</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/80">
                    <td className="px-5 py-3 text-neutral-800">{s.email}</td>
                    <td className="px-5 py-3">
                      <Badge tone={s.unsubscribed ? "neutral" : "success"}>
                        {s.unsubscribed ? "Desuscripto" : "Activo"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-neutral-500">{new Date(s.subscribedAt).toLocaleString("es-AR")}</td>
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
