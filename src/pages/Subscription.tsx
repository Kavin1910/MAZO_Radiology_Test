import React from 'react';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { AppHeader } from '@/components/AppHeader';

const Subscription = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <SubscriptionPlans />
    </div>
  );
};

export default Subscription;