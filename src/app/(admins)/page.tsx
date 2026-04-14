import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import React from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import RecentOrders from "@/components/ecommerce/RecentOrders";
import DemographicCard from "@/components/ecommerce/DemographicCard";

export const metadata: Metadata = {
  title:
    "Dashboard",
  description: "Dashboard Rutakade Mobile",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-12 space-y-6">
        <EcommerceMetrics />
      </div>
    </div>
  );
}
