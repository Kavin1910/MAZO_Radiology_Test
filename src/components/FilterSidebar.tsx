import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Search, X, Filter, CheckCircle, Clock, AlertTriangle, FileImage, ChevronLeft, ChevronRight } from 'lucide-react';
import { type MedicalCase } from '@/hooks/useMedicalCases';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  cases: MedicalCase[];
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  cases,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  isCollapsed,
  onToggleCollapse
}) => {
  const statusFilters = [
    { 
      key: 'open', 
      label: 'Open', 
      icon: FileImage, 
      count: cases.filter(c => c.status === 'open').length, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      key: 'in-progress', 
      label: 'In Progress', 
      icon: Clock, 
      count: cases.filter(c => c.status === 'in-progress').length, 
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    { 
      key: 'in-progress', 
      label: 'In Progress', 
      icon: AlertTriangle, 
      count: cases.filter(c => c.status === 'in-progress').length,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    { 
      key: 'review-completed', 
      label: 'Completed', 
      icon: CheckCircle, 
      count: cases.filter(c => c.status === 'review-completed').length,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  const clearAllFilters = () => {
    onStatusChange(null);
    onSearchChange('');
  };

  const hasActiveFilters = selectedStatus || searchQuery;

  return (
    <div className={cn(
      "transition-all duration-300 ease-in-out bg-white border-l border-slate-200 shadow-sm flex flex-col",
      isCollapsed ? "w-12" : "w-80"
    )}>
      {/* Toggle Button */}
      <div className="p-3 border-b border-slate-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center hover:bg-slate-50"
        >
          {isCollapsed ? (
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-600" />
          )}
          {!isCollapsed && <span className="ml-2 text-sm font-medium">Hide Filters</span>}
        </Button>
      </div>

      {/* Collapsed State */}
      {isCollapsed && (
        <div className="p-2 flex flex-col items-center space-y-2">
          <Filter className="h-4 w-4 text-slate-400" />
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
        </div>
      )}

      {/* Expanded State */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto">
          <Card className="rounded-none border-0 shadow-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </CardTitle>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-slate-600 hover:text-red-600 hover:bg-red-50 p-2 h-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Search Filter */}
              <div>
                <h3 className="font-medium text-slate-800 mb-3 flex items-center space-x-2">
                  <Search className="h-4 w-4 text-slate-600" />
                  <span>Search Cases</span>
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by patient, body part..."
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
                {searchQuery && (
                  <p className="text-xs text-slate-500 mt-2">
                    Searching for: "{searchQuery}"
                  </p>
                )}
              </div>

              <Separator />

              {/* Status Filters */}
              <div>
                <h3 className="font-medium text-slate-800 mb-3 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-slate-600" />
                  <span>Case Status</span>
                </h3>
                <div className="space-y-2">
                  {statusFilters.map((filter) => {
                    const Icon = filter.icon;
                    const isSelected = selectedStatus === filter.key;
                    
                    return (
                      <div
                        key={filter.key}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-50",
                          isSelected && `${filter.bgColor} ${filter.borderColor} border`
                        )}
                        onClick={() => onStatusChange(isSelected ? null : filter.key)}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={cn("h-4 w-4", filter.color)} />
                          <span className="text-sm font-medium text-slate-700">
                            {filter.label}
                          </span>
                          {isSelected && (
                            <CheckCircle className="h-3 w-3 text-blue-600" />
                          )}
                        </div>
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            "font-bold",
                            filter.color,
                            isSelected ? 'bg-white' : 'bg-slate-100'
                          )}
                        >
                          {filter.count}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Filter Summary */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-800 mb-2">Filter Summary</h4>
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Total Cases:</span>
                    <span className="font-medium">{cases.length}</span>
                  </div>
                  {selectedStatus && (
                    <div className="flex justify-between">
                      <span>Filtered:</span>
                      <span className="font-medium">
                        {statusFilters.find(f => f.key === selectedStatus)?.count || 0}
                      </span>
                    </div>
                  )}
                  {searchQuery && (
                    <div className="flex justify-between">
                      <span>Search Results:</span>
                      <span className="font-medium">
                        {cases.filter(c => 
                          c.bodyPart.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.findings?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};