
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useMedicalCases } from '@/hooks/useMedicalCases';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const chartConfig = {
  xray: {
    label: "X-Ray",
    color: "#3B82F6",
  },
  ct: {
    label: "CT Scan", 
    color: "#10B981",
  },
  mri: {
    label: "MRI",
    color: "#F59E0B",
  },
  ultrasound: {
    label: "Ultrasound",
    color: "#EF4444",
  },
};

export const ModalityChart: React.FC = () => {
  const { cases, loading } = useMedicalCases();

  // Generate real data from cases
  const generateModalityData = () => {
    const modalityCounts = {
      'X-Ray': 0,
      'CT': 0,
      'MRI': 0,
      'Ultrasound': 0
    };

    cases.forEach(case_ => {
      const modality = case_.imageType;
      if (modality) {
        const normalizedModality = modality.toUpperCase();
        if (normalizedModality.includes('CT')) {
          modalityCounts['CT']++;
        } else if (normalizedModality.includes('MRI')) {
          modalityCounts['MRI']++;
        } else if (normalizedModality.includes('X-RAY') || normalizedModality.includes('XRAY')) {
          modalityCounts['X-Ray']++;
        } else if (normalizedModality.includes('ULTRASOUND') || normalizedModality.includes('US')) {
          modalityCounts['Ultrasound']++;
        }
      }
    });

    const total = Object.values(modalityCounts).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
      return [
        { name: 'CT', value: 1, percentage: 100 }
      ];
    }

    return Object.entries(modalityCounts)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({
        name: name === 'CT' ? 'CT Scan' : name,
        value,
        percentage: Math.round((value / total) * 100)
      }));
  };

  const data = generateModalityData();

  if (loading) {
    return (
      <Card className="bg-mazo-blue-light border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900 text-lg">Imaging Modalities</CardTitle>
          <p className="text-slate-600 text-sm">Loading modality data...</p>
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
    <Card className="bg-mazo-blue-light border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-900 text-lg">Imaging Modalities</CardTitle>
        <p className="text-slate-600 text-sm">Distribution of scan types today</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value, name) => [
                `${value} scans (${data.find(d => d.name === name)?.percentage}%)`,
                name
              ]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>
                  {value}: {data.find(d => d.name === value)?.value} ({data.find(d => d.name === value)?.percentage}%)
                </span>
              )}
            />
          </PieChart>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="text-slate-700">{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
