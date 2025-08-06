
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft } from 'lucide-react';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
  onResetPassword: (email: string) => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ 
  onSwitchToLogin, 
  onResetPassword 
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onResetPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Password reset failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto glass-card">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-gradient-primary">
            Check Your Email
          </CardTitle>
          <CardDescription className="text-gray-600">
            We've sent password reset instructions to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Please check your email and follow the instructions to reset your password.
            </p>
          </div>
          
          <Button
            onClick={onSwitchToLogin}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto glass-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-gradient-primary">
          Reset Password
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          Enter your email address and we'll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="doctor@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 input-enhanced"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full btn-primary-enhanced"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onSwitchToLogin}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
