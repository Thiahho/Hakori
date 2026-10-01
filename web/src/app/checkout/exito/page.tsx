import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OrderStatus } from "@/components/order-status";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; payment_id?: string }>;
}) {
  const { order, payment_id } = await searchParams;

  return (
    <>
      <SiteHeader />
      <OrderStatus
        orderNumber={order}
        paymentId={payment_id}
        heading="¡Gracias por tu compra!"
        unpaidHeading="Tu pago está siendo procesado"
      />
      <SiteFooter />
    </>
  );
}
