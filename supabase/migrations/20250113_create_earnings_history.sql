-- Create earnings_history table to track all user earnings
CREATE TABLE IF NOT EXISTS earnings_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'daily_earnings', -- 'daily_earnings', 'referral_bonus', 'investment_return'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_earnings_history_user_id ON earnings_history(user_id);
CREATE INDEX IF NOT EXISTS idx_earnings_history_created_at ON earnings_history(created_at);
CREATE INDEX IF NOT EXISTS idx_earnings_history_type ON earnings_history(type);

-- Add plan_start_date column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS plan_start_date TIMESTAMP WITH TIME ZONE;

-- Create RLS policies for earnings_history
ALTER TABLE earnings_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own earnings history
CREATE POLICY "Users can view own earnings history" ON earnings_history
    FOR SELECT USING (auth.uid() = user_id);

-- Only service role can insert earnings history (for the cron job)
CREATE POLICY "Service role can insert earnings history" ON earnings_history
    FOR INSERT WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT ON earnings_history TO authenticated;
GRANT ALL ON earnings_history TO service_role;
