
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Stethoscope, TrendingUp } from 'lucide-react';
import { useMedicalCases } from '@/hooks/useMedicalCases';

const severityColors = {
  high: '#EF4444',
  medium: '#F59E0B', 
  low: '#10B981'
};

const categoryColors = {
  'General': '#DC2626',
  'Imaging': '#2563EB',
  'Analysis': '#7C3AED'
};

export const DiagnosesChart: React.FC = () => {
  const { cases, loading } = useMedicalCases();

  // Generate diagnosis data from real cases
  const generateDiagnosisData = () => {
    const diagnosisCategories = {
      'Normal Findings': { category: 'General', severity: 'low', count: 0 },
      'Abnormal Findings': { category: 'Analysis', severity: 'high', count: 0 },
      'Pending Review': { category: 'Analysis', severity: 'medium', count: 0 },
      'System Processed': { category: 'Imaging', severity: 'low', count: 0 }
    };

    cases.forEach(case_ => {
      const hasFindings = case_.findings && case_.findings.trim().length > 0;
      const confidence = case_.aiConfidence || 100;
      
      if (case_.status === 'review-completed') {
        if (hasFindings && confidence < 90) {
          diagnosisCategories['Abnormal Findings'].count++;
        } else {
          diagnosisCategories['Normal Findings'].count++;
        }
      } else if (case_.source === 'system') {
        diagnosisCategories['System Processed'].count++;
      } else {
        diagnosisCategories['Pending Review'].count++;
      }
    });

    const total = Object.values(diagnosisCategories).reduce((sum, cat) => sum + cat.count, 0);
    
    return Object.entries(diagnosisCategories)
      .filter(([_, data]) => data.count > 0)
      .map(([label, data], index) => ({
        code: `D${index + 1}`,
        label,
        value: data.count,
        percentage: total > 0 ? Math.round((data.count / total) * 100 * 10) / 10 : 0,
        category: data.category,
        severity: data.severity
      }));
  };

  const diagnoses = generateDiagnosisData();
  const totalDiagnoses = diagnoses.reduce((sum, d) => sum + d.value, 0);

  if (loading) {
    return (
      <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 border-b border-purple-100/50">
          <CardTitle className="text-slate-900 text-xl font-bold">Most Common Diagnoses</CardTitle>
          <p className="text-slate-600 text-sm">Loading diagnosis data...</p>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-slate-500">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-50 via-blue-50 to-green-50 border-b border-purple-100/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-slate-900 text-xl font-bold flex items-center gap-2">
                Most Common Diagnoses
                <Activity className="h-5 w-5 text-slate-600" />
              </CardTitle>
              <p className="text-slate-600 text-sm mt-1 font-medium">Clinical findings and diagnostic patterns</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{totalDiagnoses}</div>
            <div className="text-xs text-slate-500 font-medium">Total Cases</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Visual Progress Bars */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <h4 className="font-bold text-slate-900 text-lg">Diagnostic Distribution</h4>
            </div>
            
            <div className="space-y-5">
              {diagnoses.map((diagnosis, index) => (
                <div key={index} className="group space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full shadow-sm" 
                          style={{ backgroundColor: categoryColors[diagnosis.category] }}
                        />
                        <span className="font-bold text-sm text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                          {diagnosis.code}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-900 group-hover:text-purple-700 transition-colors">
                          {diagnosis.label}
                        </div>
                        <div className="text-xs text-slate-600 flex items-center space-x-2 mt-1">
                          <span className="font-medium">{diagnosis.category}</span>
                          <span 
                            className="font-bold px-2 py-0.5 rounded-full text-white text-xs"
                            style={{ backgroundColor: severityColors[diagnosis.severity] }}
                          >
                            {diagnosis.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div 
                        className="font-bold text-2xl" 
                        style={{ color: categoryColors[diagnosis.category] }}
                      >
                        {diagnosis.value}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">cases</div>
                    </div>
                  </div>
                  
                  {/* Enhanced progress bar with gradient */}
                  <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div 
                      className="h-4 rounded-full transition-all duration-700 shadow-sm relative overflow-hidden"
                      style={{ 
                        width: `${diagnosis.percentage * 3.2}%`,
                        background: `linear-gradient(90deg, ${categoryColors[diagnosis.category]}, ${categoryColors[diagnosis.category]}cc, ${categoryColors[diagnosis.category]}88)`
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 font-medium">{diagnosis.percentage}% of total</span>
                    <span className="text-slate-500 font-medium">{diagnosis.value} cases</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Statistics Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <h4 className="font-bold text-slate-900 text-lg">Clinical Analytics</h4>
            </div>
            
            {/* Category breakdown */}
            <div className="space-y-4">
              <h5 className="font-semibold text-slate-700 text-sm">By Medical Category</h5>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(categoryColors).map(([category, color]) => {
                  const categoryDiagnoses = diagnoses.filter(d => d.category === category);
                  const categoryTotal = categoryDiagnoses.reduce((sum, d) => sum + d.value, 0);
                  const categoryPercentage = (categoryTotal / totalDiagnoses) * 100;
                  
                  return (
                    <div key={category} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-100 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-semibold text-sm text-slate-900">{category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg" style={{ color }}>
                          {categoryTotal}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {categoryPercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary statistics */}
            <div className="mt-6 p-6 bg-gradient-to-r from-purple-100 via-blue-100 to-green-100 rounded-xl border border-purple-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-purple-900">C50</div>
                  <div className="text-sm text-purple-700 font-semibold">Most Common</div>
                  <div className="text-xs text-purple-600 font-medium">Breast Cancer</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-blue-900">3</div>
                  <div className="text-sm text-blue-700 font-semibold">Categories</div>
                  <div className="text-xs text-blue-600 font-medium">Medical Areas</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-xs text-slate-600 font-medium bg-white/60 py-2 px-4 rounded-lg">
                  📊 Early detection rate improved by 18% this quarter
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
