import React, { useState, useMemo, useCallback, useRef } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { SubscriptionBanner } from '@/components/SubscriptionBanner';
import { PriorityCards } from '@/components/PriorityCards';
import { CasesList } from '@/components/CasesList';
import { TimelineView } from '@/components/TimelineView';
import { SmartFilterSystem, type FilterState, type SmartFilterSystemRef } from '@/components/dashboard/SmartFilterSystem';
import { ImageUploadDialog } from '@/components/ImageUploadDialog';
import { SystemProcessedView } from '@/components/SystemProcessedView';
import { ManualUploadView } from '@/components/ManualUploadView';
import { useMedicalCases, type MedicalCase } from '@/hooks/useMedicalCases';
import { Loader2, Bot, Upload, Filter, Sparkles, Activity, TrendingUp, ArrowUpDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'tile'>('list');
  const [activeView, setActiveView] = useState<'system-processed' | 'manual-upload'>('system-processed');
  const [filteredCases, setFilteredCases] = useState<MedicalCase[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');
  const smartFilterRef = useRef<SmartFilterSystemRef>(null);
  
  // Use the custom hook to manage medical cases
  const { cases, loading, addCase, updateCase } = useMedicalCases();

  // Memoized handlers to prevent unnecessary re-renders
  const handleUpdateCase = useCallback((updatedCase: MedicalCase) => {
    updateCase(updatedCase);
  }, [updateCase]);

  const handleCaseCreated = useCallback((caseData: any) => {
    addCase(caseData);
  }, [addCase]);

  // Memoize case filtering by source to prevent unnecessary re-computation
  const { manualUploadCases, systemProcessedCases } = useMemo(() => {
    if (!cases.length) return { manualUploadCases: [], systemProcessedCases: [] };
    
    const manual: MedicalCase[] = [];
    const system: MedicalCase[] = [];
    
    // Single loop for better performance
    cases.forEach(case_ => {
      console.log(`🏷️  Categorizing case ${case_.id} (${case_.imageName}): source="${case_.source}"`);
      if (case_.source === 'manual') {
        console.log(`✅ Adding case ${case_.id} to MANUAL uploads`);
        manual.push(case_);
      } else {
        console.log(`✅ Adding case ${case_.id} to SYSTEM processed`);
        system.push(case_);
      }
    });
    
    console.log(`📊 Final categorization: ${manual.length} manual cases, ${system.length} system cases`);
    return { manualUploadCases: manual, systemProcessedCases: system };
  }, [cases]);

  // Get current view cases based on active tab
  const currentViewCases = useMemo(() => {
    return activeView === 'system-processed' ? systemProcessedCases : manualUploadCases;
  }, [activeView, systemProcessedCases, manualUploadCases]);

  // Handle filter changes from the SmartFilterSystem
  const handleFilterChange = useCallback((filtered: MedicalCase[], filters: FilterState) => {
    setFilteredCases(filtered);
    setActiveFilters(filters);
  }, []);

  // Handle priority selection from PriorityCards
  const handlePrioritySelect = useCallback((priority: string | null) => {
    if (smartFilterRef.current) {
      if (priority) {
        smartFilterRef.current.togglePriorityFilter(priority);
      } else {
        // Clear all priority filters if null is passed
        smartFilterRef.current.clearPriorityFilters();
      }
    }
  }, []);

  // Apply sorting to filtered cases
  const sortedAndFilteredCases = useMemo(() => {
    if (!filteredCases.length) return [];
    
    const sorted = [...filteredCases];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'confidence-high':
        return sorted.sort((a, b) => b.aiConfidence - a.aiConfidence);
      case 'confidence-low':
        return sorted.sort((a, b) => a.aiConfidence - b.aiConfidence);
      case 'updated':
        return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return sorted.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
      default:
        return sorted;
    }
  }, [filteredCases, sortBy]);

  // Show loading state while fetching cases
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <div>
            <h3 className="text-xl font-semibold text-slate-800">Loading Medical Cases</h3>
            <p className="text-slate-600">Fetching your cases from the database...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      <DashboardHeader 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      
      <main className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-auto space-y-6">
          {/* Subscription Banner */}
          <SubscriptionBanner />
          
          {/* Priority Cards Overview */}
          <div>
            <PriorityCards 
              cases={currentViewCases} 
              selectedPriority={activeFilters?.priorities[0] || null}
              setSelectedPriority={handlePrioritySelect}
            />
          </div>

          {/* Advanced Filtering System */}
          <SmartFilterSystem 
            cases={currentViewCases}
            onFilterChange={handleFilterChange}
            ref={smartFilterRef}
          />

          {/* View Controls and Sorting */}
          <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)}>
                <TabsList className="grid w-fit grid-cols-2">
                  <TabsTrigger value="system-processed" className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    System Processed
                  </TabsTrigger>
                  <TabsTrigger value="manual-upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Manual Upload
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Results Count */}
              <Badge variant="outline" className="text-slate-600">
                {sortedAndFilteredCases.length} of {currentViewCases.length} cases
              </Badge>
            </div>

            <div className="flex items-center space-x-3">
              {/* Sort By */}
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="h-4 w-4 text-slate-500" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="confidence-high">AI Confidence (High → Low)</SelectItem>
                    <SelectItem value="confidence-low">AI Confidence (Low → High)</SelectItem>
                    <SelectItem value="updated">Last Updated</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode */}
              <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <TabsList className="grid w-fit grid-cols-3">
                  <TabsTrigger value="list">List</TabsTrigger>
                  <TabsTrigger value="tile">Tile</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Cases Content */}
          <Tabs value={activeView}>
            <TabsContent value="system-processed" className="mt-0">
              <SystemProcessedView 
                cases={sortedAndFilteredCases}
                viewMode={viewMode}
                selectedPriority={null}
                selectedStatus={null}
                onUpdateCase={handleUpdateCase}
              />
            </TabsContent>

            <TabsContent value="manual-upload" className="mt-0">
              <ManualUploadView 
                cases={sortedAndFilteredCases}
                viewMode={viewMode}
                selectedPriority={null}
                selectedStatus={null}
                onUpdateCase={handleUpdateCase}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;
