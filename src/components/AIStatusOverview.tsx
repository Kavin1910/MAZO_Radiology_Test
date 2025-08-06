import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bot, Brain, FileImage, Clock, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { type MedicalCase } from '@/hooks/useMedicalCases';

interface AIStatusOverviewProps {
  cases: MedicalCase[];
}

export const AIStatusOverview: React.FC<AIStatusOverviewProps> = ({ cases }) => {
  const statuses = [
    { key: 'total', label: 'Total', icon: BarChart3, color: 'text-slate-600', desc: 'All cases' },
    { key: 'open', label: 'Open', icon: FileImage, color: 'text-blue-600', desc: 'Not started' },
    { key: 'in-progress', label: 'In Progress', icon: Clock, color: 'text-amber-600', desc: 'AI analyzing' },
    { key: 'pending-review', label: 'Pending', icon: AlertTriangle, color: 'text-orange-600', desc: 'Awaiting review' },
    { key: 'closed', label: 'Closed', icon: CheckCircle, color: 'text-green-600', desc: 'Complete' }
  ];

  const getStatusCount = (status: string) => {
    if (status === 'total') return cases.length;
    return cases.filter(case_ => case_.status === status).length;
  };

  const totalCases = cases.length;
  const completionRate = totalCases > 0 ? Math.round((getStatusCount('closed') / totalCases) * 100) : 0;
  const avgConfidence = totalCases > 0 ? Math.round(cases.reduce((acc, c) => acc + c.aiConfidence, 0) / totalCases) : 0;

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-white to-slate-50/80 border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bot className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Status Overview</h3>
                <p className="text-sm text-slate-600">Case progress tracking</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-slate-600 border-slate-300">
                {completionRate}% complete
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                {avgConfidence}% avg confidence
              </Badge>
            </div>
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

      {/* AI Processing Progress */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50/80 border-blue-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-slate-800">Processing Pipeline</h4>
                <p className="text-xs text-slate-600">AI analysis progress</p>
              </div>
            </div>
            <Badge className="bg-blue-600 text-white">
              {completionRate}% Complete
            </Badge>
          </div>
          <Progress value={completionRate} className="h-2 mb-3 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-600" />
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-slate-600">Open: {getStatusCount('open')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-slate-600">Progress: {getStatusCount('in-progress')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-slate-600">Pending: {getStatusCount('pending-review')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-slate-600">Closed: {getStatusCount('closed')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};