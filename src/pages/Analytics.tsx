
import React from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { AnalyticsStats } from '@/components/analytics/AnalyticsStats';
import { ModalityChart } from '@/components/analytics/ModalityChart';
import { ScanVolumeChart } from '@/components/analytics/ScanVolumeChart';
import { ProductivityChart } from '@/components/analytics/ProductivityChart';
import { AgeGroupChart } from '@/components/analytics/AgeGroupChart';
import { LocationChart } from '@/components/analytics/LocationChart';
import { AnomaliesChart } from '@/components/analytics/AnomaliesChart';
import { DiagnosesChart } from '@/components/analytics/DiagnosesChart';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-green-400/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-40 right-10 w-36 h-36 bg-indigo-400/10 rounded-full blur-2xl"></div>
      </div>
      
      <AnalyticsHeader />
      
      <main className="container mx-auto px-6 py-8 space-y-8 relative z-10">
        <div className="animate-fade-in-up">
          <AnalyticsStats />
        </div>
        
        {/* Primary Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="xl:col-span-1">
            <div className="card-enhanced">
              <ModalityChart />
            </div>
          </div>
          <div className="xl:col-span-2">
            <div className="card-enhanced">
              <ScanVolumeChart />
            </div>
          </div>
          <div className="xl:col-span-2">
            <div className="card-enhanced">
              <ProductivityChart />
            </div>
          </div>
          <div className="xl:col-span-1">
            <div className="card-enhanced">
              <AgeGroupChart />
            </div>
          </div>
        </div>
        
        {/* Secondary Analytics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="xl:col-span-2">
            <div className="card-enhanced">
              <LocationChart />
            </div>
          </div>
          <div className="xl:col-span-1">
            <div className="card-enhanced">
              <AgeGroupChart variant="bar" />
            </div>
          </div>
        </div>
        
        {/* Bottom Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="card-enhanced">
            <AnomaliesChart />
          </div>
          <div className="card-enhanced">
            <DiagnosesChart />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
