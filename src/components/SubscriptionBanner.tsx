import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, AlertTriangle, X } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { BusinessPlanDialog } from './BusinessPlanDialog';

export const SubscriptionBanner = () => {
  const { subscription, daysRemaining, isTrialExpiring, hasAccess } = useSubscription();
  const [dismissed, setDismissed] = useState(false);
  const [showBusinessDialog, setShowBusinessDialog] = useState(false);

  // Don't show banner if dismissed, no subscription, or user has business access
  if (dismissed || !subscription || subscription.status === 'business_approved') {
    return null;
  }

  // Show trial expiring warning
  if (isTrialExpiring()) {
    return (
      <>
        <Alert className="mb-4 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-amber-800">
                Trial expires in {daysRemaining} days
              </span>
              <span className="text-amber-700">
                - Upgrade now to continue using all features
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setShowBusinessDialog(true)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Upgrade Now
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDismissed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        <BusinessPlanDialog 
          open={showBusinessDialog}
          onOpenChange={setShowBusinessDialog}
        />
      </>
    );
  }

  // Show trial expired message
  if (subscription.status === 'trial_expired') {
    return (
      <>
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-red-800">
                Trial has expired
              </span>
              <span className="text-red-700">
                - Some features are now restricted
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setShowBusinessDialog(true)}
                variant="destructive"
              >
                Upgrade Now
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDismissed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
        <BusinessPlanDialog 
          open={showBusinessDialog}
          onOpenChange={setShowBusinessDialog}
        />
      </>
    );
  }

  // Show business plan pending message
  if (subscription.status === 'business_pending') {
    return (
      <Alert className="mb-4 border-blue-200 bg-blue-50">
        <Clock className="h-4 w-4 text-blue-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-blue-800">
              Business plan request pending
            </span>
            <span className="text-blue-700">
              - We'll contact you soon with details
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};