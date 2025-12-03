// Test script to verify loyalty system functionality
// This script can be run in the browser console or as a test file

async function testLoyaltySystem() {
  console.log('🧪 Testing Loyalty System...');
  
  try {
    // Get the Supabase URL and token from the running application
    const SUPABASE_URL = 'https://sdxfgugmdrmdjwhagjfa.supabase.co';
    // You'll need to get a valid token from the running application
    const TOKEN = 'YOUR_VALID_JWT_TOKEN_HERE';
    
    // Test 1: Get loyalty stats
    console.log('1. Fetching loyalty stats...');
    const statsResponse = await fetch(`${SUPABASE_URL}/functions/v1/get-loyalty-stats`, {
      method: 'POST',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeGZndWdtZHJtZGp3aGFnamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE3NTQ0MzUsImV4cCI6MjAxNzMzMDQzNX0.154JZb2w4r9fX4b3b1b1b1b1b1b1b1b1b1b1b1b1b1b',
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Loyalty stats:', stats);
    } else {
      console.log('❌ Failed to fetch loyalty stats:', statsResponse.status, await statsResponse.text());
    }
    
    // Test 2: Get loyalty history
    console.log('2. Fetching loyalty history...');
    const historyResponse = await fetch(`${SUPABASE_URL}/functions/v1/get-loyalty-history?limit=10&offset=0`, {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkeGZndWdtZHJtZGp3aGFnamZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE3NTQ0MzUsImV4cCI6MjAxNzMzMDQzNX0.154JZb2w4r9fX4b3b1b1b1b1b1b1b1b1b1b1b1b1b1b',
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (historyResponse.ok) {
      const history = await historyResponse.json();
      console.log('✅ Loyalty history:', history);
    } else {
      console.log('❌ Failed to fetch loyalty history:', historyResponse.status, await historyResponse.text());
    }
    
    console.log('🎉 Loyalty system test completed!');
    
  } catch (error) {
    console.error('💥 Error testing loyalty system:', error);
  }
}

// Run the test
testLoyaltySystem();