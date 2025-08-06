
import React, { useState } from 'react';
import { Activity, List, Clock, Filter, X, BarChart3, Bell, Sparkles, LogOut, User, ArrowLeft, Settings, UserCircle, HelpCircle, Bot, Upload, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from '@/components/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  viewMode: 'list' | 'timeline' | 'tile';
  setViewMode: (mode: 'list' | 'timeline' | 'tile') => void;
  activeView: 'system-processed' | 'manual-upload';
  setActiveView: (view: 'system-processed' | 'manual-upload') => void;
  selectedPriority?: string | null;
  selectedStatus?: string | null;
  setSelectedPriority?: (priority: string | null) => void;
  setSelectedStatus?: (status: string | null) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  viewMode,
  setViewMode,
  activeView,
  setActiveView,
  selectedPriority,
  selectedStatus,
  setSelectedPriority,
  setSelectedStatus
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  
  const clearFilters = () => {
    setSelectedPriority?.(null);
    setSelectedStatus?.(null);
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

  const hasActiveFilters = selectedPriority || selectedStatus;

  return (
    <>
      <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-mazo-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 animate-fade-in-up">
              <div className="flex items-center space-x-4">
                <div 
                  className="flex items-center space-x-2 cursor-pointer"
                  onClick={() => navigate('/')}
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">M</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">Mazo Radiology</span>
                </div>
              </div>
              <div className="animate-slide-in-right">
                <p className="text-body-2 text-slate-600 flex items-center">
                  <Sparkles className="h-4 w-4 mr-1 text-purple-500" />
                  AI-powered diagnostic prioritization
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 animate-scale-in">
              {/* Analytics Button */}
              <Button
                variant="outline"
                onClick={() => navigate('/analytics')}
                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-300 hover-lift"
              >
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Analytics</span>
              </Button>

              {/* Data Source Selection */}
              <div className="flex items-center bg-slate-100/80 backdrop-blur-sm rounded-xl p-1 border border-slate-200/60">
                <Button
                  variant={activeView === 'system-processed' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('system-processed')}
                  className={`flex items-center space-x-2 rounded-lg transition-all duration-300 ${
                    activeView === 'system-processed' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-mazo-sm hover:shadow-mazo-md' 
                      : 'hover:bg-white/80 text-slate-600'
                  }`}
                >
                  <Bot className="h-4 w-4" />
                  <span className="font-medium">System</span>
                </Button>
                <Button
                  variant={activeView === 'manual-upload' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('manual-upload')}
                  className={`flex items-center space-x-2 rounded-lg transition-all duration-300 ${
                    activeView === 'manual-upload' 
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-mazo-sm hover:shadow-mazo-md' 
                      : 'hover:bg-white/80 text-slate-600'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  <span className="font-medium">Manual</span>
                </Button>
              </div>

              {/* View Mode Buttons */}
              <div className="flex items-center bg-slate-100/80 backdrop-blur-sm rounded-xl p-1 border border-slate-200/60">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`flex items-center space-x-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-mazo-sm hover:shadow-mazo-md' 
                      : 'hover:bg-white/80 text-slate-600'
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span className="font-medium">List</span>
                </Button>
                <Button
                  variant={viewMode === 'tile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('tile')}
                  className={`flex items-center space-x-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'tile' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-mazo-sm hover:shadow-mazo-md' 
                      : 'hover:bg-white/80 text-slate-600'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="font-medium">Tile</span>
                </Button>
                <Button
                  variant={viewMode === 'timeline' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('timeline')}
                  className={`flex items-center space-x-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'timeline' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-mazo-sm hover:shadow-mazo-md' 
                      : 'hover:bg-white/80 text-slate-600'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Timeline</span>
                </Button>
              </div>

              {/* Use the existing NotificationBell component instead of hardcoded notification */}
              <NotificationBell />

              {/* User Account Dropdown - Always show */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm border-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:border-blue-300 transition-all duration-300 hover-lift"
                  >
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white border border-slate-200 shadow-xl z-50 backdrop-blur-sm">
                  <DropdownMenuItem 
                    onClick={() => navigate('/profile')}
                    className="cursor-pointer hover:bg-slate-50 text-slate-700 hover:text-slate-900 focus:bg-slate-50 focus:text-slate-900"
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/settings')}
                    className="cursor-pointer hover:bg-slate-50 text-slate-700 hover:text-slate-900 focus:bg-slate-50 focus:text-slate-900"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/help')}
                    className="cursor-pointer hover:bg-slate-50 text-slate-700 hover:text-slate-900 focus:bg-slate-50 focus:text-slate-900"
                  >
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="cursor-pointer hover:bg-red-50 text-red-600 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {hasActiveFilters && (
                <div className="flex items-center space-x-2 animate-fade-in-up">
                  <span className="text-sm text-slate-600 font-medium">Filters:</span>
                  {selectedPriority && (
                    <Badge variant="secondary" className="capitalize bg-blue-100 text-blue-800 border-blue-200">
                      {selectedPriority} Priority
                    </Badge>
                  )}
                  {selectedStatus && (
                    <Badge variant="secondary" className="capitalize bg-purple-100 text-purple-800 border-purple-200">
                      {selectedStatus.replace('-', ' ')}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full transition-all duration-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
