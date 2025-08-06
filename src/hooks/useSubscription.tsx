import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type SubscriptionStatus = 'trial_active' | 'trial_expired' | 'business_approved' | 'business_pending' | 'business_rejected';

export interface UserSubscription {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  trial_start_date: string;
  trial_end_date: string;
  business_approved_date?: string;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState<number>(0);

  const fetchSubscription = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching subscription:', error);
        toast({
          title: "Error",
          description: "Failed to load subscription status",
          variant: "destructive",
        });
      } else {
        setSubscription(data);
        
        // Calculate days remaining for trial
        if (data.status === 'trial_active') {
          const trialEnd = new Date(data.trial_end_date);
          const now = new Date();
          const timeDiff = trialEnd.getTime() - now.getTime();
          const daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
          setDaysRemaining(daysLeft);

          // Update status if trial has expired
          if (daysLeft <= 0 && data.status === 'trial_active') {
            await updateSubscriptionStatus('trial_expired');
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionStatus = async (newStatus: SubscriptionStatus) => {
    if (!user || !subscription) return;

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: newStatus,
          ...(newStatus === 'business_approved' && { business_approved_date: new Date().toISOString() })
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating subscription status:', error);
        toast({
          title: "Error",
          description: "Failed to update subscription status",
          variant: "destructive",
        });
      } else {
        await fetchSubscription();
        toast({
          title: "Success",
          description: "Subscription status updated",
        });
      }
    } catch (error) {
      console.error('Error in updateSubscriptionStatus:', error);
    }
  };

  const startFreeTrial = async () => {
    if (!user) return;

    try {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30);

      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          status: 'trial_active',
          trial_start_date: new Date().toISOString(),
          trial_end_date: trialEndDate.toISOString(),
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error starting free trial:', error);
        toast({
          title: "Error",
          description: "Failed to start free trial",
          variant: "destructive",
        });
      } else {
        await fetchSubscription();
        toast({
          title: "Free Trial Started!",
          description: "You now have 30 days of full access to all features",
        });
      }
    } catch (error) {
      console.error('Error in startFreeTrial:', error);
    }
  };

  const submitBusinessPlanRequest = async (requestData: {
    name: string;
    organization: string;
    email: string;
    phone?: string;
    use_case: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('business_plan_requests')
        .insert({
          user_id: user.id,
          ...requestData,
        });

      if (error) {
        console.error('Error submitting business plan request:', error);
        toast({
          title: "Error",
          description: "Failed to submit request",
          variant: "destructive",
        });
        return false;
      } else {
        // Update subscription status to business_pending
        await updateSubscriptionStatus('business_pending');
        toast({
          title: "Request Submitted!",
          description: "We'll review your request and get back to you soon",
        });
        return true;
      }
    } catch (error) {
      console.error('Error in submitBusinessPlanRequest:', error);
      return false;
    }
  };

  const hasAccess = () => {
    if (!subscription) return false;
    return subscription.status === 'trial_active' || subscription.status === 'business_approved';
  };

  const isTrialExpiring = () => {
    return subscription?.status === 'trial_active' && daysRemaining <= 5;
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  return {
    subscription,
    loading,
    daysRemaining,
    fetchSubscription,
    updateSubscriptionStatus,
    startFreeTrial,
    submitBusinessPlanRequest,
    hasAccess,
    isTrialExpiring,
  };
};