// Test script to verify loyalty system functionality
// This script can be run in the browser console or as a test file

import { api } from '../../../services/api';

async function testLoyaltySystem() {
  console.log('🧪 Testing Loyalty System...');
  
  try {
    // Test 1: Get loyalty stats
    console.log('1. Fetching loyalty stats...');
    const stats = await api.getLoyaltyStats();
    console.log('✅ Loyalty stats:', stats);
    
    // Test 2: Get loyalty history
    console.log('2. Fetching loyalty history...');
    const history = await api.getLoyaltyHistory(10, 0);
    console.log('✅ Loyalty history:', history);
    
    // Test 3: Admin - Update loyalty settings
    console.log('3. Updating loyalty settings...');
    const updatedSettings = await api.updateLoyaltySettings({
      service_rate_silver: 5.0,
      service_rate_gold: 10.0,
      service_rate_platinum: 15.0
    });
    console.log('✅ Updated settings:', updatedSettings);
    
    console.log('🎉 All loyalty system tests passed!');
    
  } catch (error) {
    console.error('❌ Loyalty system test failed:', error);
  }
}

// Run the test
// testLoyaltySystem();

export { testLoyaltySystem };