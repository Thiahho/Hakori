import Link from "next/link";
import { getAdminProducts, totalStock } from "@/lib/admin/products";
import { formatPrice } from "@/lib/products";
import { DeleteProductForm } from "@/components/admin/delete-product-form";
import { PageHeader } from "@/components/admin/ui/page-header";
import { Card } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Alert } from "@/components/admin/ui/alert";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { LinkButton } from "@/components/admin/ui/button";
import { BoxIcon, PencilIcon, PlusIcon } from "@/components/admin/ui/icons";

const LOW_STOCK_THRESHOLD = 10;

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  const deleted = params.deleted === "1";

  const products = await getAdminProducts();

  return (
    <div>
      <PageHeader
        title="Productos"
        description={`${products.length} producto${products.length === 1 ? "" : "s"} en el catálogo`}
        action={
          <LinkButton href="/admin/products/new" variant="primary">
            <PlusIcon className="h-4 w-4" />
            Nuevo producto
          </LinkButton>
        }
      />

      {error && <Alert tone="error">{error}</Alert>}
      {deleted && <Alert tone="success">Producto eliminado.</Alert>}

      <Card className="overflow-hidden">
        {products.length === 0 ? (
          <EmptyState
            icon={<BoxIcon className="h-5 w-5" />}
            title="Todavía no hay productos"
            description="Creá el primero con “Nuevo producto”."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-5 py-3 font-medium">Producto</th>
                  <th className="px-5 py-3 font-medium">Slug</th>
                  <th className="px-5 py-3 text-right font-medium">Precio</th>
                  <th className="px-5 py-3 text-right font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const stock = totalStock(product);
                  return (
                    <tr key={product.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/80">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xs font-semibold text-neutral-500">
                            {product.index}
                          </span>
                          <span className="font-medium text-neutral-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-neutral-500">{product.slug}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-neutral-700">
                        {formatPrice(product.price)}
                      </td>
                      <td
                        className={`px-5 py-3 text-right tabular-nums ${
                          stock <= LOW_STOCK_THRESHOLD ? "font-medium text-amber-700" : "text-neutral-700"
                        }`}
                      >
                        {stock}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone={product.isActive ? "success" : "neutral"}>
                          {product.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/${product.id}`}
                            aria-label={`Editar ${product.name}`}
                            title="Editar"
                            className="rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <DeleteProductForm id={product.id} name={product.name} />
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
