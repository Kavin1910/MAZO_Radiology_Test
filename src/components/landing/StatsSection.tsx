
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const stats = [
  {
    number: '500+',
    label: 'Healthcare Institutions',
    description: 'Trust our platform worldwide'
  },
  {
    number: '2.5M+',
    label: 'Images Analyzed',
    description: 'Processed with AI precision'
  },
  {
    number: '99.2%',
    label: 'Accuracy Rate',
    description: 'Validated by radiologists'
  },
  {
    number: '60%',
    label: 'Time Reduction',
    description: 'In report generation'
  }
];

export const StatsSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Trusted by Healthcare Leaders
            <span className="text-gradient-primary"> Worldwide</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform delivers measurable results that transform radiology departments 
            and improve patient outcomes across the globe.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="text-center card-enhanced hover-lift animate-scale-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="text-4xl lg:text-5xl font-bold text-gradient-primary">
                    {stat.number}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {stat.label}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust logos section */}
        <div className="mt-20 text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-8">
            Trusted by leading healthcare institutions
          </h3>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="h-12 w-32 bg-gray-300 rounded flex items-center justify-center text-gray-600 font-semibold">
              General Hospital
            </div>
            <div className="h-12 w-32 bg-gray-300 rounded flex items-center justify-center text-gray-600 font-semibold">
              Medical Center
            </div>
            <div className="h-12 w-32 bg-gray-300 rounded flex items-center justify-center text-gray-600 font-semibold">
              City Clinic
            </div>
            <div className="h-12 w-32 bg-gray-300 rounded flex items-center justify-center text-gray-600 font-semibold">
              Regional Health
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
