import React, { useState, useMemo, useCallback } from 'react';
import { AdvancedCaseGrid } from './AdvancedCaseGrid';
import { SmartFilterSystem, type FilterState } from './SmartFilterSystem';
import { BatchActionsToolbar } from './BatchActionsToolbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutGrid, 
  List, 
  Clock as Timeline, 
  Settings,
  TrendingUp,
  Clock,
  Users,
  Activity
} from 'lucide-react';
import { type MedicalCase } from '@/hooks/useMedicalCases';
import { cn } from '@/lib/utils';

interface EnhancedCaseDashboardProps {
  cases: MedicalCase[];
  loading: boolean;
  onUpdateCase: (caseData: MedicalCase) => void;
  onCaseCreated: (caseData: any) => void;
}

type ViewMode = 'compact' | 'detailed' | 'timeline';

const VIEW_MODES: Array<{
  id: ViewMode;
  label: string;
  icon: React.ComponentType<any>;
  itemsPerRow: number;
}> = [
  { id: 'compact', label: 'Grid', icon: LayoutGrid, itemsPerRow: 4 },
  { id: 'detailed', label: 'List', icon: List, itemsPerRow: 1 },
  { id: 'timeline', label: 'Timeline', icon: Timeline, itemsPerRow: 1 }
];

export const EnhancedCaseDashboard: React.FC<EnhancedCaseDashboardProps> = ({
  cases,
  loading,
  onUpdateCase,
  onCaseCreated
}) => {
  const [filteredCases, setFilteredCases] = useState<MedicalCase[]>(cases);
  const [selectedCases, setSelectedCases] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);

  // Handle filter changes
  const handleFilterChange = useCallback((filtered: MedicalCase[], filters: FilterState) => {
    setFilteredCases(filtered);
    setActiveFilters(filters);
    setSelectedCases(new Set()); // Clear selection when filters change
  }, []);

  // Selection handlers
  const handleCaseSelect = useCallback((caseId: string) => {
    setSelectedCases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(caseId)) {
        newSet.delete(caseId);
      } else {
        newSet.add(caseId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedCases(new Set(filteredCases.map(c => c.id)));
  }, [filteredCases]);

  const handleClearSelection = useCallback(() => {
    setSelectedCases(new Set());
  }, []);

  // Batch actions
  const handleBulkStatusUpdate = useCallback(async (caseIds: string[], newStatus: string) => {
    // Implement bulk status update
    console.log('Bulk status update:', caseIds, newStatus);
  }, []);

  const handleBulkPriorityUpdate = useCallback(async (caseIds: string[], newPriority: string) => {
    // Implement bulk priority update  
    console.log('Bulk priority update:', caseIds, newPriority);
  }, []);

  const handleBulkAssignment = useCallback(async (caseIds: string[], assignedTo: string) => {
    // Implement bulk assignment
    console.log('Bulk assignment:', caseIds, assignedTo);
  }, []);

  const handleBulkExport = useCallback(async (caseIds: string[]) => {
    // Implement bulk export
    console.log('Bulk export:', caseIds);
  }, []);

  const handleBulkArchive = useCallback(async (caseIds: string[]) => {
    // Implement bulk archive
    console.log('Bulk archive:', caseIds);
  }, []);

  const handleBulkDelete = useCallback(async (caseIds: string[]) => {
    // Implement bulk delete
    console.log('Bulk delete:', caseIds);
  }, []);

  const handleCaseView = useCallback((caseId: string) => {
    // Implement case view
    console.log('View case:', caseId);
  }, []);

  // Dashboard stats
  const dashboardStats = useMemo(() => {
    const total = filteredCases.length;
    const critical = filteredCases.filter(c => c.priority === 'critical').length;
    const pending = filteredCases.filter(c => c.status === 'open' || c.status === 'in-progress').length;
    const assigned = filteredCases.filter(c => c.assignedTo).length;
    
    return { total, critical, pending, assigned };
  }, [filteredCases]);

  const currentViewMode = VIEW_MODES.find(mode => mode.id === viewMode)!;

  return (
    <div className="space-y-6">
      {/* Dashboard Header with Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Medical Cases Dashboard</h2>
              <p className="text-sm text-slate-600">Advanced case management for high-volume workflows</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800">{dashboardStats.total}</div>
                  <div className="text-xs text-slate-600 flex items-center">
                    <Activity className="h-3 w-3 mr-1" />
                    Total Cases
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{dashboardStats.critical}</div>
                  <div className="text-xs text-slate-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Critical
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{dashboardStats.pending}</div>
                  <div className="text-xs text-slate-600 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{dashboardStats.assigned}</div>
                  <div className="text-xs text-slate-600 flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    Assigned
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Filter System */}
      <SmartFilterSystem
        cases={cases}
        onFilterChange={handleFilterChange}
      />

      {/* View Mode Selector & Batch Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {VIEW_MODES.map(mode => {
            const Icon = mode.icon;
            return (
              <Button
                key={mode.id}
                variant={viewMode === mode.id ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode(mode.id)}
                className="text-xs"
              >
                <Icon className="h-4 w-4 mr-1" />
                {mode.label}
              </Button>
            );
          })}
        </div>

        <Badge variant="outline" className="text-slate-600">
          {filteredCases.length} of {cases.length} cases
        </Badge>
      </div>

      {/* Batch Actions Toolbar */}
      <BatchActionsToolbar
        selectedCases={selectedCases}
        allCases={filteredCases}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onBulkPriorityUpdate={handleBulkPriorityUpdate}
        onBulkAssignment={handleBulkAssignment}
        onBulkExport={handleBulkExport}
        onBulkArchive={handleBulkArchive}
        onBulkDelete={handleBulkDelete}
      />

      {/* Advanced Case Grid */}
      <AdvancedCaseGrid
        cases={filteredCases}
        loading={loading}
        selectedCases={selectedCases}
        onCaseSelect={handleCaseSelect}
        onCaseView={handleCaseView}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        viewMode={viewMode}
        itemsPerRow={currentViewMode.itemsPerRow}
      />
    </div>
  );
};