
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Client, Transaction } from "@/pages/Index";

interface AgentSummaryProps {
  clients: Client[];
  transactions: Transaction[];
  isAdmin: boolean;
}

export function AgentSummary({ clients, transactions, isAdmin }: AgentSummaryProps) {
  // Calculate commission due for each agent (approved but unpaid commissions)
  const getCommissionDue = (agentId: string) => {
    return transactions
      .filter(t => t.clientId === agentId && t.isApproved && !t.commissionPaidDate)
      .reduce((sum, t) => sum + (t.commission || 0), 0);
  };

  // Get top 3 agents by commission due
  const topAgents = [...clients]
    .map(agent => ({
      ...agent,
      commissionDue: getCommissionDue(agent.id)
    }))
    .sort((a, b) => b.commissionDue - a.commissionDue)
    .slice(0, 3);

  return (
    <Card className="bg-white shadow border-0">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium text-gray-900">Agent Summary</CardTitle>
            <CardDescription>Top agents by commission due</CardDescription>
          </div>
          <Link to="/agent-management">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {topAgents.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <UserCog className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No agents added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topAgents.map((agent) => (
              <div key={agent.id} className="flex justify-between items-center p-3 rounded-md border border-gray-100 hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-medium text-gray-900">{agent.name}</h4>
                  <p className="text-sm text-gray-500">{agent.companyName || 'Independent'}</p>
                </div>
                <div className="text-right">
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                    ${agent.commissionDue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} due
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
