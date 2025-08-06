import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  CheckSquare, 
  Square, 
  MoreHorizontal, 
  Download, 
  Share2, 
  Archive, 
  Trash2,
  UserCheck,
  Clock,
  AlertTriangle,
  FileDown,
  Users,
  Tag,
  X
} from 'lucide-react';
import { type MedicalCase } from '@/hooks/useMedicalCases';
import { cn } from '@/lib/utils';

export interface BatchActionsToolbarProps {
  selectedCases: Set<string>;
  allCases: MedicalCase[];
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkStatusUpdate: (caseIds: string[], newStatus: string) => void;
  onBulkPriorityUpdate: (caseIds: string[], newPriority: string) => void;
  onBulkAssignment: (caseIds: string[], assignedTo: string) => void;
  onBulkExport: (caseIds: string[]) => void;
  onBulkArchive: (caseIds: string[]) => void;
  onBulkDelete: (caseIds: string[]) => void;
  className?: string;
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', color: 'text-red-600' },
  { value: 'in-progress', label: 'In Progress', color: 'text-yellow-600' },
  { value: 'pending-review', label: 'Pending Review', color: 'text-blue-600' },
  { value: 'review-complete', label: 'Review Complete', color: 'text-green-600' },
  { value: 'closed', label: 'Closed', color: 'text-slate-600' }
];

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical', color: 'text-red-600' },
  { value: 'high', label: 'High', color: 'text-amber-600' },
  { value: 'medium', label: 'Medium', color: 'text-blue-600' },
  { value: 'low', label: 'Low', color: 'text-green-600' }
];

const MOCK_USERS = [
  { value: 'dr-smith', label: 'Dr. Smith' },
  { value: 'dr-johnson', label: 'Dr. Johnson' },
  { value: 'dr-williams', label: 'Dr. Williams' },
  { value: 'dr-brown', label: 'Dr. Brown' }
];

export const BatchActionsToolbar: React.FC<BatchActionsToolbarProps> = ({
  selectedCases,
  allCases,
  onSelectAll,
  onClearSelection,
  onBulkStatusUpdate,
  onBulkPriorityUpdate,
  onBulkAssignment,
  onBulkExport,
  onBulkArchive,
  onBulkDelete,
  className
}) => {
  const [bulkActionLoading, setBulkActionLoading] = useState<string | null>(null);

  const selectedCount = selectedCases.size;
  const totalCount = allCases.length;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;

  const selectedCaseIds = Array.from(selectedCases);

  const handleBulkAction = async (actionType: string, actionFn: () => void | Promise<void>) => {
    setBulkActionLoading(actionType);
    try {
      await actionFn();
    } finally {
      setBulkActionLoading(null);
    }
  };

  const handleSelectAllToggle = () => {
    if (isAllSelected || isPartiallySelected) {
      onClearSelection();
    } else {
      onSelectAll();
    }
  };

  // Get selection summary
  const selectionSummary = React.useMemo(() => {
    if (selectedCount === 0) return null;

    const selectedCasesList = allCases.filter(case_ => selectedCases.has(case_.id));
    const statusCount = selectedCasesList.reduce((acc, case_) => {
      acc[case_.status] = (acc[case_.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityCount = selectedCasesList.reduce((acc, case_) => {
      acc[case_.priority] = (acc[case_.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { statusCount, priorityCount, cases: selectedCasesList };
  }, [selectedCases, allCases, selectedCount]);

  if (selectedCount === 0) {
    return (
      <Card className={cn("border-slate-200 shadow-sm", className)}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSelectAllToggle}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <Square className="h-4 w-4 text-slate-400" />
              </button>
              <span className="text-sm text-slate-600">
                Select cases to enable batch actions
              </span>
            </div>
            <Badge variant="outline" className="text-slate-600">
              {totalCount} total cases
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-blue-200 shadow-md bg-blue-50/30", className)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          {/* Selection Info */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSelectAllToggle}
              className="p-1 hover:bg-blue-100 rounded transition-colors"
            >
              {isAllSelected ? (
                <CheckSquare className="h-4 w-4 text-blue-600" />
              ) : isPartiallySelected ? (
                <div className="h-4 w-4 bg-blue-600 rounded-sm flex items-center justify-center">
                  <div className="h-1.5 w-1.5 bg-white rounded-full" />
                </div>
              ) : (
                <Square className="h-4 w-4 text-slate-400" />
              )}
            </button>

            <div className="flex items-center space-x-3">
              <Badge className="bg-blue-600 text-white">
                {selectedCount} selected
              </Badge>
              
              {selectionSummary && (
                <div className="flex items-center space-x-2 text-xs">
                  {Object.entries(selectionSummary.statusCount).map(([status, count]) => (
                    <Badge key={status} variant="outline" className="text-xs">
                      {status}: {count}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Batch Actions */}
          <div className="flex items-center space-x-2">
            {/* Quick Status Update */}
            <Select onValueChange={(status) => 
              handleBulkAction('status', () => onBulkStatusUpdate(selectedCaseIds, status))
            }>
              <SelectTrigger className="w-auto h-8 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectLabel>Update Status</SelectLabel>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <div className={cn("w-2 h-2 rounded-full", option.color.replace('text-', 'bg-'))} />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Quick Priority Update */}
            <Select onValueChange={(priority) => 
              handleBulkAction('priority', () => onBulkPriorityUpdate(selectedCaseIds, priority))
            }>
              <SelectTrigger className="w-auto h-8 text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectLabel>Update Priority</SelectLabel>
                {PRIORITY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center space-x-2">
                      <div className={cn("w-2 h-2 rounded-full", option.color.replace('text-', 'bg-'))} />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Assign To */}
            <Select onValueChange={(user) => 
              handleBulkAction('assign', () => onBulkAssignment(selectedCaseIds, user))
            }>
              <SelectTrigger className="w-auto h-8 text-xs">
                <UserCheck className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Assign" />
              </SelectTrigger>
              <SelectContent>
                <SelectLabel>Assign To</SelectLabel>
                {MOCK_USERS.map(user => (
                  <SelectItem key={user.value} value={user.value}>
                    <div className="flex items-center space-x-2">
                      <Users className="h-3 w-3" />
                      <span>{user.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Quick Export */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('export', () => onBulkExport(selectedCaseIds))}
              disabled={bulkActionLoading === 'export'}
              className="h-8 text-xs"
            >
              <FileDown className="h-3 w-3 mr-1" />
              Export
            </Button>

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Batch Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => handleBulkAction('share', () => {})}
                  disabled={bulkActionLoading === 'share'}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Selected
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => handleBulkAction('archive', () => onBulkArchive(selectedCaseIds))}
                  disabled={bulkActionLoading === 'archive'}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Selected
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={() => handleBulkAction('delete', () => onBulkDelete(selectedCaseIds))}
                  disabled={bulkActionLoading === 'delete'}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Selection */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Extended Selection Summary */}
        {selectedCount > 5 && selectionSummary && (
          <div className="mt-3 pt-3 border-t border-blue-200/50">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center space-x-4">
                <span>Priority breakdown:</span>
                <div className="flex space-x-2">
                  {Object.entries(selectionSummary.priorityCount).map(([priority, count]) => {
                    const priorityConfig = PRIORITY_OPTIONS.find(p => p.value === priority);
                    return (
                      <Badge key={priority} variant="outline" className="text-xs">
                        <div className={cn("w-2 h-2 rounded-full mr-1", priorityConfig?.color.replace('text-', 'bg-'))} />
                        {priority}: {count}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={onClearSelection}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Clear all
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};