import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FileImage, 
  X,
  ArrowUpDown,
  Grid,
  List,
  RefreshCw
} from 'lucide-react';
import { type MedicalCase } from '@/hooks/useMedicalCases';
import { cn } from '@/lib/utils';

interface CaseFilterBarProps {
  cases: MedicalCase[];
  filteredCases: MedicalCase[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
  selectedPriority: string | null;
  onPriorityChange: (priority: string | null) => void;
  viewMode: 'list' | 'timeline';
  onViewModeChange: (mode: 'list' | 'timeline') => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onRefresh?: () => void;
}

export const CaseFilterBar: React.FC<CaseFilterBarProps> = ({
  cases,
  filteredCases,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  onRefresh
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Quick stats for the filter bar
  const stats = useMemo(() => {
    const critical = cases.filter(c => c.priority === 'critical').length;
    const pending = cases.filter(c => c.status === 'open').length;
    const inProgress = cases.filter(c => c.status === 'in-progress').length;
    const completed = cases.filter(c => c.status === 'review-completed').length;
    
    return { critical, pending, inProgress, completed };
  }, [cases]);

  const clearAllFilters = () => {
    onSearchChange('');
    onStatusChange(null);
    onPriorityChange(null);
  };

  const hasActiveFilters = searchQuery || selectedStatus || selectedPriority;

  return (
    <Card className="border border-slate-200 shadow-sm bg-white">
      {/* Main Filter Bar */}
      <div className="p-4 space-y-4">
        {/* Top Row - Search and Quick Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search cases, patients, body parts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-300"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-200 rounded-full"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Quick Priority Filters */}
          <div className="flex items-center gap-2">
            <Button
              variant={selectedPriority === 'critical' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPriorityChange(selectedPriority === 'critical' ? null : 'critical')}
              className={cn(
                "flex items-center gap-2",
                selectedPriority === 'critical' && "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              <AlertTriangle className="h-4 w-4" />
              Critical
              <Badge variant="secondary" className="ml-1 bg-red-100 text-red-800">
                {stats.critical}
              </Badge>
            </Button>

            <Button
              variant={selectedStatus === 'open' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onStatusChange(selectedStatus === 'open' ? null : 'open')}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Pending
              <Badge variant="secondary" className="ml-1">
                {stats.pending}
              </Badge>
            </Button>
          </div>

          {/* View Mode Toggle */}
          <Tabs value={viewMode} onValueChange={(value) => onViewModeChange(value as 'list' | 'timeline')}>
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List
              </TabsTrigger>
              <TabsTrigger value="timeline" className="flex items-center gap-2">
                <Grid className="h-4 w-4" />
                Timeline
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Refresh Button */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          )}

          {/* Advanced Filters Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {isExpanded ? 'Hide' : 'More'} Filters
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </Button>
        </div>

        {/* Status Overview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Total: {cases.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Showing: {filteredCases.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              <span>In Progress: {stats.inProgress}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Completed: {stats.completed}</span>
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-slate-600 hover:text-red-600 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="border-t border-slate-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                <Select value={selectedStatus || 'all'} onValueChange={(value) => onStatusChange(value === 'all' ? null : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="pending-review">Pending Review</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                <Select value={selectedPriority || 'all'} onValueChange={(value) => onPriorityChange(value === 'all' ? null : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Modality Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Modality</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All modalities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All modalities</SelectItem>
                    <SelectItem value="xray">X-Ray</SelectItem>
                    <SelectItem value="ct">CT Scan</SelectItem>
                    <SelectItem value="mri">MRI</SelectItem>
                    <SelectItem value="ultrasound">Ultrasound</SelectItem>
                    <SelectItem value="mammogram">Mammogram</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={onSortChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="patient">Patient Name</SelectItem>
                    <SelectItem value="bodypart">Body Part</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};