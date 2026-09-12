import { adminJson } from "./api";

export type AdminOrderListItem = {
  orderNumber: string;
  status: string;
  email: string;
  total: number;
  createdAt: string;
};

export type AdminOrderItem = {
  productName: string;
  size: string;
  unitPrice: number;
  quantity: number;
};

export type AdminOrder = {
  orderNumber: string;
  status: string;
  email: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingPhone: string;
  total: number;
  mercadoPagoPreferenceId: string | null;
  mercadoPagoPaymentId: string | null;
  createdAt: string;
  paidAt: string | null;
  expiresAt: string | null;
  items: AdminOrderItem[];
};

export const ORDER_STATUSES = ["Created", "PendingPayment", "Paid", "Cancelled", "Expired"] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  Created: "Creada",
  PendingPayment: "Pendiente de pago",
  Paid: "Pagada",
  Cancelled: "Cancelada",
  Expired: "Expirada",
};

export function getAdminOrders(status?: string): Promise<AdminOrderListItem[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return adminJson<AdminOrderListItem[]>(`/api/admin/orders${query}`);
}

export function getAdminOrder(orderNumber: string): Promise<AdminOrder> {
  return adminJson<AdminOrder>(`/api/admin/orders/${encodeURIComponent(orderNumber)}`);
}
