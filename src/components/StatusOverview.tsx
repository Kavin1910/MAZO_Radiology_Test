import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileImage, Clock, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { type MedicalCase } from '@/hooks/useMedicalCases';

interface StatusOverviewProps {
  cases: MedicalCase[];
}

export const StatusOverview: React.FC<StatusOverviewProps> = ({ cases }) => {
  const statuses = [
    { key: 'total', label: 'Total', icon: BarChart3, color: 'text-slate-600', desc: 'All cases' },
    { key: 'open', label: 'Open', icon: FileImage, color: 'text-blue-600', desc: 'Not started' },
    { key: 'in-progress', label: 'In Progress', icon: Clock, color: 'text-amber-600', desc: 'Reviewing' },
    { key: 'pending-review', label: 'Pending', icon: AlertTriangle, color: 'text-orange-600', desc: 'Awaiting approval' },
    { key: 'closed', label: 'Closed', icon: CheckCircle, color: 'text-green-600', desc: 'Complete' }
  ];

  const getStatusCount = (status: string) => {
    if (status === 'total') return cases.length;
    return cases.filter(case_ => case_.status === status).length;
  };

  const totalCases = cases.length;
  const completionRate = totalCases > 0 ? Math.round((getStatusCount('closed') / totalCases) * 100) : 0;

  return (
    <Card className="bg-gradient-to-r from-white to-slate-50/80 border-slate-200 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Status Overview</h3>
              <p className="text-sm text-slate-600">Case progress tracking</p>
            </div>
          </div>
          <Badge variant="outline" className="text-slate-600 border-slate-300">
            {completionRate}% complete
          </Badge>
        </div>
        
        <div className="grid grid-cols-5 gap-3">
          {statuses.map((status) => {
            const count = getStatusCount(status.key);
            const Icon = status.icon;
            const percentage = totalCases > 0 ? Math.round((count / totalCases) * 100) : 0;

            return (
              <div
                key={status.key}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`h-4 w-4 ${status.color}`} />
                  <span className="text-xs text-slate-500">{status.key === 'total' ? '100%' : `${percentage}%`}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-2xl font-bold text-slate-900">{count}</span>
                  <p className="text-xs font-medium text-slate-700">{status.label}</p>
                  <p className="text-xs text-slate-500 leading-tight">{status.desc}</p>
                </div>
                {count > 0 && status.key !== 'total' && (
                  <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${status.color.replace('text-', 'bg-')} transition-all duration-300`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};