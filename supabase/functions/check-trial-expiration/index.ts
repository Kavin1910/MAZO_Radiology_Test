import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role key for administrative access
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    console.log("Starting trial expiration check...");

    // Get all active trials that will expire in 5 days or less
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

    const { data: expiringTrials, error: trialsError } = await supabaseClient
      .from('user_subscriptions')
      .select(`
        *,
        profiles!inner(first_name, last_name)
      `)
      .eq('status', 'trial_active')
      .lte('trial_end_date', fiveDaysFromNow.toISOString());

    if (trialsError) {
      console.error('Error fetching expiring trials:', trialsError);
      throw trialsError;
    }

    console.log(`Found ${expiringTrials?.length || 0} expiring trials`);

    // Check for expired trials that need status update
    const now = new Date();
    const { data: expiredTrials, error: expiredError } = await supabaseClient
      .from('user_subscriptions')
      .select('*')
      .eq('status', 'trial_active')
      .lt('trial_end_date', now.toISOString());

    if (expiredError) {
      console.error('Error fetching expired trials:', expiredError);
      throw expiredError;
    }

    console.log(`Found ${expiredTrials?.length || 0} expired trials to update`);

    // Update expired trials
    if (expiredTrials && expiredTrials.length > 0) {
      const { error: updateError } = await supabaseClient
        .from('user_subscriptions')
        .update({ status: 'trial_expired' })
        .in('id', expiredTrials.map(trial => trial.id));

      if (updateError) {
        console.error('Error updating expired trials:', updateError);
        throw updateError;
      }

      console.log(`Updated ${expiredTrials.length} expired trials`);
    }

    // Calculate days remaining for expiring trials
    const notifications = expiringTrials?.map(trial => {
      const trialEnd = new Date(trial.trial_end_date);
      const timeDiff = trialEnd.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));

      return {
        user_id: trial.user_id,
        name: trial.profiles?.first_name || 'User',
        days_remaining: daysRemaining,
        trial_end_date: trial.trial_end_date,
      };
    }) || [];

    // Filter for trials expiring in exactly 5 days, 3 days, and 1 day
    const criticalNotifications = notifications.filter(n => 
      n.days_remaining === 5 || n.days_remaining === 3 || n.days_remaining === 1
    );

    console.log(`Sending ${criticalNotifications.length} critical notifications`);

    // In a real implementation, you would send emails or push notifications here
    // For now, we'll just log the notifications that would be sent
    criticalNotifications.forEach(notification => {
      console.log(`NOTIFICATION: User ${notification.name} (${notification.user_id}) has ${notification.days_remaining} days remaining`);
      
      // Here you would integrate with your email service (Resend, SendGrid, etc.)
      // or push notification service to send actual notifications
    });

    return new Response(JSON.stringify({
      success: true,
      expiring_trials: expiringTrials?.length || 0,
      expired_trials_updated: expiredTrials?.length || 0,
      notifications_sent: criticalNotifications.length,
      notifications: criticalNotifications
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('Error in check-trial-expiration function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});