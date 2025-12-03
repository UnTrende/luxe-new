#!/bin/bash

# LuxeCut Loyalty System Database Migration Script
# This script applies the loyalty system database changes to your Supabase instance

echo "🚀 Starting LuxeCut Loyalty System Database Migration..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in the correct directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📋 Applying loyalty system migration..."

# Apply the migration
supabase migration up

if [ $? -eq 0 ]; then
    echo "✅ Loyalty system migration applied successfully!"
    echo "📊 Summary of changes:"
    echo "   - Added loyalty columns to app_users table"
    echo "   - Created loyalty_settings table"
    echo "   - Created loyalty_transactions table"
    echo "   - Added indexes and RLS policies"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Deploy the new Edge Functions:"
    echo "      supabase functions deploy get-loyalty-stats"
    echo "      supabase functions deploy get-loyalty-history"
    echo "      supabase functions deploy update-loyalty-settings"
    echo "      supabase functions deploy process-loyalty-transaction"
    echo "      supabase functions deploy process-penalty-transaction"
    echo "      supabase functions deploy check-loyalty-tier-update"
    echo ""
    echo "   2. Restart your local development server"
    echo "   3. Test the loyalty system through the Profile page"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi