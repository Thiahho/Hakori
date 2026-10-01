import { adminJson } from "./api";

export type SizeChartRow = {
  size: string;
  chestCm: number | null;
  lengthCm: number | null;
  sleeveCm: number | null;
  /** Units of this size per "curva". 0 = none. */
  curveUnits: number;
};

export type AdminSizeChart = {
  id: string;
  name: string;
  rows: SizeChartRow[];
};

export function getAdminSizeCharts(): Promise<AdminSizeChart[]> {
  return adminJson<AdminSizeChart[]>("/api/admin/size-charts");
}

export function getAdminSizeChart(id: string): Promise<AdminSizeChart> {
  return adminJson<AdminSizeChart>(`/api/admin/size-charts/${id}`);
}
