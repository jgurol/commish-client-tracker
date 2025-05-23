
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ClientManagementHeaderProps {
  onAddClient: () => void;
}

export const ClientManagementHeader = ({ onAddClient }: ClientManagementHeaderProps) => {
  return (
    <Card className="bg-white shadow-lg border-0 mt-8">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Client Management</CardTitle>
        <CardDescription>Manage your clients' information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-end mb-4">
          <Button 
            onClick={onAddClient}
            className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
