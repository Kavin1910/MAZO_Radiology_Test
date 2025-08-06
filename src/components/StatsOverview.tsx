
import React from 'react';
import { FolderOpen, Clock, FileSearch, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { type MedicalCase } from '@/hooks/useMedicalCases';

interface StatsOverviewProps {
  cases: MedicalCase[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ cases }) => {
  const stats = {
    total: cases.length,
    open: cases.filter(c => c.status === 'open').length,
    inProgress: cases.filter(c => c.status === 'in-progress').length,
    pendingReview: cases.filter(c => c.status === 'in-progress').length,
    closed: cases.filter(c => c.status === 'review-completed').length
  };

  // Calculate completion rate
  const completionRate = stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0;
  const activeRate = stats.total > 0 ? Math.round(((stats.inProgress + stats.pendingReview) / stats.total) * 100) : 0;

  const statusCards = [
    {
      label: 'Open',
      value: stats.open,
      description: 'Ready for analysis',
      icon: FolderOpen,
      color: 'blue',
      bgGradient: 'from-blue-50 to-blue-100/50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      textColor: 'text-blue-700',
      valueColor: 'text-blue-900'
    },
    {
      label: 'In Progress', 
      value: stats.inProgress,
      description: 'Under active review',
      icon: Clock,
      color: 'amber',
      bgGradient: 'from-amber-50 to-amber-100/50', 
      borderColor: 'border-amber-200',
      iconBg: 'bg-amber-100',
      textColor: 'text-amber-700',
      valueColor: 'text-amber-900'
    },
    {
      label: 'Pending Review',
      value: stats.pendingReview, 
      description: 'Awaiting approval',
      icon: FileSearch,
      color: 'orange',
      bgGradient: 'from-orange-50 to-orange-100/50',
      borderColor: 'border-orange-200', 
      iconBg: 'bg-orange-100',
      textColor: 'text-orange-700',
      valueColor: 'text-orange-900'
    },
    {
      label: 'Closed',
      value: stats.closed,
      description: 'Complete & submitted', 
      icon: CheckCircle,
      color: 'green',
      bgGradient: 'from-green-50 to-green-100/50',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-100', 
      textColor: 'text-green-700',
      valueColor: 'text-green-900'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Cases - Featured Card */}
        <Card className="lg:col-span-1 border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 hover:shadow-xl transition-all duration-300 group">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Total Cases</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-slate-900">{stats.total}</span>
                  <Badge variant="outline" className="text-xs">
                    All Status
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-slate-200 transition-colors">
                <TrendingUp className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Completion Rate</span>
                <span className="font-medium text-slate-900">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Workflow Progress */}
        <Card className="lg:col-span-2 border-slate-200 bg-gradient-to-br from-white to-slate-50/50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Workflow Progress</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.inProgress + stats.pendingReview} Active
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Active Cases</span>
                  <span className="font-medium text-slate-900">{activeRate}%</span>
                </div>
                <Progress value={activeRate} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Completed</span>
                  <span className="font-medium text-slate-900">{completionRate}%</span>
                </div>
                <Progress value={completionRate} className="h-2 [&>div]:bg-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((card) => {
          const Icon = card.icon;
          const percentage = stats.total > 0 ? Math.round((card.value / stats.total) * 100) : 0;
          
          return (
            <Card 
              key={card.label}
              className={`${card.borderColor} bg-gradient-to-br ${card.bgGradient} hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-semibold ${card.textColor}`}>
                  {card.label}
                </CardTitle>
                <div className={`p-2 ${card.iconBg} rounded-lg group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-4 w-4 ${card.textColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className={`text-3xl font-bold ${card.valueColor}`}>
                      {card.value}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-white/80 text-slate-600"
                    >
                      {percentage}%
                    </Badge>
                  </div>
                  <p className={`text-xs ${card.textColor} opacity-80`}>
                    {card.description}
                  </p>
                  {card.value > 0 && (
                    <div className="pt-1">
                      <div className={`w-full h-1 bg-white/30 rounded-full overflow-hidden`}>
                        <div 
                          className={`h-full bg-gradient-to-r from-${card.color}-400 to-${card.color}-600 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
