-- Optimize daily earnings queries with indexes
-- This migration adds indexes to improve the performance of daily earnings calculations

-- Add index on profiles table for active users with plan_start_date
CREATE INDEX IF NOT EXISTS idx_profiles_active_with_plan 
ON profiles(status, plan_start_date) 
WHERE status = 'active' AND plan_start_date IS NOT NULL;

-- Add index on earnings_history for checking daily earnings
CREATE INDEX IF NOT EXISTS idx_earnings_history_daily_check 
ON earnings_history(user_id, type, created_at) 
WHERE type = 'daily_earnings';

-- Add composite index for efficient date range queries
CREATE INDEX IF NOT EXISTS idx_earnings_history_date_range 
ON earnings_history(created_at, user_id, type);

-- Add index for user earnings lookup
CREATE INDEX IF NOT EXISTS idx_earnings_history_user_lookup 
ON earnings_history(user_id, created_at DESC);

-- Create a function to check if user already received earnings today
CREATE OR REPLACE FUNCTION has_received_earnings_today(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM earnings_history 
    WHERE user_id = p_user_id 
    AND type = 'daily_earnings'
    AND DATE(created_at) = CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql;

-- Create a view for daily earnings summary
CREATE OR REPLACE VIEW daily_earnings_summary AS
SELECT 
  DATE(created_at) as earnings_date,
  COUNT(DISTINCT user_id) as users_processed,
  SUM(amount) as total_distributed,
  MIN(created_at) as first_processed_at,
  MAX(created_at) as last_processed_at
FROM earnings_history
WHERE type = 'daily_earnings'
GROUP BY DATE(created_at)
ORDER BY earnings_date DESC;

-- Add comment to explain the indexes
COMMENT ON INDEX idx_profiles_active_with_plan IS 'Optimizes fetching active users eligible for daily earnings';
COMMENT ON INDEX idx_earnings_history_daily_check IS 'Optimizes checking if user already received earnings today';
COMMENT ON FUNCTION has_received_earnings_today IS 'Helper function to check if user already received daily earnings';
