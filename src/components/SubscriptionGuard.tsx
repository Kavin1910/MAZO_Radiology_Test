import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, AlertTriangle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { BusinessPlanDialog } from './BusinessPlanDialog';
import { useState } from 'react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  feature?: string;
  fallback?: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ 
  children, 
  feature = "this feature",
  fallback 
}) => {
  const { hasAccess, subscription } = useSubscription();
  const [showBusinessDialog, setShowBusinessDialog] = useState(false);

  if (hasAccess()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <>
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Lock className="w-5 h-5" />
            {subscription?.status === 'trial_expired' ? 'Trial Expired' : 'Access Restricted'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-3 flex-1">
              <p className="text-amber-700">
                {subscription?.status === 'trial_expired' 
                  ? `Your free trial has expired. To continue using ${feature}, please upgrade to our Business plan.`
                  : `Access to ${feature} requires an active subscription.`
                }
              </p>
              <Button 
                onClick={() => setShowBusinessDialog(true)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Upgrade to Business Plan
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <BusinessPlanDialog 
        open={showBusinessDialog}
        onOpenChange={setShowBusinessDialog}
      />
    </>
  );
};