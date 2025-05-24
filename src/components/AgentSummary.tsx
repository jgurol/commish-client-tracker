
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
  activeFilter?: string | null;
}

export function AgentSummary({ clients, transactions, isAdmin, activeFilter }: AgentSummaryProps) {
  // Calculate total approved commissions for each agent (all approved commissions regardless of payment status)
  const getTotalApprovedCommissions = (agentId: string) => {
    return transactions
      .filter(t => t.clientId === agentId && t.isApproved)
      .reduce((sum, t) => sum + (t.commission || 0), 0);
  };

  // Get top 3 agents by total approved commissions
  const topAgents = [...clients]
    .map(agent => ({
      ...agent,
      totalApprovedCommissions: getTotalApprovedCommissions(agent.id)
    }))
    .sort((a, b) => b.totalApprovedCommissions - a.totalApprovedCommissions)
    .slice(0, 3);

  // Determine what to show based on active filter
  const shouldShowApprovedCommissions = activeFilter === 'unapproved';
  const cardTitle = shouldShowApprovedCommissions ? "Approved Commissions" : "Agent Summary";
  const cardDescription = shouldShowApprovedCommissions ? "Total approved commissions by agent" : "Top agents by approved commissions";

  return (
    <Card className="bg-white shadow border-0">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-medium text-gray-900">{cardTitle}</CardTitle>
            <CardDescription>{cardDescription}</CardDescription>
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
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                    ${agent.totalApprovedCommissions.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} approved
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
