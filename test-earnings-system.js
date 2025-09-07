/**
 * Comprehensive test script for the daily earnings system
 * This script tests both the API endpoint and Supabase functionality
 * 
 * Usage: node test-earnings-system.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const color = type === 'success' ? colors.green : 
                type === 'error' ? colors.red : 
                type === 'warning' ? colors.yellow :
                colors.cyan;
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

async function testSupabaseConnection() {
  log('Testing Supabase connection...', 'info');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    log('✅ Supabase connection successful', 'success');
    return true;
  } catch (error) {
    log(`❌ Supabase connection failed: ${error.message}`, 'error');
    return false;
  }
}

async function getActiveUsersCount() {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    log(`Error counting active users: ${error.message}`, 'error');
    return 0;
  }
}

async function getEarningsToday() {
  const today = new Date().toISOString().split('T')[0];
  try {
    const { data, error } = await supabase
      .from('earnings_history')
      .select('user_id, amount')
      .eq('type', 'daily_earnings')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);
    
    if (error) throw error;
    return {
      count: data.length,
      total: data.reduce((sum, item) => sum + item.amount, 0)
    };
  } catch (error) {
    log(`Error fetching today's earnings: ${error.message}`, 'error');
    return { count: 0, total: 0 };
  }
}

async function testApiEndpoint() {
  const apiUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com/api/daily-earnings'
    : 'http://localhost:3000/api/daily-earnings';
    
  const cronSecret = process.env.CRON_SECRET || 'test-secret';
  
  log('Testing API endpoint...', 'info');
  log(`API URL: ${apiUrl}`, 'info');
  
  try {
    // First test GET request
    const getResponse = await fetch(apiUrl);
    if (getResponse.ok) {
      log('✅ GET request successful', 'success');
    }
    
    // Then test POST request
    log('Triggering daily earnings calculation...', 'info');
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      log('✅ Daily earnings processed successfully!', 'success');
      log(`Processed: ${data.processed} users`, 'info');
      log(`Expired: ${data.expired} users`, 'info');
      log(`Total updates: ${data.totalUpdates}`, 'info');
      log(`History entries: ${data.historyEntries}`, 'info');
      return true;
    } else {
      log(`❌ API Error: ${data.error}`, 'error');
      return false;
    }
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, 'error');
    return false;
  }
}

async function generateReport() {
  log('\\n=== DAILY EARNINGS SYSTEM REPORT ===\\n', 'info');
  
  // Test Supabase connection
  const supabaseOk = await testSupabaseConnection();
  if (!supabaseOk) {
    log('Cannot continue without Supabase connection', 'error');
    return;
  }
  
  // Get current state
  const activeUsers = await getActiveUsersCount();
  log(`Active users eligible for earnings: ${activeUsers}`, 'info');
  
  const todayEarnings = await getEarningsToday();
  log(`Earnings distributed today: ${todayEarnings.count} users, PKR ${todayEarnings.total}`, 'info');
  
  // Test API
  if (activeUsers > todayEarnings.count) {
    log(`${activeUsers - todayEarnings.count} users haven't received earnings yet today`, 'warning');
    
    const shouldTrigger = process.argv.includes('--trigger');
    if (shouldTrigger) {
      log('\\nTriggering daily earnings...', 'info');
      await testApiEndpoint();
    } else {
      log('\\nTo trigger earnings, run: node test-earnings-system.js --trigger', 'info');
    }
  } else {
    log('All active users have received earnings today! ✨', 'success');
  }
  
  // Summary
  log('\\n=== CONFIGURATION CHECK ===\\n', 'info');
  log(`SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`, 
    process.env.NEXT_PUBLIC_SUPABASE_URL ? 'success' : 'error');
  log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`, 
    process.env.SUPABASE_SERVICE_ROLE_KEY ? 'success' : 'error');
  log(`CRON_SECRET: ${process.env.CRON_SECRET ? '✅ Set' : '❌ Missing'}`, 
    process.env.CRON_SECRET ? 'success' : 'error');
  
  log('\\n=== END REPORT ===\\n', 'info');
}

// Run the test
generateReport().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
