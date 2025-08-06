import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { 
  Brain, 
  Zap, 
  Shield, 
  Clock,
  BarChart3,
  Users,
  ArrowRight,
  Activity
} from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms for accurate medical image interpretation"
    },
    {
      icon: Zap,
      title: "Real-Time Processing",
      description: "Instant analysis and priority-based case triage"
    },
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Enterprise-grade security for patient data protection"
    },
    {
      icon: Clock,
      title: "Efficient Workflow",
      description: "Streamlined processes to reduce diagnosis time"
    }
  ];

  const stats = [
    { value: "99.2%", label: "Accuracy Rate" },
    { value: "60%", label: "Time Reduction" },
    { value: "24/7", label: "Availability" },
    { value: "500+", label: "Institutions" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <AppHeader variant="home" />

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <Badge variant="outline" className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
            ✨ AI-Powered Medical Imaging
          </Badge>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Revolutionizing
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Radiology</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Advanced AI technology meets clinical expertise to deliver faster, more accurate 
            medical imaging analysis. Transform your radiology workflow today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {user ? (
              <>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                >
                  <Activity className="mr-2 h-5 w-5" />
                  Open Dashboard
                </Button>
                <Button 
                  onClick={() => navigate('/analytics')}
                  variant="outline" 
                  size="lg"
                  className="px-8 py-4 text-lg border-gray-300"
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Analytics
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => navigate('/auth')}
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  variant="outline" 
                  size="lg"
                  className="px-8 py-4 text-lg border-gray-300"
                >
                  <Activity className="mr-2 h-5 w-5" />
                  Dashboard
                </Button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Mazo Radiology?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cutting-edge technology designed specifically for modern radiology departments
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <feature.icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of healthcare institutions already using our platform to improve patient outcomes
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg"
                >
                  <Activity className="mr-2 h-5 w-5" />
                  Open Dashboard
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
                >
                  Learn More
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => navigate('/auth')}
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
                <Button 
                  onClick={() => navigate('/')}
                  variant="outline" 
                  size="lg"
                  className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
                >
                  Learn More
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-xl font-bold text-white">Mazo Radiology</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered medical imaging platform transforming radiology workflows worldwide.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button 
                    onClick={() => navigate('/dashboard')}
                    className="hover:text-white transition-colors"
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/analytics')}
                    className="hover:text-white transition-colors"
                  >
                    Analytics
                  </button>
                </li>
                 <li>
                   <button 
                     onClick={() => navigate('/')}
                     className="hover:text-white transition-colors"
                   >
                     Features
                   </button>
                 </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            © 2024 Mazo Radiology. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;