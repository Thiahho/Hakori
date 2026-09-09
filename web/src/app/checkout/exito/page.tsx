import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OrderStatus } from "@/components/order-status";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <>
      <SiteHeader />
      <OrderStatus orderNumber={order} heading="¡Gracias por tu compra!" />
      <SiteFooter />
    </>
  );
}
