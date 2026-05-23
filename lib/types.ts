import type { ServerOption } from "@/lib/constants";

export type RevenueEntryView = {
  id: string;
  server: ServerOption;
  date: string;
  revenu: string;
  createdAt: string;
  updatedAt: string;
};
