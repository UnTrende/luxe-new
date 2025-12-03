-- Migration: Add loyalty_points column to services table
-- Description: Adds ability to set fixed loyalty points per service

-- Add loyalty_points column to services table
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;

-- Update existing services to have 0 loyalty points (can be updated by admin later)
UPDATE services 
SET loyalty_points = 0 
WHERE loyalty_points IS NULL;
