/**
 * Test script for daily earnings automation
 * Run with: node scripts/test-daily-earnings.js
 */

require('dotenv').config();

async function testDailyEarnings() {
  const apiUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com/api/daily-earnings'
    : 'http://localhost:3000/api/daily-earnings';
    
  const cronSecret = process.env.CRON_SECRET || 'test-secret';
  
  console.log('🧪 Testing daily earnings endpoint...');
  console.log(`📍 API URL: ${apiUrl}`);
  console.log(`🔑 Using CRON_SECRET: ${cronSecret ? 'Set' : 'Not set'}`);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!', data);
    } else {
      console.error('❌ Error:', data);
    }
  } catch (error) {
    console.error('💥 Request failed:', error.message);
  }
}

// Run the test
testDailyEarnings();
