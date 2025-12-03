# Manual Installation Instructions for Loyalty System

## Prerequisites
1. Access to the Supabase dashboard for project `sdxfgugmdrmdjwhagjfa`
2. SQL editor access in the Supabase dashboard

## Steps to Install the Loyalty System

### Step 1: Apply Database Migration
1. Go to the Supabase dashboard: https://supabase.com/dashboard/project/sdxfgugmdrmdjwhagjfa
2. Navigate to the SQL Editor
3. Copy the contents of `SIMPLE_LOYALTY_MIGRATION.sql` and paste it into the SQL editor
4. Run the query

### Step 2: Verify Database Tables
After running the migration, verify that the following tables were created:
1. `app_users` should have new columns:
   - `total_confirmed_visits`
   - `redeemable_points`
   - `status_tier`
2. `loyalty_settings` table should exist with default values
3. `loyalty_transactions` table should exist

### Step 3: Test Edge Functions
The Edge Functions should already be deployed. Test them by:
1. Going to the Functions section in the Supabase dashboard
2. Verifying that the following functions exist:
   - `get-loyalty-stats`
   - `get-loyalty-history`
   - `update-loyalty-settings`
   - `process-loyalty-transaction`
   - `process-penalty-transaction`
   - `check-loyalty-tier-update`

### Step 4: Test Frontend Integration
1. Start the development server: `npm run dev`
2. Navigate to the Profile page
3. Verify that real loyalty data is displayed instead of mock data
4. Test the Admin Loyalty Settings page
5. Test the Loyalty History page

## Troubleshooting

### If API calls fail with 404 errors:
1. Check that all Edge Functions are deployed correctly
2. Verify function names match exactly
3. Check the Supabase project URL in the API calls

### If database queries fail:
1. Verify that the migration was applied successfully
2. Check that all tables and columns exist
3. Verify that the user has proper permissions

### If authentication fails:
1. Ensure that the user is properly logged in
2. Check that the JWT token is being sent with API requests
3. Verify that the user has the correct role for the requested operation

## Next Steps
Once the loyalty system is working:
1. Test all loyalty features with different user roles
2. Verify that points are correctly calculated and awarded
3. Test tier upgrades based on visit counts
4. Verify that penalties are correctly applied
5. Test admin configuration of loyalty settings