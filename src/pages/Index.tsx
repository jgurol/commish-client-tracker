
import { IndexPageLayout } from "@/components/IndexPageLayout";
import { useIndexData } from "@/hooks/useIndexData";
import { useTransactionActions } from "@/hooks/useTransactionActions";
import { useClientActions } from "@/hooks/useClientActions";

// Define the Client type (for agents)
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  companyName: string | null;
  commissionRate: number;
  totalEarnings: number;
  lastPayment: string;
}

// Define the Transaction type (transformed from database)
export interface Transaction {
  id: string;
  clientId: string;
  clientName: string;
  companyName: string;
  amount: number;
  date: string;
  description: string;
  datePaid?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  invoiceMonth?: string;
  invoiceYear?: string;
  invoiceNumber?: string;
  isPaid?: boolean;
  commission?: number;
  isApproved?: boolean;
  clientInfoId?: string;
  clientCompanyName?: string;
  commissionPaidDate?: string;
  commissionOverride?: number;
}

// Define the ClientInfo type
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
  commission_override?: number | null;
}

const Index = () => {
  const {
    clients,
    setClients,
    transactions,
    setTransactions,
    clientInfos,
    setClientInfos,
    isLoading,
    associatedAgentId,
    associatedAgentInfo,
    fetchClients,
    fetchTransactions,
    fetchClientInfos
  } = useIndexData();

  const {
    addTransaction,
    updateTransaction,
    approveCommission,
    payCommission,
    deleteTransaction
  } = useTransactionActions(clients, fetchTransactions);

  const { addClient } = useClientActions(clients, setClients, fetchClients);

  return (
    <IndexPageLayout
      clients={clients}
      transactions={transactions}
      clientInfos={clientInfos}
      associatedAgentId={associatedAgentId}
      associatedAgentInfo={associatedAgentInfo}
      onAddClient={addClient}
      onAddTransaction={addTransaction}
      onUpdateTransaction={updateTransaction}
      onApproveCommission={approveCommission}
      onPayCommission={payCommission}
      onDeleteTransaction={deleteTransaction}
      onFetchClients={fetchClients}
    />
  );
};

export default Index;
