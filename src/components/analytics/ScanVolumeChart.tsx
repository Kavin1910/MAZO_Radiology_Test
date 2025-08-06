
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import { useMedicalCases } from '@/hooks/useMedicalCases';

const chartConfig = {
  scans: {
    label: "New Scans",
    color: "#3B82F6",
  },
  reports: {
    label: "Completed Reports", 
    color: "#10B981",
  },
};

export const ScanVolumeChart: React.FC = () => {
  const { cases, loading } = useMedicalCases();

  // Generate hourly data from real cases
  const generateHourlyData = () => {
    const hourlyData = Array.from({ length: 6 }, (_, i) => {
      const hour = i * 4; // 0, 4, 8, 12, 16, 20
      return {
        time: `${hour.toString().padStart(2, '0')}:00`,
        scans: 0,
        reports: 0
      };
    });

    cases.forEach(case_ => {
      const caseDate = new Date(case_.createdAt);
      const hour = caseDate.getHours();
      const timeSlot = Math.floor(hour / 4) * 4; // Round down to nearest 4-hour slot
      const dataIndex = timeSlot / 4;

      if (dataIndex < hourlyData.length) {
        hourlyData[dataIndex].scans += 1;
        if (case_.status === 'review-completed') {
          hourlyData[dataIndex].reports += 1;
        }
      }
    });

    return hourlyData;
  };

  const data = generateHourlyData();
  const peakScanTime = data.reduce((max, current) => current.scans > max.scans ? current : max, data[0]);
  const peakReportTime = data.reduce((max, current) => current.reports > max.reports ? current : max, data[0]);

  if (loading) {
    return (
      <Card className="bg-mazo-blue border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900 text-lg">Scan Volume</CardTitle>
          <p className="text-slate-600 text-sm">Loading scan and report data...</p>
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
        <CardTitle className="text-slate-900 text-lg">Scan Volume</CardTitle>
        <p className="text-slate-600 text-sm">Hourly scan and report completion rates</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <LineChart data={data}>
            <XAxis 
              dataKey="time" 
              tick={{ fill: '#475569', fontSize: 12 }}
              axisLine={{ stroke: '#CBD5E1' }}
            />
            <YAxis 
              tick={{ fill: '#475569', fontSize: 12 }}
              axisLine={{ stroke: '#CBD5E1' }}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              labelFormatter={(value) => `Time: ${value}`}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              wrapperStyle={{ color: '#475569' }}
            />
            <Line 
              type="monotone" 
              dataKey="scans" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 4 }}
              name="New Scans"
            />
            <Line 
              type="monotone" 
              dataKey="reports" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 4 }}
              name="Completed Reports"
            />
          </LineChart>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
          <div className="text-slate-700">
            <span className="text-blue-600">●</span> Peak Scan Time: {peakScanTime.time} ({peakScanTime.scans} scans)
          </div>
          <div className="text-slate-700">
            <span className="text-green-600">●</span> Peak Report Time: {peakReportTime.time} ({peakReportTime.reports} reports)
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
