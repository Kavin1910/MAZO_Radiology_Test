
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useMedicalCases } from '@/hooks/useMedicalCases';

export const AnalyticsStats: React.FC = () => {
  const { cases, loading } = useMedicalCases();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="bg-white border-slate-200 shadow-lg">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
                <div className="h-8 w-16 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 w-24 bg-slate-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate real statistics from the cases
  const totalScansToday = cases.filter(c => {
    const today = new Date();
    const caseDate = new Date(c.createdAt);
    return caseDate.toDateString() === today.toDateString();
  }).length;

  const pendingReports = cases.filter(c => c.status === 'open' || c.status === 'in-progress').length;
  const completedReports = cases.filter(c => c.status === 'review-completed').length;

  // Calculate average turnaround time for completed cases
  const completedCases = cases.filter(c => c.status === 'review-completed');
  const avgTurnaroundTime = completedCases.length > 0 
    ? Math.round(completedCases.reduce((acc, c) => {
        const created = new Date(c.createdAt);
        const updated = new Date(c.updatedAt);
        return acc + (updated.getTime() - created.getTime());
      }, 0) / completedCases.length / (1000 * 60 * 60)) // Convert to hours
    : 0;

  const stats = [
    {
      value: totalScansToday.toString(),
      label: 'Total scans today',
      icon: Activity,
      color: 'from-blue-600 to-blue-700',
      textColor: 'text-blue-600',
    },
    {
      value: pendingReports.toString(),
      label: 'Pending reports',
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-600',
    },
    {
      value: completedReports.toString(),
      label: 'Completed reports',
      icon: CheckCircle,
      color: 'from-green-600 to-green-700',
      textColor: 'text-green-600',
    },
    {
      value: `${avgTurnaroundTime}h`,
      label: 'Avg. report turnaround time',
      icon: AlertTriangle,
      color: 'from-purple-600 to-purple-700',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color} shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="opacity-20 group-hover:opacity-30 transition-opacity">
                <stat.icon className="h-8 w-8 text-slate-300" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
            <div className="text-slate-600 text-sm font-medium">{stat.label}</div>
            <div className={`w-full h-1 bg-gradient-to-r ${stat.color} rounded-full mt-3 opacity-20`} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
