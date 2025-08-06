import React from 'react';
import { Clock, User, Calendar, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type MedicalCase } from '@/hooks/useMedicalCases';

interface TimelineViewProps {
  cases: MedicalCase[];
  selectedPriority?: string | null;
  selectedStatus?: string | null;
  onUpdateCase?: (updatedCase: MedicalCase) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ 
  cases, 
  selectedPriority, 
  selectedStatus, 
  onUpdateCase 
}) => {
  // Filter cases based on selected priority and status
  const filteredCases = cases.filter(case_ => {
    const priorityMatch = !selectedPriority || selectedPriority === 'all' || case_.priority === selectedPriority;
    const statusMatch = !selectedStatus || selectedStatus === 'all' || case_.status === selectedStatus;
    return priorityMatch && statusMatch;
  });

  const sortedCases = [...filteredCases].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-amber-500 bg-amber-50';
      case 'medium': return 'border-blue-500 bg-blue-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getTimelineColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-amber-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: date.toLocaleDateString()
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return '🔴';
      case 'in-progress': return '🟡';
      case 'closed': return '🟢';
      default: return '⚪';
    }
  };

  const getAgeColor = (imageAge: string) => {
    if (imageAge.includes('d')) return 'text-red-600'; // Days - urgent
    if (imageAge.includes('h') && parseInt(imageAge) > 6) return 'text-amber-600'; // More than 6 hours
    return 'text-green-600'; // Recent
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">
        Timeline View ({sortedCases.length} cases)
      </h2>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>
        
        <div className="space-y-6">
          {sortedCases.map((case_, index) => {
            const timeInfo = formatTime(case_.createdAt);
            const updatedTimeInfo = formatTime(case_.updatedAt);
            
            return (
              <div key={case_.id} className="relative flex items-start space-x-4">
                {/* Timeline dot */}
                <div className={`relative z-10 w-4 h-4 rounded-full ${getTimelineColor(case_.priority)} border-2 border-white shadow-lg`}></div>
                
                {/* Timeline card */}
                <Card className={`flex-1 ${getPriorityColor(case_.priority)} border-l-4 hover:shadow-lg transition-shadow duration-200`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {case_.patientName} ({case_.patientId})
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {case_.imageType} - {case_.bodyPart}
                          </Badge>
                          <Badge className={case_.priority === 'critical' ? 'bg-red-600' : 
                                          case_.priority === 'high' ? 'bg-amber-600' : 
                                          case_.priority === 'medium' ? 'bg-blue-600' : 'bg-green-600'}>
                            {case_.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className={`${getAgeColor(case_.imageAge)} border-current`}>
                            <Clock className="h-3 w-3 mr-1" />
                            {case_.imageAge}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-sm text-slate-600 mb-1">
                          <Clock className="h-4 w-4" />
                          <span>{timeInfo.time}</span>
                        </div>
                        <div className="text-xs text-slate-500">{timeInfo.date}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getStatusIcon(case_.status)}</span>
                          <span className="capitalize font-medium">
                            {case_.status.replace('-', ' ')}
                          </span>
                        </div>
                        
                        {case_.assignedTo && (
                          <div className="flex items-center space-x-2 text-slate-600">
                            <User className="h-4 w-4" />
                            <span>Assigned to {case_.assignedTo}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Brain className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">AI Confidence: {case_.aiConfidence}%</span>
                        </div>
                        
                        {case_.updatedAt !== case_.createdAt && (
                          <div className="flex items-center space-x-2 text-slate-600">
                            <Calendar className="h-4 w-4" />
                            <span>Updated: {updatedTimeInfo.time}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {case_.findings && (
                      <div className="mt-3 p-3 bg-white/60 rounded-lg border">
                        <p className="text-sm font-medium text-slate-700 mb-1">AI Analysis:</p>
                        <p className="text-sm text-slate-600">{case_.findings}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
      
      {sortedCases.length === 0 && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No cases to display in timeline</p>
        </div>
      )}
    </div>
  );
};
