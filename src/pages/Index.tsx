
import { useIndexData } from "@/hooks/useIndexData";
import { useTransactionActions } from "@/hooks/useTransactionActions";
import { useClientActions } from "@/hooks/useClientActions";
import { IndexPageLayout } from "@/components/IndexPageLayout";

// Define the Client type
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

// Define the Transaction type
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
  agent_id: string | null;
  created_at: string;
  updated_at: string;
}

const IndexPage = () => {
  const {
    clients,
    setClients,
    transactions,
    clientInfos,
    associatedAgentId,
    fetchClients,
    fetchTransactions
  } = useIndexData();

  const {
    addTransaction,
    updateTransaction,
    approveCommission,
    payCommission,
    deleteTransaction
  } = useTransactionActions(clients, fetchTransactions);

  const {
    addClient
  } = useClientActions(clients, setClients, fetchClients);

  return (
    <IndexPageLayout
      clients={clients}
      transactions={transactions}
      clientInfos={clientInfos}
      associatedAgentId={associatedAgentId}
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

export default IndexPage;
