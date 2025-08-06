
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import { useMedicalCases } from '@/hooks/useMedicalCases';

const chartConfig = {
  completed: {
    label: "Completed Reports",
    color: "#10B981",
  },
  pending: {
    label: "Pending Reports", 
    color: "#F59E0B",
  },
};

export const ProductivityChart: React.FC = () => {
  const { cases, loading } = useMedicalCases();

  // Generate productivity data from real cases
  const generateProductivityData = () => {
    const radiologistStats: { [key: string]: { radiologist: string; completed: number; pending: number; total: number } } = {};

    cases.forEach(case_ => {
      const radiologist = case_.assignedTo || 'Unassigned';
      
      if (!radiologistStats[radiologist]) {
        radiologistStats[radiologist] = {
          radiologist,
          completed: 0,
          pending: 0,
          total: 0
        };
      }

      radiologistStats[radiologist].total++;
      
      if (case_.status === 'review-completed') {
        radiologistStats[radiologist].completed++;
      } else {
        radiologistStats[radiologist].pending++;
      }
    });

    const productivityData = Object.values(radiologistStats)
      .filter(stats => stats.total > 0)
      .slice(0, 5); // Top 5 radiologists

    // If no real data, show a default entry
    if (productivityData.length === 0) {
      return [{
        radiologist: 'System',
        completed: cases.filter(c => c.status === 'review-completed').length,
        pending: cases.filter(c => c.status !== 'review-completed').length,
        total: cases.length
      }];
    }

    return productivityData;
  };

  const data = generateProductivityData();

  if (loading) {
    return (
      <Card className="bg-mazo-blue border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900 text-lg">Radiologist Productivity</CardTitle>
          <p className="text-slate-600 text-sm">Loading productivity data...</p>
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
    <Card className="bg-mazo-blue border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-900 text-lg">Radiologist Productivity</CardTitle>
        <p className="text-slate-600 text-sm">Reports completed vs pending today</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="radiologist" 
              tick={{ fill: '#475569', fontSize: 10 }}
              axisLine={{ stroke: '#CBD5E1' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fill: '#475569', fontSize: 12 }}
              axisLine={{ stroke: '#CBD5E1' }}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              labelFormatter={(value) => `${value}`}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              wrapperStyle={{ color: '#475569' }}
            />
            <Bar 
              dataKey="completed" 
              fill="#10B981" 
              name="Completed Reports"
              radius={[0, 0, 4, 4]}
            />
            <Bar 
              dataKey="pending" 
              fill="#F59E0B" 
              name="Pending Reports"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
        <div className="mt-4 text-xs text-slate-700">
          <div className="grid grid-cols-2 gap-4">
            <div>Total Reports Today: {data.reduce((sum, item) => sum + item.total, 0)}</div>
            <div>Average per Radiologist: {Math.round(data.reduce((sum, item) => sum + item.total, 0) / data.length)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
