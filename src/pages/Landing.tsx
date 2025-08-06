
import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { CTASection } from '@/components/landing/CTASection';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleRequestDemo = () => {
    toast({
      title: "Demo requested",
      description: "Our team will contact you within 24 hours to schedule your demo.",
    });
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">M</span>
              </div>
              <span className="text-2xl font-bold text-white">Mazo Radiology</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/auth')}
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                Sign In
              </Button>
              <Button
                onClick={handleGetStarted}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <HeroSection onGetStarted={handleGetStarted} onRequestDemo={handleRequestDemo} />
      <FeaturesSection />
      <StatsSection />
      <CTASection onGetStarted={handleGetStarted} onRequestDemo={handleRequestDemo} />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-xl font-bold">Mazo Radiology</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered medical imaging platform transforming radiology workflows worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Training</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 Mazo Radiology. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
