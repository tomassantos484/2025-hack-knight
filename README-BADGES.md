# Badge and Buds System

This document explains the badge and buds system in the EcoTracker application, including how to set it up and how it works.

## Overview

The badge and buds system rewards users for eco-friendly actions. Users earn buds (points) for logging eco actions and can earn badges for achieving specific milestones. Buds can be spent on rewards like merchandise or donations.

## Database Setup

To set up the badge and buds system, run the following SQL scripts in the Supabase SQL editor:

1. `create_badge_tables.sql` - Creates the badges and user_badges tables
2. `create_user_stats_table.sql` - Creates the user_stats table for tracking buds and other statistics
3. `create_transactions_table.sql` - Creates the transactions table and buds management functions
4. `create_increment_function.sql` - Creates helper functions for incrementing values

## Tables

### Badges Table

Stores information about available badges:

- `id` - Unique identifier
- `name` - Badge name
- `description` - Badge description
- `icon` - Emoji or icon for the badge
- `category` - Badge category (e.g., waste, transportation)
- `buds_reward` - Number of buds awarded for earning the badge
- `requirements` - Description of requirements to earn the badge

### User Badges Table

Tracks which badges each user has earned:

- `id` - Unique identifier
- `user_id` - User who earned the badge
- `badge_id` - Badge that was earned
- `earned_at` - When the badge was earned

### User Stats Table

Tracks user statistics:

- `user_id` - User identifier
- `total_actions_completed` - Number of eco actions completed
- `buds_earned` - Current buds balance
- `total_carbon_footprint` - Total CO2 saved
- `streak_days` - Current streak of consecutive days with actions
- `last_action_date` - Date of the last action

### Transactions Table

Tracks buds earned and spent:

- `user_id` - User identifier
- `type` - 'earned' or 'spent'
- `amount` - Number of buds
- `description` - Description of the transaction
- `created_at` - When the transaction occurred

## Badge Types

The system includes the following default badges:

1. **Early Adopter** - Awarded automatically to new users (100 buds)
2. **Waste Warrior** - Awarded for recycling 50+ items (200 buds)
3. **Eco Streak** - Awarded for maintaining a 7-day action streak (150 buds)
4. **Transit Champion** - Awarded for using public transit 10+ times (150 buds)
5. **Plant Power** - Awarded for logging 15 meatless meals (150 buds)
6. **Energy Saver** - Awarded for reducing energy usage for 30 days (200 buds)

## How Badges Are Awarded

Badges are awarded in several ways:

1. **Automatic** - The Early Adopter badge is awarded automatically when a user joins
2. **Action-based** - Badges like Waste Warrior and Transit Champion are awarded based on the number of actions in a category
3. **Streak-based** - The Eco Streak badge is awarded for logging actions on 7 consecutive days
4. **Time-based** - The Energy Saver badge is awarded for logging energy actions on 30 different days

The `checkAndAwardBadges` function in `badgeService.ts` checks for badge eligibility whenever a user logs an action.

## Buds Management

Buds are earned in several ways:

1. **Logging actions** - Each eco action has a buds reward
2. **Earning badges** - Each badge has a buds reward
3. **Scanning receipts** - Users earn buds for scanning eco-friendly receipts

Buds can be spent on:

1. **Merchandise** - Physical eco-friendly products
2. **Donations** - Contributions to environmental causes

## Components

The badge and buds system is implemented in the following components:

1. **EcoWallet** - Displays buds balance, transaction history, and redemption options
2. **Profile** - Displays earned badges and user statistics
3. **Actions** - Allows users to log eco actions and earn buds

## Services

The system uses the following services:

1. **badgeService.ts** - Manages badges, including checking eligibility and awarding badges
2. **walletService.ts** - Manages buds, including earning, spending, and transaction history
3. **ecoActionsService.ts** - Manages eco actions, including logging actions and updating user stats

## Notifications

When a user earns a badge, they receive a toast notification showing:

1. The badge name
2. The badge description
3. The buds reward (if applicable)

## Troubleshooting

If badges or buds are not working correctly:

1. Check the browser console for errors
2. Verify that the database tables are set up correctly
3. Ensure that the user has a record in the user_stats table
4. Check that the badge requirements are being met

## Future Improvements

Potential improvements to the badge and buds system:

1. Add more badge types for different eco actions
2. Implement tiered badges (bronze, silver, gold)
3. Add social sharing for earned badges
4. Create limited-time badges for special events
5. Implement a leaderboard for users with the most buds or badges 