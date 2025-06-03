
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from "lucide-react";
import { ClientInfo } from "@/pages/Index";

interface ClientInfoActionsProps {
  clientInfo: ClientInfo;
  onEdit: (clientInfo: ClientInfo) => void;
  onDelete: (clientId: string) => void;
  deletingClientId: string | null;
  setDeletingClientId: (id: string | null) => void;
}

export const ClientInfoActions = ({ 
  clientInfo, 
  onEdit, 
  onDelete, 
  deletingClientId, 
  setDeletingClientId 
}: ClientInfoActionsProps) => {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(clientInfo)}
        className="hover:bg-blue-50 hover:border-blue-300"
      >
        <Edit className="w-4 h-4" />
      </Button>
      
      <AlertDialog open={deletingClientId === clientInfo.id} onOpenChange={(open) => !open && setDeletingClientId(null)}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeletingClientId(clientInfo.id)}
            className="hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the client "{clientInfo.company_name}" and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(clientInfo.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
