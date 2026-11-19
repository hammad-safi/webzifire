import React from "react";
import type { Metadata } from "next";
import SeoDashboardClient from "@/components/admin/SeoDashboardClient";

export const metadata: Metadata = {
  title: "SEO Automation Command Center | WebziFire Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminSeoPage() {
  return <SeoDashboardClient />;
}
