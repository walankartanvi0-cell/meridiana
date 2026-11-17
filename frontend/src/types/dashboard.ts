import type { AuthUser } from "./auth";

export type BuyerProfile = {
  _id: string;
  user: string | AuthUser;
  companyName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  industries: string[];
  geographies: string[];
  ebitdaMin?: number;
  ebitdaMax?: number;
  dealType?: string;
  notes?: string;
  status: "active" | "paused";
};

export type SellerProfile = {
  _id: string;
  user: string | AuthUser;
  companyName: string;
  industry?: string;
  location?: string;
  revenue?: number;
  ebitda?: number;
  yearFounded?: number;
  description?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  status: "draft" | "active" | "closed";
};

export type NotificationRecord = {
  _id: string;
  title: string;
  message: string;
  type: "system" | "account" | "deal" | "document" | "meeting";
  read: boolean;
  link?: string;
  createdAt: string;
};

export type AnalyticsData = {
  totalUsers: number;
  byRole: {
    admin: number;
    advisor: number;
    buyer: number;
    seller: number;
  };
  buyerProfiles: number;
  sellerProfiles: number;
  inquiries: number;
  unreadNotifications: number;
};
