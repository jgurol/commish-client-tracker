
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Client } from "@/pages/Index";

interface AgentFilterDropdownProps {
  clients: Client[];
  selectedAgentId: string | null;
  onAgentChange: (agentId: string | null) => void;
}

export const AgentFilterDropdown = ({ 
  clients, 
  selectedAgentId, 
  onAgentChange 
}: AgentFilterDropdownProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 whitespace-nowrap">Filter by Agent:</span>
      <Select 
        value={selectedAgentId || "all"} 
        onValueChange={(value) => onAgentChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All Agents" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Agents</SelectItem>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.companyName || client.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
