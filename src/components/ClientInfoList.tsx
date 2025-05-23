
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Mail, Phone, MapPin } from "lucide-react";
import { ClientInfo } from "@/pages/Index";
import { EditClientInfoDialog } from "@/components/EditClientInfoDialog";

interface ClientInfoListProps {
  clientInfos: ClientInfo[];
  onUpdateClientInfo: (clientInfo: ClientInfo) => void;
}

export const ClientInfoList = ({ clientInfos, onUpdateClientInfo }: ClientInfoListProps) => {
  const [editingClientInfo, setEditingClientInfo] = useState<ClientInfo | null>(null);

  return (
    <>
      {clientInfos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No clients added yet. Click "Add Client" to get started!</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientInfos.map((clientInfo) => (
                <TableRow key={clientInfo.id}>
                  <TableCell className="font-medium">{clientInfo.companyName}</TableCell>
                  <TableCell>{clientInfo.contactName || "-"}</TableCell>
                  <TableCell>
                    {clientInfo.email ? (
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4 text-gray-500" />
                        {clientInfo.email}
                      </div>
                    ) : "-"}
                  </TableCell>
                  <TableCell>
                    {clientInfo.phone ? (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4 text-gray-500" />
                        {clientInfo.phone}
                      </div>
                    ) : "-"}
                  </TableCell>
                  <TableCell>{new Date(clientInfo.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingClientInfo(clientInfo)}
                      className="hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {editingClientInfo && (
        <EditClientInfoDialog
          clientInfo={editingClientInfo}
          open={!!editingClientInfo}
          onOpenChange={(open) => !open && setEditingClientInfo(null)}
          onUpdateClientInfo={onUpdateClientInfo}
        />
      )}
    </>
  );
};
