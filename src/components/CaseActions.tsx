
import React, { useState } from 'react';
import { MoreHorizontal, Eye, FileText, Mail, MessageSquare, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type MedicalCase } from '@/hooks/useMedicalCases';
import { CaseDetailsDialog } from './CaseDetailsDialog';
import { NotesDialog } from './NotesDialog';
import { FinalReportDialog } from './FinalReportDialog';
import { StatusUpdateDialog } from './StatusUpdateDialog';
import { SubscriptionGuard } from './SubscriptionGuard';
import { useSubscription } from '@/hooks/useSubscription';

interface CaseActionsProps {
  case: MedicalCase;
  onUpdateCase: (updatedCase: MedicalCase) => void;
}

export const CaseActions: React.FC<CaseActionsProps> = ({ case: caseData, onUpdateCase }) => {
  const { hasAccess } = useSubscription();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setDetailsOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setNotesOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            Add Notes
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => hasAccess() ? setReportOpen(true) : null}
            disabled={!hasAccess()}
          >
            <Mail className="mr-2 h-4 w-4" />
            Final Report {!hasAccess() && "(Premium)"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setStatusOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Update Status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CaseDetailsDialog 
        case={caseData} 
        open={detailsOpen} 
        onOpenChange={setDetailsOpen} 
      />
      
      <NotesDialog 
        case={caseData} 
        open={notesOpen} 
        onOpenChange={setNotesOpen}
        onUpdateCase={onUpdateCase}
      />
      
      {hasAccess() ? (
        <FinalReportDialog 
          case={caseData} 
          open={reportOpen} 
          onOpenChange={setReportOpen} 
        />
      ) : (
        <SubscriptionGuard feature="final reports">
          <FinalReportDialog 
            case={caseData} 
            open={reportOpen} 
            onOpenChange={setReportOpen} 
          />
        </SubscriptionGuard>
      )}
      
      <StatusUpdateDialog 
        case={caseData} 
        open={statusOpen} 
        onOpenChange={setStatusOpen}
        onUpdateCase={onUpdateCase}
      />
    </>
  );
};
