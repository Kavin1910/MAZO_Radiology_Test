import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface AppHeaderProps {
  variant?: 'home' | 'dashboard';
  showAuth?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
  variant = 'home',
  showAuth = true 
}) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

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
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Mazo Radiology</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {variant === 'home' && (
              <>
                <Button
                  onClick={() => navigate('/home')}
                  variant="ghost"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Learn More
                </Button>
                
                {showAuth && (
                  <>
                    {user ? (
                      <div className="flex items-center space-x-4">
                        <Button
                          onClick={() => navigate('/dashboard')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Dashboard
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>Account</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => navigate('/subscription')}>
                              <User className="mr-2 h-4 w-4" />
                              <span>Subscription</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleSignOut}>
                              <LogOut className="mr-2 h-4 w-4" />
                              <span>Sign out</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-4">
                        <Button
                          onClick={() => navigate('/auth')}
                          variant="outline"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Sign In
                        </Button>
                        <Button
                          onClick={() => navigate('/dashboard')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Demo Dashboard
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};