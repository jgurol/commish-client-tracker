
import { useState, useMemo } from "react";
import { ClientInfo } from "@/pages/Index";

type SortField = 'company_name' | 'revio_id' | 'agent_id';
type SortDirection = 'asc' | 'desc';

export const useClientSorting = (clientInfos: ClientInfo[], agentMapping: Record<string, string>) => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedClientInfos = useMemo(() => {
    if (!sortField) return clientInfos;

    return [...clientInfos].sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (sortField) {
        case 'company_name':
          aValue = a.company_name.toLowerCase();
          bValue = b.company_name.toLowerCase();
          break;
        case 'revio_id':
          aValue = (a.revio_id || '').toLowerCase();
          bValue = (b.revio_id || '').toLowerCase();
          break;
        case 'agent_id':
          aValue = (agentMapping[a.agent_id || ''] || 'Unknown agent').toLowerCase();
          bValue = (agentMapping[b.agent_id || ''] || 'Unknown agent').toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [clientInfos, sortField, sortDirection, agentMapping]);

  return {
    sortedClientInfos,
    sortField,
    sortDirection,
    handleSort
  };
};
