import React, { useState, useMemo, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  X, 
  RotateCcw,
  Users,
  Activity,
  Clock,
  Target,
  Settings2
} from 'lucide-react';
import { type MedicalCase } from '@/hooks/useMedicalCases';
import { cn } from '@/lib/utils';
import { format, subDays, startOfToday, endOfToday } from 'date-fns';
import { parseAIFindings, severityToPriority } from '@/utils/aiFindings';

export interface FilterState {
  search: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  priorities: string[];
  statuses: string[];
  imageTypes: string[];
  bodyParts: string[];
  assignedTo: string[];
  source: string[];
  aiConfidence: string[];
}

export interface SmartFilterSystemProps {
  cases: MedicalCase[];
  onFilterChange: (filteredCases: MedicalCase[], activeFilters: FilterState) => void;
  className?: string;
}

export interface SmartFilterSystemRef {
  togglePriorityFilter: (priority: string) => void;
  clearPriorityFilters: () => void;
}

const PRIORITY_OPTIONS = [
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-700' },
  { value: 'high', label: 'High', color: 'bg-amber-100 text-amber-700' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700' }
];

const STATUS_OPTIONS = [
  { value: 'open', label: 'Open', color: 'bg-blue-100 text-blue-700' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'review-completed', label: 'Review Completed', color: 'bg-green-100 text-green-700' }
];

const IMAGE_TYPE_OPTIONS = [
  { value: 'MRI', label: 'MRI', color: 'bg-purple-100 text-purple-700' },
  { value: 'CT', label: 'CT Scan', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'X-Ray', label: 'X-Ray', color: 'bg-green-100 text-green-700' },
  { value: 'Ultrasound', label: 'Ultrasound', color: 'bg-blue-100 text-blue-700' },
  { value: 'Mammogram', label: 'Mammogram', color: 'bg-pink-100 text-pink-700' }
];

const AI_CONFIDENCE_OPTIONS = [
  { value: 'high', label: 'High (80-100%)', color: 'bg-green-100 text-green-700', min: 80, max: 100 },
  { value: 'medium', label: 'Medium (50-79%)', color: 'bg-yellow-100 text-yellow-700', min: 50, max: 79 },
  { value: 'low', label: 'Low (0-49%)', color: 'bg-red-100 text-red-700', min: 0, max: 49 }
];

const SOURCE_OPTIONS = [
  { value: 'manual', label: 'Manual Upload', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'system', label: 'System Process', color: 'bg-blue-100 text-blue-700' }
];

const DATE_PRESETS = [
  { label: 'Today', value: 'today', getDates: () => ({ from: startOfToday(), to: endOfToday() }) },
  { label: 'Last 7 days', value: 'week', getDates: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: 'Last 30 days', value: 'month', getDates: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: 'Last 90 days', value: 'quarter', getDates: () => ({ from: subDays(new Date(), 90), to: new Date() }) }
];

export const SmartFilterSystem = forwardRef<SmartFilterSystemRef, SmartFilterSystemProps>(({
  cases,
  onFilterChange,
  className
}, ref) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateRange: { from: null, to: null },
    priorities: [],
    statuses: [],
    imageTypes: [],
    bodyParts: [],
    assignedTo: [],
    source: [],
    aiConfidence: []
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Helper function to get display values (same logic as CasesList and PriorityCards)
  const getDisplayValues = (case_: MedicalCase) => {
    const parsed = parseAIFindings(case_.findings || '');
    const displaySeverity = parsed.severity !== null ? parsed.severity : (case_ as any).severityRating || 5;
    const displayPriority = severityToPriority(displaySeverity);
    return { priority: displayPriority };
  };

  // Extract unique values for dynamic filter options
  const dynamicOptions = useMemo(() => {
    const bodyParts = Array.from(new Set(cases.map(c => c.bodyPart).filter(Boolean)));
    const assignedUsers = Array.from(new Set(cases.map(c => c.assignedTo).filter(Boolean)));
    
    return {
      bodyParts: bodyParts.map(part => ({ value: part, label: part })),
      assignedTo: assignedUsers.map(user => ({ value: user, label: user }))
    };
  }, [cases]);

  // Apply filters to cases
  const filteredCases = useMemo(() => {
    let filtered = cases;

    // Search filter (patient name, ID, body part)
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(case_ => 
        case_.patientName?.toLowerCase().includes(searchTerm) ||
        case_.patientId?.toLowerCase().includes(searchTerm) ||
        case_.bodyPart?.toLowerCase().includes(searchTerm) ||
        case_.findings?.toLowerCase().includes(searchTerm)
      );
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(case_ => {
        const caseDate = new Date(case_.createdAt);
        if (filters.dateRange.from && caseDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && caseDate > filters.dateRange.to) return false;
        return true;
      });
    }

    // Priority filter (using calculated display priority)
    if (filters.priorities.length > 0) {
      filtered = filtered.filter(case_ => {
        const displayValues = getDisplayValues(case_);
        return filters.priorities.includes(displayValues.priority);
      });
    }

    // Status filter
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(case_ => 
        filters.statuses.includes(case_.status)
      );
    }

    // Image type filter
    if (filters.imageTypes.length > 0) {
      filtered = filtered.filter(case_ => 
        filters.imageTypes.includes(case_.imageType)
      );
    }

    // Body part filter
    if (filters.bodyParts.length > 0) {
      filtered = filtered.filter(case_ => 
        filters.bodyParts.includes(case_.bodyPart)
      );
    }

    // Assigned to filter
    if (filters.assignedTo.length > 0) {
      filtered = filtered.filter(case_ => 
        case_.assignedTo && filters.assignedTo.includes(case_.assignedTo)
      );
    }

    // Source filter
    if (filters.source.length > 0) {
      filtered = filtered.filter(case_ => 
        filters.source.includes(case_.source)
      );
    }

    // AI Confidence filter
    if (filters.aiConfidence.length > 0) {
      filtered = filtered.filter(case_ => {
        return filters.aiConfidence.some(confidenceLevel => {
          const option = AI_CONFIDENCE_OPTIONS.find(opt => opt.value === confidenceLevel);
          if (!option) return false;
          return case_.aiConfidence >= option.min && case_.aiConfidence <= option.max;
        });
      });
    }

    return filtered;
  }, [cases, filters]);

  // Update parent component when filters change
  useEffect(() => {
    onFilterChange(filteredCases, filters);
  }, [filteredCases, filters, onFilterChange]);

  // Update filter state
  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Toggle array filter (for multi-select filters)
  const toggleArrayFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [key]: newArray };
    });
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({
      search: '',
      dateRange: { from: null, to: null },
      priorities: [],
      statuses: [],
      imageTypes: [],
      bodyParts: [],
      assignedTo: [],
      source: [],
      aiConfidence: []
    });
  }, []);

  // Set date preset
  const setDatePreset = useCallback((preset: typeof DATE_PRESETS[0]) => {
    const dates = preset.getDates();
    updateFilter('dateRange', dates);
  }, [updateFilter]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    count += filters.priorities.length;
    count += filters.statuses.length;
    count += filters.imageTypes.length;
    count += filters.bodyParts.length;
    count += filters.assignedTo.length;
    count += filters.source.length;
    count += filters.aiConfidence.length;
    return count;
  }, [filters]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    togglePriorityFilter: (priority: string) => {
      toggleArrayFilter('priorities', priority);
    },
    clearPriorityFilters: () => {
      updateFilter('priorities', []);
    }
  }), [toggleArrayFilter, updateFilter]);

  const FilterBadge: React.FC<{ 
    label: string; 
    onRemove: () => void; 
    color?: string 
  }> = ({ label, onRemove, color = "bg-blue-100 text-blue-700" }) => (
    <Badge className={cn("px-2 py-1 text-xs font-medium", color)}>
      {label}
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );

  return (
    <Card className={cn("border-slate-200 shadow-sm", className)}>
      <CardContent className="p-4">
        {/* Search Bar and Quick Actions */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search patients, body parts, findings..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                "pl-10 transition-all duration-200",
                searchFocused && "ring-2 ring-blue-500/20 border-blue-300"
              )}
            />
            {filters.search && (
              <button
                onClick={() => updateFilter('search', '')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-slate-100 rounded-full p-1 transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            )}
          </div>

          <Button
            variant={isExpanded ? "default" : "outline"}
            onClick={() => setIsExpanded(!isExpanded)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs p-0 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-slate-600 hover:text-slate-800"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filter Badges */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.search && (
              <FilterBadge
                label={`Search: "${filters.search}"`}
                onRemove={() => updateFilter('search', '')}
              />
            )}
            {(filters.dateRange.from || filters.dateRange.to) && (
              <FilterBadge
                label={`Date: ${filters.dateRange.from ? format(filters.dateRange.from, 'MMM d') : '...'} - ${filters.dateRange.to ? format(filters.dateRange.to, 'MMM d') : '...'}`}
                onRemove={() => updateFilter('dateRange', { from: null, to: null })}
                color="bg-purple-100 text-purple-700"
              />
            )}
            {filters.priorities.map(priority => (
              <FilterBadge
                key={priority}
                label={PRIORITY_OPTIONS.find(p => p.value === priority)?.label || priority}
                onRemove={() => toggleArrayFilter('priorities', priority)}
                color={PRIORITY_OPTIONS.find(p => p.value === priority)?.color}
              />
            ))}
            {filters.statuses.map(status => (
              <FilterBadge
                key={status}
                label={STATUS_OPTIONS.find(s => s.value === status)?.label || status}
                onRemove={() => toggleArrayFilter('statuses', status)}
                color={STATUS_OPTIONS.find(s => s.value === status)?.color}
              />
            ))}
            {filters.imageTypes.map(type => (
              <FilterBadge
                key={type}
                label={type}
                onRemove={() => toggleArrayFilter('imageTypes', type)}
                color="bg-indigo-100 text-indigo-700"
              />
            ))}
            {filters.source.map(source => (
              <FilterBadge
                key={source}
                label={SOURCE_OPTIONS.find(s => s.value === source)?.label || source}
                onRemove={() => toggleArrayFilter('source', source)}
                color={SOURCE_OPTIONS.find(s => s.value === source)?.color}
              />
            ))}
            {filters.aiConfidence.map(confidence => (
              <FilterBadge
                key={confidence}
                label={AI_CONFIDENCE_OPTIONS.find(c => c.value === confidence)?.label || confidence}
                onRemove={() => toggleArrayFilter('aiConfidence', confidence)}
                color={AI_CONFIDENCE_OPTIONS.find(c => c.value === confidence)?.color}
              />
            ))}
          </div>
        )}

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Date Range
              </label>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {DATE_PRESETS.map(preset => (
                    <Button
                      key={preset.value}
                      variant="outline"
                      size="sm"
                      onClick={() => setDatePreset(preset)}
                      className="text-xs"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Custom
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={{
                        from: filters.dateRange.from || undefined,
                        to: filters.dateRange.to || undefined
                      }}
                      onSelect={(range) => updateFilter('dateRange', {
                        from: range?.from || null,
                        to: range?.to || null
                      })}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {PRIORITY_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => toggleArrayFilter('priorities', option.value)}
                    className={cn(
                      "inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                      filters.priorities.includes(option.value)
                        ? option.color + " ring-2 ring-offset-1 ring-slate-300"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    <Checkbox
                      checked={filters.priorities.includes(option.value)}
                      className="mr-2 h-3 w-3"
                    />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => toggleArrayFilter('statuses', option.value)}
                    className={cn(
                      "inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                      filters.statuses.includes(option.value)
                        ? option.color + " ring-2 ring-offset-1 ring-slate-300"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    <Checkbox
                      checked={filters.statuses.includes(option.value)}
                      className="mr-2 h-3 w-3"
                    />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Confidence Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                AI Confidence Level
              </label>
              <div className="flex flex-wrap gap-2">
                {AI_CONFIDENCE_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => toggleArrayFilter('aiConfidence', option.value)}
                    className={cn(
                      "inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                      filters.aiConfidence.includes(option.value)
                        ? option.color + " ring-2 ring-offset-1 ring-slate-300"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    <Checkbox
                      checked={filters.aiConfidence.includes(option.value)}
                      className="mr-2 h-3 w-3"
                    />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Type & Source */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center">
                  <Settings2 className="h-4 w-4 mr-2" />
                  Modality
                </label>
                <div className="flex flex-wrap gap-2">
                  {IMAGE_TYPE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => toggleArrayFilter('imageTypes', option.value)}
                      className={cn(
                        "inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                        filters.imageTypes.includes(option.value)
                          ? option.color + " ring-2 ring-offset-1 ring-slate-300"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      <Checkbox
                        checked={filters.imageTypes.includes(option.value)}
                        className="mr-2 h-3 w-3"
                      />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Source
                </label>
                <div className="flex flex-wrap gap-2">
                  {SOURCE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => toggleArrayFilter('source', option.value)}
                      className={cn(
                        "inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200",
                        filters.source.includes(option.value)
                          ? option.color + " ring-2 ring-offset-1 ring-slate-300"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      <Checkbox
                        checked={filters.source.includes(option.value)}
                        className="mr-2 h-3 w-3"
                      />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="pt-2 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                Showing <span className="font-medium">{filteredCases.length}</span> of{' '}
                <span className="font-medium">{cases.length}</span> cases
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});