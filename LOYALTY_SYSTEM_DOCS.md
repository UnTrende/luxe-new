# LuxeCut Loyalty System Documentation

## Overview
The LuxeCut Loyalty System is a tier-based rewards program that incentivizes customer engagement through points earned on service bookings. Customers progress through three tiers (Silver, Gold, Platinum) based on their visit count, with each tier offering increased point multipliers.

## System Components

### Database Schema
- **app_users table**: Extended with loyalty fields
  - `total_confirmed_visits`: Number of completed bookings
  - `redeemable_points`: Current point balance
  - `status_tier`: Current tier level (Silver/Gold/Platinum)
  
- **loyalty_settings table**: Admin-configurable program parameters
  - Multipliers for each tier (points per dollar spent)
  - Tier thresholds (visit counts for tier upgrades)
  - Penalty values for violations

- **loyalty_transactions table**: Audit trail of all point transactions
  - Tracks earned points, penalties, and tier upgrades
  - Links transactions to specific bookings when applicable

### Edge Functions
1. **get-loyalty-stats**: Returns current user's loyalty status
2. **get-loyalty-history**: Retrieves user's transaction history
3. **update-loyalty-settings**: Admin function to modify program parameters
4. **process-loyalty-transaction**: Awards points when bookings are completed
5. **process-penalty-transaction**: Applies penalties for violations
6. **check-loyalty-tier-update**: Verifies and updates user tier status

### Frontend Components
- **ProfilePage**: Displays loyalty stats and progress
- **LoyaltyHistoryPage**: Shows detailed transaction history
- **AdminLoyaltySettingsPage**: Configuration interface for admins
- **AdminLoyaltyDashboard**: Overview dashboard in admin panel

## Program Mechanics

### Earning Points
- Points are awarded when bookings are marked as "completed"
- Calculation: `Points = Booking Amount × Tier Multiplier`
- Silver tier: 5 points per dollar
- Gold tier: 10 points per dollar
- Platinum tier: 15 points per dollar

### Tier Progression
- **Silver**: Default starting tier for all customers
- **Gold**: Achieved after 100 confirmed visits
- **Platinum**: Achieved after 200 confirmed visits
- Tiers are permanent - customers never downgrade

### Penalty System
- **Late Cancellation** (<4 hours notice): -500 points
- **No-Show** (Failure to attend): -1000 points
- Minimum point balance is 0 (no negative balances)

## Integration Points

### Booking Completion Workflow
1. Barber marks booking as "completed" in their dashboard
2. System calculates booking amount
3. `processLoyaltyTransaction` is called with booking ID and amount
4. Points are awarded based on current tier
5. Visit count is incremented
6. Tier status is checked and updated if needed

### Violation Processing
1. Admin identifies late cancellation or no-show
2. `processPenaltyTransaction` is called with user ID and violation type
3. Points are deducted from user's balance
4. Transaction is recorded in history

## Admin Configuration
Admins can modify all program parameters through the Loyalty Settings page:
- Point multipliers for each tier
- Visit thresholds for tier upgrades
- Penalty values for violations

## Customer Experience
Customers can view their loyalty status and history through:
- Profile page showing current tier and progress
- Dedicated history page with detailed transaction log
- Visual progress indicator toward next tier

## Security
- All loyalty functions require proper authentication
- Admin functions require admin-level permissions
- Row Level Security policies protect user data
- All transactions are audited in the history table