
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Users, Shield, Zap } from 'lucide-react';

interface CTASectionProps {
  onGetStarted: () => void;
  onRequestDemo: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onGetStarted, onRequestDemo }) => {
  return (
    <section className="py-20 bg-mazo-gradient-secondary">
      <div className="container mx-auto px-6">
        <Card className="glass-card border-white/20 overflow-hidden">
          <CardContent className="p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Content */}
              <div className="text-white space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                    Ready to Transform Your
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-300">
                      {' '}Radiology Practice?
                    </span>
                  </h2>
                  
                  <p className="text-xl text-blue-100 leading-relaxed">
                    Join thousands of healthcare professionals who trust Mazo Radiology 
                    for accurate, efficient medical imaging analysis.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-blue-100">Get started in less than 5 minutes</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-blue-100">Enterprise-grade security & compliance</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-blue-100">24/7 dedicated support team</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={onGetStarted}
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold group"
                  >
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  <Button 
                    onClick={onRequestDemo}
                    variant="outline"
                    size="lg"
                    className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
                  >
                    Schedule Demo
                  </Button>
                </div>
              </div>

              {/* Right Column - Benefits */}
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h4 className="text-xl font-semibold text-white mb-4">What's Included:</h4>
                  <ul className="space-y-3 text-blue-100">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                      Unlimited AI image analysis
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                      Voice-to-text dictation
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                      Real-time case prioritization
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                      Automated report generation
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                      HIPAA-compliant storage
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                      Integration support
                    </li>
                  </ul>
                </div>

                <div className="text-center text-blue-200 text-sm">
                  No credit card required • Cancel anytime • Full support included
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
