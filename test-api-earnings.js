// Simple test script to trigger the daily earnings API
const fetch = require('node-fetch');

async function testDailyEarnings() {
  try {
    console.log('🧪 Testing daily earnings API...');
    
    // First, test GET request to see if endpoint is accessible
    const getResponse = await fetch('http://localhost:3000/api/daily-earnings');
    const getResult = await getResponse.json();
    console.log('📡 GET Response:', getResult);
    
    // Then test POST request with authorization
    const postResponse = await fetch('http://localhost:3000/api/daily-earnings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-secret-key' // Default secret
      }
    });
    
    const postResult = await postResponse.json();
    console.log('📡 POST Response:', postResult);
    
    if (postResponse.ok) {
      console.log('✅ Daily earnings API test successful!');
    } else {
      console.log('❌ Daily earnings API test failed:', postResult);
    }
    
  } catch (error) {
    console.error('💥 Error testing API:', error.message);
  }
}

testDailyEarnings();
