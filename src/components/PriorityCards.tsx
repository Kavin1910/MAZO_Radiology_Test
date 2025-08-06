
import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Target, TrendingUp, Activity, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { type MedicalCase } from '@/hooks/useMedicalCases';
import { parseAIFindings, severityToPriority } from '@/utils/aiFindings';

interface PriorityCardsProps {
  cases: MedicalCase[];
  selectedPriority: string | null;
  setSelectedPriority: (priority: string | null) => void;
}

export const PriorityCards: React.FC<PriorityCardsProps> = ({
  cases,
  selectedPriority,
  setSelectedPriority
}) => {
  const priorities = [
    { 
      key: 'critical', 
      label: 'Critical', 
      icon: AlertTriangle, 
      color: 'text-red-600', 
      bg: 'bg-gradient-to-br from-red-50/90 to-red-100/50', 
      hoverBg: 'hover:from-red-100/90 hover:to-red-200/50',
      selectedBg: 'from-red-500/10 to-red-600/5',
      borderColor: 'border-red-200/50',
      selectedBorder: 'border-red-400/60',
      desc: 'Immediate attention',
      accent: 'bg-red-500',
      glow: 'shadow-red-500/20'
    },
    { 
      key: 'high', 
      label: 'High', 
      icon: AlertCircle, 
      color: 'text-amber-600', 
      bg: 'bg-gradient-to-br from-amber-50/90 to-orange-100/50', 
      hoverBg: 'hover:from-amber-100/90 hover:to-orange-200/50',
      selectedBg: 'from-amber-500/10 to-orange-600/5',
      borderColor: 'border-amber-200/50',
      selectedBorder: 'border-amber-400/60',
      desc: 'Urgent review needed',
      accent: 'bg-amber-500',
      glow: 'shadow-amber-500/20'
    },
    { 
      key: 'medium', 
      label: 'Medium', 
      icon: Info, 
      color: 'text-blue-600', 
      bg: 'bg-gradient-to-br from-blue-50/90 to-indigo-100/50', 
      hoverBg: 'hover:from-blue-100/90 hover:to-indigo-200/50',
      selectedBg: 'from-blue-500/10 to-indigo-600/5',
      borderColor: 'border-blue-200/50',
      selectedBorder: 'border-blue-400/60',
      desc: 'Standard processing',
      accent: 'bg-blue-500',
      glow: 'shadow-blue-500/20'
    },
    { 
      key: 'low', 
      label: 'Low', 
      icon: CheckCircle, 
      color: 'text-emerald-600', 
      bg: 'bg-gradient-to-br from-emerald-50/90 to-green-100/50', 
      hoverBg: 'hover:from-emerald-100/90 hover:to-green-200/50',
      selectedBg: 'from-emerald-500/10 to-green-600/5',
      borderColor: 'border-emerald-200/50',
      selectedBorder: 'border-emerald-400/60',
      desc: 'Routine examination',
      accent: 'bg-emerald-500',
      glow: 'shadow-emerald-500/20'
    }
  ];

  // Helper function to get display values (same logic as CasesList)
  const getDisplayValues = (case_: MedicalCase) => {
    const parsed = parseAIFindings(case_.findings || '');
    const displaySeverity = parsed.severity !== null ? parsed.severity : (case_ as any).severityRating || 5;
    const displayPriority = severityToPriority(displaySeverity);
    return { priority: displayPriority };
  };

  const getCaseCount = (priority: string) => {
    return cases.filter(case_ => {
      const displayValues = getDisplayValues(case_);
      return displayValues.priority === priority;
    }).length;
  };
  
  const handleCardClick = (priority: string) => setSelectedPriority(selectedPriority === priority ? null : priority);
  const totalCases = cases.length;
  const urgentCount = getCaseCount('critical') + getCaseCount('high');

  return (
    <div className="relative">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-teal-500/5 blur-3xl -z-10"></div>
      
      <Card className="relative bg-gradient-to-br from-white/80 via-white/60 to-slate-50/40 backdrop-blur-xl border border-white/30 shadow-2xl overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/10 to-green-500/10 rounded-full blur-2xl"></div>
        
        <CardContent className="relative p-4">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative p-1 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-sm rounded-lg border border-blue-200/30">
                <Target className="h-2.5 w-2.5 text-blue-600" />
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Priority Overview
                  </h3>
                  <Sparkles className="h-2 w-2 text-blue-500 animate-pulse" />
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Activity className="h-2.5 w-2.5 text-slate-500" />
                  <p className="text-sm font-medium text-slate-600">{totalCases} total cases</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge 
                variant={urgentCount > 0 ? "destructive" : "outline"} 
                className={`
                  relative px-3 py-1.5 font-semibold border-0 shadow-lg
                  ${urgentCount > 0 
                    ? 'bg-gradient-to-r from-red-500/90 to-orange-500/90 text-white' 
                    : 'bg-white/80 text-slate-600 border border-slate-200/50'
                  }
                `}
              >
                {urgentCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                )}
                <TrendingUp className="h-2 w-2 mr-1" />
                {urgentCount} urgent
              </Badge>
            </div>
          </div>
          
          {/* Priority Cards Grid */}
          <div className="grid grid-cols-4 gap-3">
            {priorities.map((priority) => {
              const count = getCaseCount(priority.key);
              const isSelected = selectedPriority === priority.key;
              const Icon = priority.icon;
              const percentage = totalCases > 0 ? Math.round((count / totalCases) * 100) : 0;
              const hasData = count > 0;

              return (
                <div
                  key={priority.key}
                  onClick={() => handleCardClick(priority.key)}
                  className={`
                    group relative cursor-pointer rounded-xl border backdrop-blur-sm
                    transition-all duration-300 ease-out transform hover:scale-102
                    ${isSelected 
                      ? `bg-gradient-to-br ${priority.selectedBg} ${priority.selectedBorder} shadow-lg ${priority.glow}` 
                      : `${priority.bg} ${priority.borderColor} hover:shadow-md`
                    }
                    ${priority.hoverBg}
                  `}
                >
                  {/* Glowing Border Effect for Selected */}
                  {isSelected && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  )}
                  
                  <div className="relative p-3">
                    {/* Header with Icon and Percentage */}
                    <div className="flex items-center justify-between mb-2">
                      <div className={`
                        relative p-1 rounded-lg transition-all duration-300
                        ${isSelected 
                          ? 'bg-white/30 backdrop-blur-sm border border-white/40' 
                          : 'bg-white/60 group-hover:bg-white/80'
                        }
                      `}>
                        <Icon className={`h-2.5 w-2.5 ${priority.color} transition-transform duration-300 group-hover:scale-110`} />
                        {hasData && (
                          <div className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 ${priority.accent} rounded-full animate-pulse`}></div>
                        )}
                      </div>
                      
                      <div className={`
                        px-2 py-0.5 rounded-md text-xs font-bold
                        ${isSelected 
                          ? 'bg-white/30 text-slate-700 border border-white/40' 
                          : 'bg-white/70 text-slate-600'
                        }
                      `}>
                        {percentage}%
                      </div>
                    </div>
                    
                    {/* Count and Label */}
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className={`
                          text-2xl font-black transition-all duration-300
                          ${isSelected 
                            ? 'text-slate-800 scale-105' 
                            : 'text-slate-900 group-hover:text-slate-800'
                          }
                        `}>
                          {count}
                        </span>
                      </div>
                      
                      <div>
                        <p className={`text-sm font-bold ${isSelected ? 'text-slate-800' : 'text-slate-700'}`}>
                          {priority.label}
                        </p>
                        <p className={`text-xs leading-tight ${isSelected ? 'text-slate-600' : 'text-slate-500'}`}>
                          {priority.desc}
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    {hasData && (
                      <div className="mt-3">
                        <div className="h-1.5 bg-white/40 rounded-full overflow-hidden backdrop-blur-sm">
                          <div 
                            className={`
                              h-full transition-all duration-700 ease-out relative overflow-hidden
                              ${priority.accent}
                            `}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          >
                            {/* Animated shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Empty State Indicator */}
                    {!hasData && (
                      <div className="mt-3 h-1.5 bg-white/20 rounded-full"></div>
                    )}
                  </div>
                  
                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
