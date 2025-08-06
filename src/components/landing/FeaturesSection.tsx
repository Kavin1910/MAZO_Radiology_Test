
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: '🧠',
    title: 'AI-Powered Analysis',
    description: 'Advanced machine learning algorithms analyze medical images with radiologist-level accuracy.',
    badge: '99.2% Accurate'
  },
  {
    icon: '🎤',
    title: 'Voice-to-Text Dictation',
    description: 'Seamlessly dictate findings and reports using our advanced speech recognition technology.',
    badge: 'Real-time'
  },
  {
    icon: '⚡',
    title: 'Real-Time Triage',
    description: 'Automatically prioritize cases by severity - critical, urgent, or routine classification.',
    badge: 'Instant'
  },
  {
    icon: '📋',
    title: 'Streamlined Reports',
    description: 'Generate comprehensive, professional reports with automated formatting and delivery.',
    badge: '60% Faster'
  },
  {
    icon: '🔒',
    title: 'HIPAA Compliant',
    description: 'Enterprise-grade security with end-to-end encryption and regulatory compliance.',
    badge: 'Secure'
  },
  {
    icon: '☁️',
    title: 'Cloud-Based Platform',
    description: 'Access your dashboard anywhere, anytime with our reliable cloud infrastructure.',
    badge: '99.9% Uptime'
  }
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            ✨ Advanced Features
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need for
            <span className="text-gradient-primary"> Modern Radiology</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive platform combines cutting-edge AI technology with intuitive design 
            to revolutionize your radiology workflow.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="card-enhanced hover-lift group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
