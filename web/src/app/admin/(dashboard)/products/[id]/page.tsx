import Link from "next/link";
import { getAdminProduct } from "@/lib/admin/products";
import { EditProductForm } from "@/components/admin/edit-product-form";
import { DeleteProductForm } from "@/components/admin/delete-product-form";
import { PageHeader } from "@/components/admin/ui/page-header";
import { ChevronLeftIcon } from "@/components/admin/ui/icons";

export default async function EditProductPage({
  params,
  searchParams,
}: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const search = await searchParams;
  const saved = search.saved === "1";

  const product = await getAdminProduct(id);

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-800"
      >
        <ChevronLeftIcon className="h-3.5 w-3.5" />
        Productos
      </Link>
      <PageHeader
        title={product.name}
        description={`/${product.slug}`}
        action={<DeleteProductForm id={product.id} name={product.name} variant="button" />}
      />
      <EditProductForm product={product} saved={saved} />
    </div>
  );
}
