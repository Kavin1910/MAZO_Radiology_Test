
import React, { useState } from 'react';
import { Menu, Activity, TrendingUp, Brain, Zap, Home, X, LogOut, User, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/NotificationBell';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const AnalyticsHeader: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 border-b border-blue-800/50 shadow-mazo-xl relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 py-8 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 animate-fade-in-up">
              <div className="relative">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-mazo-lg hover-glow">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse"></div>
              </div>
              <div className="animate-slide-in-right">
                <h1 className="text-display-2 font-bold text-white tracking-tight">
                  Radiology Analytics
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Dashboard</span>
                </h1>
                <p className="text-blue-200 text-body-1 mt-2 flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-400" />
                  Advanced Medical Imaging Intelligence
                  <Zap className="h-4 w-4 ml-2 text-yellow-400" />
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center text-sm text-blue-300">
                    <TrendingUp className="h-4 w-4 mr-1 text-green-400" />
                    <span>Live Data</span>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-300">Real-time Analytics</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 animate-scale-in">
              <NotificationBell />
              
              {/* Desktop Navigation Buttons */}
              <div className="hidden md:flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleNavigateToDashboard}
                  className="text-blue-200 hover:text-white hover:bg-blue-800/50 backdrop-blur-sm border border-blue-700/50 hover:border-blue-600 transition-all duration-300 hover-lift"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Case Status
                </Button>

                {/* User Account Dropdown */}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-blue-200 hover:text-white hover:bg-blue-800/50 backdrop-blur-sm border border-blue-700/50 hover:border-blue-600 transition-all duration-300 hover-lift"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Account
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white border border-slate-200 shadow-lg z-50">
                      <DropdownMenuItem onClick={() => navigate('/profile')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/help')}>
                        <HelpCircle className="mr-2 h-4 w-4" />
                        <span>Help & Support</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Single Hamburger Menu (Mobile Only) */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleMenu}
                className="text-blue-200 hover:text-white hover:bg-blue-800/50 backdrop-blur-sm border border-blue-700/50 hover:border-blue-600 transition-all duration-300 hover-lift md:hidden"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-blue-800/50 z-50 md:hidden">
            <div className="container mx-auto px-6 py-6 space-y-4">
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={handleNavigateToDashboard}
                className="w-full justify-start text-blue-200 hover:text-white hover:bg-blue-800/50 transition-all duration-300"
              >
                <Home className="h-5 w-5 mr-3" />
                Case Status View
              </Button>
              {user && (
                <Button 
                  variant="ghost" 
                  size="lg" 
                  onClick={handleSignOut}
                  className="w-full justify-start text-blue-200 hover:text-white hover:bg-blue-800/50 transition-all duration-300"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
