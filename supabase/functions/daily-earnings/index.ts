
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const planDetails: { [key: string]: { dailyReturn: number; validityDays: number } } = {
  '0': { dailyReturn: 20, validityDays: 90 },   // Free Plan - 90 days
  '1': { dailyReturn: 120, validityDays: 80 },  // Starter Plan - 80 days
  '2': { dailyReturn: 260, validityDays: 75 },  // Advanced Plan - 75 days
  '3': { dailyReturn: 560, validityDays: 75 },  // Pro Plan - 75 days
};

// This function is triggered by a cron schedule at midnight (00:00 UTC)
Deno.serve(async (req) => {
  try {
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const currentDate = new Date();
    const currentTimestamp = currentDate.toISOString();
    
    console.log(`Starting daily earnings processing at ${currentTimestamp}`);

    // 1. Fetch all active user profiles with their plan and plan start date
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, balance, daily_earnings, selected_plan, plan_start_date, username')
      .eq('status', 'active')
      .not('plan_start_date', 'is', null); // Only users with a plan start date

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      console.log('No active users with valid plans to process.');
      return new Response(JSON.stringify({ message: 'No active users with valid plans to process.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const profileUpdates: any[] = [];
    const earningsHistoryRecords: any[] = [];
    const expiredUsers: string[] = [];
    let processedCount = 0;
    
    // 2. Process each user
    for (const profile of profiles) {
      const plan = planDetails[profile.selected_plan];
      if (!plan) {
        console.warn(`No plan details found for plan ID ${profile.selected_plan} for user ${profile.username || profile.id}. Skipping.`);
        continue;
      }
      
      // Calculate days since plan started
      const planStartDate = new Date(profile.plan_start_date);
      const daysSinceStart = Math.floor((currentDate.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if plan has expired
      if (daysSinceStart >= plan.validityDays) {
        console.log(`Plan expired for user ${profile.username || profile.id}. Days: ${daysSinceStart}/${plan.validityDays}`);
        expiredUsers.push(profile.id);
        continue;
      }
      
      // Check if user already received earnings today (prevent double processing)
      const todayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const { data: todayEarnings, error: earningsCheckError } = await supabaseAdmin
        .from('earnings_history')
        .select('id')
        .eq('user_id', profile.id)
        .gte('created_at', todayStart.toISOString())
        .limit(1);
      
      if (earningsCheckError) {
        console.error(`Error checking today's earnings for user ${profile.id}:`, earningsCheckError);
        continue;
      }
      
      if (todayEarnings && todayEarnings.length > 0) {
        console.log(`User ${profile.username || profile.id} already received earnings today. Skipping.`);
        continue;
      }
      
      const dailyReturn = plan.dailyReturn;
      const newBalance = (profile.balance || 0) + dailyReturn;
      const newDailyEarnings = (profile.daily_earnings || 0) + dailyReturn;

      // Prepare profile update
      profileUpdates.push({
        id: profile.id,
        balance: newBalance,
        daily_earnings: newDailyEarnings,
      });
      
      // Prepare earnings history record
      earningsHistoryRecords.push({
        user_id: profile.id,
        amount: dailyReturn,
        type: 'daily_earnings',
        description: `Daily earnings for ${profile.selected_plan === '0' ? 'Free' : profile.selected_plan === '1' ? 'Starter' : profile.selected_plan === '2' ? 'Advanced' : 'Pro'} Plan - Day ${daysSinceStart + 1}`,
        created_at: currentTimestamp,
      });
      
      processedCount++;
    }

    // 3. Handle expired users - set them to inactive
    if (expiredUsers.length > 0) {
      const { error: expiredUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({ status: 'inactive' })
        .in('id', expiredUsers);
      
      if (expiredUpdateError) {
        console.error('Error updating expired users:', expiredUpdateError);
      } else {
        console.log(`Set ${expiredUsers.length} users to inactive due to plan expiration.`);
      }
    }

    if (profileUpdates.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No users needed earnings processing today.',
        expiredUsers: expiredUsers.length,
        timestamp: currentTimestamp
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    // 4. Bulk update the profiles table
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileUpdates, { onConflict: 'id' });

    if (updateError) {
      console.error('Error updating profiles:', updateError);
      throw updateError;
    }
    
    // 5. Insert earnings history records
    const { error: historyError } = await supabaseAdmin
      .from('earnings_history')
      .insert(earningsHistoryRecords);
    
    if (historyError) {
      console.error('Error inserting earnings history:', historyError);
      // Don't throw here - profiles were already updated successfully
    }
    
    const successMessage = `Successfully processed daily earnings for ${processedCount} users. ${expiredUsers.length} users expired.`;
    console.log(successMessage);
    
    return new Response(JSON.stringify({ 
      message: successMessage,
      processedUsers: processedCount,
      expiredUsers: expiredUsers.length,
      timestamp: currentTimestamp
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('Error in daily earnings function:', errorMessage);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
