# Comprehensive Guide: Manual Setup of Loyalty System

## Overview
This guide provides step-by-step instructions for manually setting up the loyalty system when Docker is not available or compatible with your system.

## Prerequisites
1. Access to the Supabase dashboard for project `sdxfgugmdrmdjwhagjfa`
2. SQL editor access in the Supabase dashboard
3. Basic understanding of SQL commands

## Part 1: Database Setup

### Step 1: Apply Database Migration
1. Go to the Supabase dashboard: https://supabase.com/dashboard/project/sdxfgugmdrmdjwhagjfa
2. Navigate to the SQL Editor
3. Copy the contents of `SIMPLE_LOYALTY_MIGRATION.sql` and paste it into the SQL editor
4. Run the query

### Step 2: Verify Database Tables
After running the migration, verify that the following tables were created:

#### Table: app_users (modified)
Should now have these additional columns:
- `total_confirmed_visits` (INTEGER, DEFAULT 0)
- `redeemable_points` (INTEGER, DEFAULT 0)
- `status_tier` (TEXT, DEFAULT 'Silver')

#### Table: loyalty_settings
Should exist with these columns:
- `id` (TEXT, PRIMARY KEY, DEFAULT 'default')
- `service_rate_silver` (DECIMAL(10,2), DEFAULT 5.00)
- `service_rate_gold` (DECIMAL(10,2), DEFAULT 10.00)
- `service_rate_platinum` (DECIMAL(10,2), DEFAULT 15.00)
- `silver_threshold` (INTEGER, DEFAULT 100)
- `gold_threshold` (INTEGER, DEFAULT 200)
- `platinum_threshold` (INTEGER, DEFAULT 9999)
- `late_cancellation_penalty` (INTEGER, DEFAULT 500)
- `no_show_penalty` (INTEGER, DEFAULT 1000)

#### Table: loyalty_transactions
Should exist with these columns:
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `user_id` (UUID, REFERENCES app_users(id) ON DELETE CASCADE)
- `transaction_type` (TEXT, NOT NULL) - Values: 'EARNED', 'PENALTY', 'REDEEMED'
- `points_amount` (INTEGER, NOT NULL)
- `description` (TEXT)
- `booking_id` (UUID, REFERENCES bookings(id) ON DELETE SET NULL)
- `created_at` (TIMESTAMP, DEFAULT NOW())

## Part 2: Edge Functions Verification

### Step 1: Check Function Deployment
1. In the Supabase dashboard, go to Functions
2. Verify that these 6 functions exist and are deployed:
   - `get-loyalty-stats`
   - `get-loyalty-history`
   - `update-loyalty-settings`
   - `process-loyalty-transaction`
   - `process-penalty-transaction`
   - `check-loyalty-tier-update`

### Step 2: Test Functions Manually
You can test each function by clicking on it and using the "Test Function" feature in the Supabase dashboard.

## Part 3: Frontend Integration Testing

### Step 1: Start Development Server
```bash
npm run dev
```

### Step 2: Test Profile Page
1. Navigate to http://localhost:3000/#/profile
2. Log in as a user
3. Verify that real loyalty data is displayed instead of mock data

### Step 3: Test Admin Pages
1. Log in as an admin user
2. Navigate to the Admin Dashboard
3. Test the Loyalty Settings page
4. Test the Loyalty Dashboard component

## Part 4: Troubleshooting Common Issues

### Issue 1: API Calls Fail with 404 Errors
**Solution:**
1. Check that all Edge Functions are deployed correctly
2. Verify function names match exactly
3. Check the Supabase project URL in `supabaseClient.ts`

### Issue 2: Database Queries Fail
**Solution:**
1. Verify that the migration was applied successfully
2. Check that all tables and columns exist
3. Verify that the user has proper permissions

### Issue 3: Authentication Failures
**Solution:**
1. Ensure that the user is properly logged in
2. Check that the JWT token is being sent with API requests
3. Verify that the user has the correct role for the requested operation

### Issue 4: CORS Errors
**Solution:**
1. Check that the Edge Functions have proper CORS headers
2. Verify that the frontend and backend URLs are correctly configured

## Part 5: Testing the Complete Workflow

### Test Case 1: User Views Loyalty Stats
1. Log in as a regular user
2. Navigate to Profile page
3. Verify that loyalty stats are displayed correctly

### Test Case 2: User Views Transaction History
1. Log in as a regular user
2. Navigate to Loyalty History page
3. Verify that transaction history is displayed

### Test Case 3: Admin Configures Loyalty Settings
1. Log in as an admin user
2. Navigate to Admin Loyalty Settings
3. Modify loyalty settings
4. Verify changes are saved

### Test Case 4: Points Are Awarded for Bookings
1. Complete a booking as a user
2. Trigger the loyalty transaction processing
3. Verify points are awarded based on booking amount and user tier

### Test Case 5: Penalties Are Applied
1. As an admin, apply a penalty to a user
2. Verify points are deducted from user's balance
3. Verify transaction is recorded in history

### Test Case 6: Tier Upgrades Work
1. Simulate enough visits for a tier upgrade
2. Verify user's tier is upgraded
3. Verify new multiplier is applied to future bookings

## Part 6: Production Deployment Checklist

### Before Deployment
- [ ] Verify all database migrations are applied
- [ ] Confirm all Edge Functions are deployed
- [ ] Test all API endpoints
- [ ] Verify frontend components work correctly
- [ ] Test with different user roles
- [ ] Check error handling and edge cases

### After Deployment
- [ ] Monitor function logs for errors
- [ ] Verify database performance
- [ ] Test with real users
- [ ] Document any issues encountered

## Additional Resources

### Supabase Documentation
- Edge Functions: https://supabase.com/docs/guides/functions
- Database: https://supabase.com/docs/guides/database
- Authentication: https://supabase.com/docs/guides/auth

### Project-Specific Documentation
- Loyalty System Docs: `LOYALTY_SYSTEM_DOCS.md`
- API Documentation: Check inline comments in `api.ts`
- Component Documentation: Check inline comments in React components

## Support
If you encounter issues that aren't covered in this guide:
1. Check the project documentation files
2. Review the code comments
3. Consult the Supabase documentation
4. Reach out to the development team