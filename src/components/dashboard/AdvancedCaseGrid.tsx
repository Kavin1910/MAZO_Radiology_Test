import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar, 
  User, 
  FileImage, 
  Clock, 
  AlertTriangle,
  Info,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  MoreHorizontal,
  Activity
} from 'lucide-react';
import { type MedicalCase } from '@/hooks/useMedicalCases';
import { cn } from '@/lib/utils';

interface AdvancedCaseGridProps {
  cases: MedicalCase[];
  loading: boolean;
  selectedCases: Set<string>;
  onCaseSelect: (caseId: string) => void;
  onCaseView: (caseId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  viewMode: 'compact' | 'detailed' | 'timeline';
  itemsPerRow: number;
}

interface CaseCardProps {
  case_: MedicalCase;
  isSelected: boolean;
  onSelect: (caseId: string) => void;
  onView: (caseId: string) => void;
  viewMode: 'compact' | 'detailed' | 'timeline';
  style?: React.CSSProperties;
}

const getPriorityConfig = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return {
        icon: AlertTriangle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        badge: 'bg-red-100 text-red-700'
      };
    case 'high':
      return {
        icon: AlertCircle,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badge: 'bg-amber-100 text-amber-700'
      };
    case 'medium':
      return {
        icon: Info,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-700'
      };
    case 'low':
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        badge: 'bg-green-100 text-green-700'
      };
    default:
      return {
        icon: Info,
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        badge: 'bg-slate-100 text-slate-700'
      };
  }
};

const CaseCard: React.FC<CaseCardProps> = ({ 
  case_, 
  isSelected, 
  onSelect, 
  onView, 
  viewMode,
  style 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const priorityConfig = getPriorityConfig(case_.priority);
  const PriorityIcon = priorityConfig.icon;

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (viewMode === 'compact') {
    return (
      <div style={style} className="p-2">
        <Card className={cn(
          "group relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer",
          isSelected && "ring-2 ring-blue-500 shadow-lg",
          priorityConfig.border
        )}>
          <CardContent className="p-3">
            {/* Selection Checkbox */}
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(case_.id)}
                className="bg-white shadow-sm"
              />
            </div>

            {/* Priority Badge */}
            <div className="absolute top-2 right-2 z-10">
              <Badge className={priorityConfig.badge}>
                <PriorityIcon className="h-3 w-3 mr-1" />
                {case_.priority}
              </Badge>
            </div>

            {/* Image Thumbnail */}
            <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden mb-3 mt-6">
              {!imageLoaded && !imageError && (
                <Skeleton className="w-full h-full" />
              )}
              {imageError ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-100">
                  <FileImage className="h-8 w-8 text-slate-400" />
                </div>
              ) : (
                <img
                  src="/api/placeholder/150/120"
                  alt={case_.patientName}
                  className={cn(
                    "w-full h-full object-cover transition-opacity duration-300",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  loading="lazy"
                />
              )}
              
              {/* Quick Actions Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(case_.id);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Case Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-800 truncate">
                  {case_.patientName}
                </span>
              </div>
              
              <div className="flex items-center text-xs text-slate-600 space-x-2">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(case_.createdAt)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{case_.bodyPart}</span>
                <Badge variant="outline" className="text-xs">
                  {case_.status}
                </Badge>
              </div>

              {/* Add AI Confidence Score */}
              <div className="flex items-center text-xs text-slate-600">
                <Activity className="h-3 w-3 mr-1" />
                <span>Confidence: {case_.aiConfidence}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Detailed view mode
  return (
    <div style={style} className="p-2">
      <Card className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer",
        isSelected && "ring-2 ring-blue-500 shadow-lg"
      )}>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            {/* Selection Checkbox */}
            <div className="flex-shrink-0 pt-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(case_.id)}
              />
            </div>

            {/* Image Thumbnail */}
            <div className="flex-shrink-0">
              <div className="relative w-16 h-16 bg-slate-100 rounded-lg overflow-hidden">
                {!imageLoaded && !imageError && (
                  <Skeleton className="w-full h-full" />
                )}
                {imageError ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <FileImage className="h-6 w-6 text-slate-400" />
                  </div>
                ) : (
                  <img
                    src="/api/placeholder/64/64"
                    alt={case_.patientName}
                    className={cn(
                      "w-full h-full object-cover transition-opacity duration-300",
                      imageLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="lazy"
                  />
                )}
              </div>
            </div>

            {/* Case Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-slate-800 truncate">
                    {case_.patientName}
                  </h3>
                  <div className="mt-1 flex items-center space-x-4 text-xs text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(case_.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{case_.bodyPart}</span>
                    </div>
                     {case_.imageType && (
                       <Badge variant="outline" className="text-xs">
                         {case_.imageType}
                       </Badge>
                    )}
                  </div>
                </div>

                {/* Priority & Status */}
                <div className="flex items-center space-x-2 ml-4">
                  <Badge className={priorityConfig.badge}>
                    <PriorityIcon className="h-3 w-3 mr-1" />
                    {case_.priority}
                  </Badge>
                  <Badge variant="outline">
                    {case_.status}
                  </Badge>
                </div>
              </div>

              {/* Add AI Confidence Badge */}
              <div className="mt-1">
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  <Activity className="h-3 w-3 mr-1" />
                  {case_.aiConfidence}% Confidence
                </Badge>
              </div>

              {/* Additional Info */}
              {case_.findings && (
                <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                  {case_.findings}
                </p>
              )}

              {/* Actions */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>Updated {formatDate(case_.updatedAt)}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(case_.id);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const AdvancedCaseGrid: React.FC<AdvancedCaseGridProps> = ({
  cases,
  loading,
  selectedCases,
  onCaseSelect,
  onCaseView,
  onSelectAll,
  onClearSelection,
  viewMode,
  itemsPerRow
}) => {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 600 });

  // Update container size
  useEffect(() => {
    if (!containerRef) return;

    const updateSize = () => {
      setContainerSize({
        width: containerRef.clientWidth,
        height: Math.max(600, window.innerHeight - 300)
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [containerRef]);

  // Calculate grid dimensions
  const { itemWidth, itemHeight, rowCount } = useMemo(() => {
    const padding = 16;
    const width = viewMode === 'compact' 
      ? Math.max(250, (containerSize.width - padding * (itemsPerRow + 1)) / itemsPerRow)
      : containerSize.width - padding * 2;
    
    const height = viewMode === 'compact' ? 220 : 140;
    const rows = viewMode === 'compact' 
      ? Math.ceil(cases.length / itemsPerRow)
      : cases.length;

    return {
      itemWidth: width,
      itemHeight: height,
      rowCount: rows
    };
  }, [containerSize.width, itemsPerRow, cases.length, viewMode]);

  // Grid item renderer
  const GridItem = useCallback(({ columnIndex, rowIndex, style }: any) => {
    if (viewMode === 'compact') {
      const index = rowIndex * itemsPerRow + columnIndex;
      if (index >= cases.length) return null;
      
      const case_ = cases[index];
      return (
        <CaseCard
          key={case_.id}
          case_={case_}
          isSelected={selectedCases.has(case_.id)}
          onSelect={onCaseSelect}
          onView={onCaseView}
          viewMode={viewMode}
          style={style}
        />
      );
    } else {
      // Detailed view - one item per row
      if (rowIndex >= cases.length) return null;
      
      const case_ = cases[rowIndex];
      return (
        <CaseCard
          key={case_.id}
          case_={case_}
          isSelected={selectedCases.has(case_.id)}
          onSelect={onCaseSelect}
          onView={onCaseView}
          viewMode={viewMode}
          style={style}
        />
      );
    }
  }, [cases, selectedCases, onCaseSelect, onCaseView, viewMode, itemsPerRow]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-3">
                <Skeleton className="w-full h-32 mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileImage className="h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">No cases found</h3>
        <p className="text-slate-500">Try adjusting your filters or upload new cases.</p>
      </div>
    );
  }

  return (
    <div ref={setContainerRef} className="w-full">
      {containerSize.width > 0 && (
        <Grid
          height={containerSize.height}
          width={containerSize.width}
          columnCount={viewMode === 'compact' ? itemsPerRow : 1}
          rowCount={rowCount}
          columnWidth={itemWidth}
          rowHeight={itemHeight}
          itemData={{ cases, selectedCases, onCaseSelect, onCaseView, viewMode }}
        >
          {GridItem}
        </Grid>
      )}
    </div>
  );
};
