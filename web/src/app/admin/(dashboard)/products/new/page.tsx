import Link from "next/link";
import { CreateProductForm } from "@/components/admin/create-product-form";
import { PageHeader } from "@/components/admin/ui/page-header";
import { ChevronLeftIcon } from "@/components/admin/ui/icons";

export const metadata = { title: "Nuevo producto · Hakori Admin" };

export default function NewProductPage() {
  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-800"
      >
        <ChevronLeftIcon className="h-3.5 w-3.5" />
        Productos
      </Link>
      <PageHeader title="Nuevo producto" />
      <CreateProductForm />
    </div>
  );
}
