import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { StatsCards } from "@/components/StatsCards";
import { RecentTransactions } from "@/components/RecentTransactions";
import { CommissionChart } from "@/components/CommissionChart";
import { useIndexData } from "@/hooks/useIndexData";

export interface ClientInfo {
  id: string;
  user_id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  revio_id: string | null;
  agent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  commission: number | null;
  is_paid: boolean | null;
  date_paid: string | null;
  payment_method: string | null;
  reference_number: string | null;
  invoice_number: string | null;
  invoice_month: string | null;
  invoice_year: string | null;
  client_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const Index = () => {
  const {
    totalClients,
    totalRevenue,
    totalCommissions,
    recentTransactions,
    commissionData,
    isLoading,
  } = useIndexData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Header />
        <StatsCards
          totalClients={totalClients}
          totalRevenue={totalRevenue}
          totalCommissions={totalCommissions}
          isLoading={isLoading}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RecentTransactions transactions={recentTransactions} isLoading={isLoading} />
          <CommissionChart commissionData={commissionData} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Index;
