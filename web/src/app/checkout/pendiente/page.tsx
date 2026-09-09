import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OrderStatus } from "@/components/order-status";

export default async function CheckoutPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <>
      <SiteHeader />
      <OrderStatus orderNumber={order} heading="Tu pago está siendo procesado" />
      <SiteFooter />
    </>
  );
}
