
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
  onRequestDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onRequestDemo }) => {
  return (
    <section className="relative overflow-hidden bg-mazo-gradient-primary min-h-[90vh] flex items-center">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-transparent" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-white space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <Badge variant="outline" className="border-white/30 text-white bg-white/10 backdrop-blur-sm">
                🏆 Trusted by 500+ Healthcare Institutions
              </Badge>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                AI That Thinks Like a{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-300">
                  Radiologist
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed">
                Revolutionary AI-powered platform transforming medical imaging with 
                voice-to-text dictation, real-time triage, and intelligent report generation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold group"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                onClick={onRequestDemo}
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold">99.2%</div>
                <div className="text-blue-200 text-sm">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">60%</div>
                <div className="text-blue-200 text-sm">Faster Reporting</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-blue-200 text-sm">AI Availability</div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative animate-scale-in">
            <div className="relative">
              {/* Main dashboard preview */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-32 bg-blue-200 rounded animate-pulse" />
                    <div className="h-4 w-20 bg-green-200 rounded animate-pulse" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 bg-blue-600 rounded" />
                    </div>
                    <div className="h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 bg-green-600 rounded" />
                    </div>
                    <div className="h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                      <div className="w-8 h-8 bg-purple-600 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-6 -left-6 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-float">
                AI Analysis Complete
              </div>
              <div className="absolute -bottom-4 -right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-float" style={{ animationDelay: '1s' }}>
                Report Generated
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
