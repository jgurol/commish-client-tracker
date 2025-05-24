
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Transaction, Client } from "@/pages/Index";

export const useTransactionActions = (
  clients: Client[],
  fetchTransactions: () => void
) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Helper function to calculate commission using override hierarchy
  const calculateCommission = async (
    amount: number,
    clientId: string,
    clientInfoId?: string,
    transactionOverride?: number
  ): Promise<number> => {
    // 1. Transaction override takes highest precedence
    if (transactionOverride !== undefined && transactionOverride !== null) {
      return (transactionOverride / 100) * amount;
    }

    // 2. Client override takes second precedence
    if (clientInfoId) {
      const { data: clientInfo } = await supabase
        .from('client_info')
        .select('commission_override')
        .eq('id', clientInfoId)
        .single();

      if (clientInfo?.commission_override !== null && clientInfo?.commission_override !== undefined) {
        return (clientInfo.commission_override / 100) * amount;
      }
    }

    // 3. Agent commission rate is the default
    const client = clients.find(c => c.id === clientId);
    if (client) {
      return (client.commissionRate / 100) * amount;
    }

    return 0;
  };

  // Function to add a new transaction to Supabase
  const addTransaction = async (newTransaction: Omit<Transaction, "id">) => {
    if (!user) return;
    
    try {
      // Calculate commission using override hierarchy
      const commission = await calculateCommission(
        newTransaction.amount,
        newTransaction.clientId,
        newTransaction.clientInfoId,
        newTransaction.commissionOverride
      );

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          client_id: newTransaction.clientId,
          client_info_id: newTransaction.clientInfoId === "none" ? null : newTransaction.clientInfoId,
          amount: newTransaction.amount,
          date: newTransaction.date,
          description: newTransaction.description,
          date_paid: newTransaction.datePaid,
          payment_method: newTransaction.paymentMethod,
          reference_number: newTransaction.referenceNumber,
          invoice_month: newTransaction.invoiceMonth,
          invoice_year: newTransaction.invoiceYear,
          invoice_number: newTransaction.invoiceNumber,
          is_paid: newTransaction.isPaid || false,
          commission: commission,
          commission_override: newTransaction.commissionOverride || null,
          is_approved: false, // Default to not approved
          commission_paid_date: newTransaction.commissionPaidDate || null,
          user_id: user.id
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error adding transaction:', error);
        toast({
          title: "Failed to add transaction",
          description: error.message,
          variant: "destructive"
        });
      } else if (data) {
        // Refresh transactions to get the new one
        fetchTransactions();
        
        const client = clients.find(c => c.id === newTransaction.clientId);
        toast({
          title: "Transaction added",
          description: `Transaction for ${client?.name} has been added successfully.`,
        });
      }
    } catch (err) {
      console.error('Error in add transaction operation:', err);
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive"
      });
    }
  };

  // Function to update a transaction in Supabase
  const updateTransaction = async (updatedTransaction: Transaction) => {
    if (!user) return;
    
    try {
      // Calculate commission using override hierarchy
      const commission = await calculateCommission(
        updatedTransaction.amount,
        updatedTransaction.clientId,
        updatedTransaction.clientInfoId,
        updatedTransaction.commissionOverride
      );

      const { data, error } = await supabase
        .from('transactions')
        .update({
          client_id: updatedTransaction.clientId,
          client_info_id: updatedTransaction.clientInfoId === "none" ? null : updatedTransaction.clientInfoId,
          amount: updatedTransaction.amount,
          date: updatedTransaction.date,
          description: updatedTransaction.description,
          date_paid: updatedTransaction.datePaid,
          payment_method: updatedTransaction.paymentMethod,
          reference_number: updatedTransaction.referenceNumber,
          invoice_month: updatedTransaction.invoiceMonth,
          invoice_year: updatedTransaction.invoiceYear,
          invoice_number: updatedTransaction.invoiceNumber,
          is_paid: updatedTransaction.isPaid || false,
          commission: commission,
          commission_override: updatedTransaction.commissionOverride || null,
          is_approved: updatedTransaction.isApproved || false,
          commission_paid_date: updatedTransaction.commissionPaidDate || null
        })
        .eq('id', updatedTransaction.id)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating transaction:', error);
        toast({
          title: "Failed to update transaction",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Refresh transactions to get the updated one
        fetchTransactions();
        
        const client = clients.find(c => c.id === updatedTransaction.clientId);
        toast({
          title: "Transaction updated",
          description: `Transaction for ${client?.name} has been updated successfully.`,
        });
      }
    } catch (err) {
      console.error('Error in update transaction operation:', err);
      toast({
        title: "Error",
        description: "Failed to update transaction",
        variant: "destructive"
      });
    }
  };

  // Function to approve a commission
  const approveCommission = async (transactionId: string) => {
    if (!user) return;
    
    try {
      // First, check if the transaction's invoice has been paid
      const { data: transactionData, error: fetchError } = await supabase
        .from('transactions')
        .select('is_paid')
        .eq('id', transactionId)
        .single();

      if (fetchError) {
        console.error('[approveCommission] Error fetching transaction:', fetchError);
        toast({
          title: "Error",
          description: "Failed to verify transaction status",
          variant: "destructive"
        });
        return;
      }

      if (!transactionData.is_paid) {
        toast({
          title: "Cannot approve commission",
          description: "The invoice must be paid before approving the commission",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .update({
          is_approved: true
        })
        .eq('id', transactionId)
        .select('*')
        .single();

      if (error) {
        console.error('[approveCommission] Error approving commission:', error);
        toast({
          title: "Failed to approve commission",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Refresh transactions to get the updated one
        fetchTransactions();
        toast({
          title: "Commission approved",
          description: "The commission has been approved successfully.",
        });
      }
    } catch (err) {
      console.error('[approveCommission] Error in approve commission operation:', err);
      toast({
        title: "Error",
        description: "Failed to approve commission",
        variant: "destructive"
      });
    }
  };

  // Function to mark a commission as paid
  const payCommission = async (transactionId: string, paidDate: string) => {
    if (!user) return;
    
    try {
      // First, check if the transaction's invoice has been paid
      const { data: transactionData, error: fetchError } = await supabase
        .from('transactions')
        .select('is_paid')
        .eq('id', transactionId)
        .single();

      if (fetchError) {
        console.error('[payCommission] Error fetching transaction:', fetchError);
        toast({
          title: "Error",
          description: "Failed to verify transaction status",
          variant: "destructive"
        });
        return;
      }

      if (!transactionData.is_paid) {
        toast({
          title: "Cannot pay commission",
          description: "The invoice must be paid before paying the commission",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .update({
          commission_paid_date: paidDate
        })
        .eq('id', transactionId)
        .select('*')
        .single();

      if (error) {
        console.error('[payCommission] Error marking commission as paid:', error);
        toast({
          title: "Failed to mark commission as paid",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Refresh transactions to get the updated one
        fetchTransactions();
        toast({
          title: "Commission marked as paid",
          description: `The commission has been marked as paid on ${new Date(paidDate).toLocaleDateString()}.`,
        });
      }
    } catch (err) {
      console.error('[payCommission] Error in pay commission operation:', err);
      toast({
        title: "Error",
        description: "Failed to mark commission as paid",
        variant: "destructive"
      });
    }
  };

  // Function to delete a transaction
  const deleteTransaction = async (transactionId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase.rpc('delete_transaction', {
        transaction_id: transactionId
      });

      if (error) {
        console.error('[deleteTransaction] Error deleting transaction:', error);
        toast({
          title: "Failed to delete transaction",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Refresh transactions to reflect the deletion
        fetchTransactions();
        toast({
          title: "Transaction deleted",
          description: "The transaction has been deleted successfully.",
        });
      }
    } catch (err) {
      console.error('[deleteTransaction] Error in delete transaction operation:', err);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive"
      });
    }
  };

  return {
    addTransaction,
    updateTransaction,
    approveCommission,
    payCommission,
    deleteTransaction
  };
};
