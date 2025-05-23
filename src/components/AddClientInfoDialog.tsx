
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClientInfo } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";

interface AddClientInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddClientInfo: (clientInfo: Omit<ClientInfo, "id" | "created_at" | "updated_at" | "user_id">) => void;
}

interface Agent {
  id: string;
  company_name: string;
  first_name: string;
  last_name: string;
}

export const AddClientInfoDialog = ({ open, onOpenChange, onAddClientInfo }: AddClientInfoDialogProps) => {
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [agentId, setAgentId] = useState<string | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch agents when dialog opens
  useEffect(() => {
    if (open) {
      fetchAgents();
    }
  }, [open]);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, company_name, first_name, last_name')
        .order('company_name', { ascending: true });
      
      if (error) {
        console.error('Error fetching agents:', error);
      } else {
        setAgents(data || []);
      }
    } catch (err) {
      console.error('Error in agent fetch:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName) {
      setIsSubmitting(true);
      try {
        await onAddClientInfo({
          company_name: companyName,
          contact_name: null,
          email: null,
          phone: null,
          address: address || null,
          notes: notes || null,
          agent_id: agentId
        });
        resetForm();
        onOpenChange(false);
      } catch (err) {
        console.error('Error submitting client info:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setCompanyName("");
    setAddress("");
    setNotes("");
    setAgentId(null);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Enter details about your client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="required">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="agent">Associated Agent</Label>
            <Select value={agentId || ""} onValueChange={setAgentId}>
              <SelectTrigger id="agent" className="w-full">
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.company_name || `${agent.first_name} ${agent.last_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isLoading && <p className="text-sm text-muted-foreground">Loading agents...</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => {
              resetForm();
              onOpenChange(false);
            }}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700"
              disabled={isSubmitting || !companyName}
            >
              {isSubmitting ? 'Adding...' : 'Add Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
