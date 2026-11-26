import React from "react";
import type { Metadata } from "next";
import { MarketingDashboardClient } from "@/components/admin/marketing/MarketingDashboardClient";

export const metadata: Metadata = {
  title: "AI Marketing & B2B Prospecting Command Center | WebziFire Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminMarketingPage() {
  return <MarketingDashboardClient />;
}
