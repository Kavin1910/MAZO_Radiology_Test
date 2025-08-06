import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Building2, Zap, Shield, Users } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { BusinessPlanDialog } from './BusinessPlanDialog';

export const SubscriptionPlans = () => {
  const { subscription, loading, daysRemaining, startFreeTrial, hasAccess } = useSubscription();
  const [showBusinessDialog, setShowBusinessDialog] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const features = [
    "Full access to AI image analysis",
    "Advanced case management",
    "Real-time notifications", 
    "Export and reporting tools",
    "Priority support",
    "Unlimited cases"
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Start with our free trial to experience all features, then upgrade to our business plan for continued access.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Trial Plan */}
        <Card className={`relative ${subscription?.status === 'trial_active' ? 'ring-2 ring-primary' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Free Trial</CardTitle>
              {subscription?.status === 'trial_active' && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-3xl font-bold">30 Days</span>
              <span className="text-muted-foreground">Full Access</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
            
            {subscription?.status === 'trial_active' ? (
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">
                    {daysRemaining} days remaining
                  </span>
                </div>
                <Button disabled className="w-full">
                  Trial Active
                </Button>
              </div>
            ) : subscription?.status === 'trial_expired' ? (
              <div className="pt-4">
                <Badge variant="destructive" className="mb-3">
                  Trial Expired
                </Badge>
                <p className="text-sm text-muted-foreground mb-3">
                  Your trial has ended. Upgrade to continue using all features.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowBusinessDialog(true)}
                >
                  Upgrade to Business
                </Button>
              </div>
            ) : (
              <Button 
                onClick={startFreeTrial}
                className="w-full mt-6"
                disabled={subscription?.status === 'business_approved'}
              >
                Start Free Trial
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Business Plan */}
        <Card className={`relative ${subscription?.status === 'business_approved' ? 'ring-2 ring-primary' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Business</CardTitle>
              {subscription?.status === 'business_approved' && (
                <Badge className="bg-blue-100 text-blue-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
              {subscription?.status === 'business_pending' && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="text-3xl font-bold">Custom</span>
              <span className="text-muted-foreground">Pricing</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm font-medium">Dedicated account manager</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm font-medium">Enterprise security</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm font-medium">Custom integrations</span>
              </div>
            </div>
            
            {subscription?.status === 'business_approved' ? (
              <Button disabled className="w-full mt-6">
                <Shield className="w-4 h-4 mr-2" />
                Business Plan Active
              </Button>
            ) : subscription?.status === 'business_pending' ? (
              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Your request is being reviewed. We'll contact you soon with details.
                </p>
                <Button disabled className="w-full">
                  <Clock className="w-4 h-4 mr-2" />
                  Request Pending
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline"
                onClick={() => setShowBusinessDialog(true)}
                className="w-full mt-6"
              >
                Contact Us
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {!hasAccess() && subscription?.status === 'trial_expired' && (
        <Card className="mt-8 max-w-2xl mx-auto border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Trial Expired</h3>
              <p className="text-muted-foreground mb-4">
                Your free trial has ended. To continue using all features, please upgrade to our Business plan.
              </p>
              <Button onClick={() => setShowBusinessDialog(true)}>
                Upgrade Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <BusinessPlanDialog 
        open={showBusinessDialog}
        onOpenChange={setShowBusinessDialog}
      />
    </div>
  );
};