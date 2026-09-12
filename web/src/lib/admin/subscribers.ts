import { adminJson } from "./api";

export type AdminSubscriber = {
  id: string;
  email: string;
  unsubscribed: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
};

export function getAdminSubscribers(): Promise<AdminSubscriber[]> {
  return adminJson<AdminSubscriber[]>("/api/admin/subscribers");
}
