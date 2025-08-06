import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Brain, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type AuthMode = 'login' | 'register' | 'forgot-password';

const Auth: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const { signIn, signUp, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome Back!",
        description: "Successfully logged in.",
      });
    }
  };

  const handleRegister = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    institution: string;
    role: string;
  }) => {
    const { error } = await signUp(userData.email, userData.password, {
      first_name: userData.firstName,
      last_name: userData.lastName,
      institution: userData.institution,
      role: userData.role
    });
    
    if (error) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registration Successful",
        description: "Please check your email to confirm your account.",
      });
    }
  };

  const handleResetPassword = async (email: string) => {
    // Implement password reset logic here
    console.log('Password reset for:', email);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Mazo Radiology</span>
            </div>
            
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Info */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                  Welcome to
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block">
                    Mazo Radiology-AI
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Advanced AI-powered medical imaging platform designed for modern radiology departments.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Analysis</h3>
                    <p className="text-gray-600">Advanced algorithms for accurate medical image interpretation and priority-based triage.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">HIPAA Compliant</h3>
                    <p className="text-gray-600">Enterprise-grade security ensuring complete patient data protection and compliance.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Real-Time Processing</h3>
                    <p className="text-gray-600">Instant analysis and streamlined workflow to reduce diagnosis time significantly.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="w-full max-w-md mx-auto">
              <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {authMode === 'login' && 'Sign In'}
                    {authMode === 'register' && 'Create Account'}
                    {authMode === 'forgot-password' && 'Reset Password'}
                  </CardTitle>
                  <p className="text-gray-600 mt-2">
                    {authMode === 'login' && 'Access your radiology dashboard'}
                    {authMode === 'register' && 'Join our platform today'}
                    {authMode === 'forgot-password' && 'We\'ll send you a reset link'}
                  </p>
                </CardHeader>
                
                <CardContent>
                  {authMode === 'login' && (
                    <LoginForm
                      onSwitchToRegister={() => setAuthMode('register')}
                      onSwitchToForgotPassword={() => setAuthMode('forgot-password')}
                      onLogin={handleLogin}
                    />
                  )}
                  
                  {authMode === 'register' && (
                    <RegisterForm
                      onSwitchToLogin={() => setAuthMode('login')}
                      onRegister={handleRegister}
                    />
                  )}
                  
                  {authMode === 'forgot-password' && (
                    <ForgotPasswordForm
                      onSwitchToLogin={() => setAuthMode('login')}
                      onResetPassword={handleResetPassword}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;