import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const planDetails: { [key: string]: { dailyReturn: number; validityDays: number } } = {
  '0': { dailyReturn: 20, validityDays: 365 },   // Free Plan - 1 year validity
  '1': { dailyReturn: 120, validityDays: 30 },  // Starter Plan - 30 days
  '2': { dailyReturn: 260, validityDays: 60 },  // Advanced Plan - 60 days
  '3': { dailyReturn: 560, validityDays: 90 },  // Pro Plan - 90 days
};

export async function POST(request: NextRequest) {
  try {
    // Verify the request is authorized (you can add API key check here)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.CRON_SECRET || 'your-secret-key';
    
    if (authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 Starting daily earnings process...');
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Processing for date: ${today}`);

    // 1. Fetch all active user profiles with their plan and plan_start_date
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, balance, daily_earnings, selected_plan, plan_start_date')
      .eq('status', 'active');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      console.log('ℹ️ No active users to process.');
      return NextResponse.json({ 
        message: 'No active users to process.',
        processed: 0,
        expired: 0
      });
    }

    console.log(`👥 Found ${profiles.length} active users`);

    // 2. Check for users who already received earnings today
    const { data: existingEarnings, error: earningsError } = await supabaseAdmin
      .from('earnings_history')
      .select('user_id')
      .eq('type', 'daily_earnings')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    if (earningsError) {
      console.error('❌ Error checking existing earnings:', earningsError);
      throw earningsError;
    }

    const processedUserIds = new Set(existingEarnings?.map(e => e.user_id) || []);
    console.log(`🔍 ${processedUserIds.size} users already processed today`);

    const profileUpdates: any[] = [];
    const earningsHistoryEntries: any[] = [];
    let processedCount = 0;
    let expiredCount = 0;

    // 3. Process each user
    for (const profile of profiles) {
      // Skip if already processed today
      if (processedUserIds.has(profile.id)) {
        console.log(`⏭️ User ${profile.id} already processed today, skipping`);
        continue;
      }

      const plan = planDetails[profile.selected_plan];
      if (!plan) {
        console.warn(`⚠️ No plan details found for plan ID ${profile.selected_plan} on user ${profile.id}. Skipping.`);
        continue;
      }

      // Check plan validity
      if (profile.plan_start_date) {
        const planStartDate = new Date(profile.plan_start_date);
        const currentDate = new Date();
        const daysSinceStart = Math.floor((currentDate - planStartDate) / (1000 * 60 * 60 * 24));

        if (daysSinceStart >= plan.validityDays) {
          console.log(`⏰ User ${profile.id} plan expired (${daysSinceStart} days >= ${plan.validityDays} days). Marking as inactive.`);
          
          // Mark user as inactive
          profileUpdates.push({
            id: profile.id,
            status: 'inactive'
          });
          expiredCount++;
          continue;
        }
      }

      const dailyReturn = plan.dailyReturn;
      const newBalance = (profile.balance || 0) + dailyReturn;
      const newDailyEarnings = (profile.daily_earnings || 0) + dailyReturn;

      profileUpdates.push({
        id: profile.id,
        balance: newBalance,
        daily_earnings: newDailyEarnings,
      });

      // Create earnings history entry
      earningsHistoryEntries.push({
        user_id: profile.id,
        amount: dailyReturn,
        type: 'daily_earnings',
        description: `Daily earnings for Plan ${profile.selected_plan}`,
        created_at: new Date().toISOString()
      });

      processedCount++;
      console.log(`✅ User ${profile.id}: +${dailyReturn} PKR (Plan ${profile.selected_plan})`);
    }

    if (profileUpdates.length === 0) {
      console.log('ℹ️ No users to update.');
      return NextResponse.json({ 
        message: 'No users to update.',
        processed: 0,
        expired: expiredCount
      });
    }

    // 4. Bulk update profiles
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileUpdates, { onConflict: 'id' });

    if (updateError) {
      console.error('❌ Error updating profiles:', updateError);
      throw updateError;
    }

    // 5. Insert earnings history entries
    if (earningsHistoryEntries.length > 0) {
      const { error: historyError } = await supabaseAdmin
        .from('earnings_history')
        .insert(earningsHistoryEntries);

      if (historyError) {
        console.error('❌ Error inserting earnings history:', historyError);
        throw historyError;
      }
    }

    const successMessage = `Daily earnings process completed successfully! Processed: ${processedCount}, Expired: ${expiredCount}`;
    console.log(`🎉 ${successMessage}`);

    return NextResponse.json({
      message: successMessage,
      processed: processedCount,
      expired: expiredCount,
      totalUpdates: profileUpdates.length,
      historyEntries: earningsHistoryEntries.length
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('💥 Error in daily earnings process:', errorMessage);
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Allow GET requests for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Daily earnings endpoint is active. Use POST with proper authorization to trigger earnings.',
    timestamp: new Date().toISOString()
  });
}
