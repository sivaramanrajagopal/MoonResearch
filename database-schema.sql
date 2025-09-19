-- Supabase SQL Schema for Astrology Research App

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    sleep_duration DECIMAL(3,1), -- Hours of sleep (e.g., 7.5)
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10), -- 1-10 scale
    disturbances BOOLEAN DEFAULT FALSE, -- True if sleep was disturbed
    notes TEXT,
    planetary_data_id UUID, -- Reference to daily_planets table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(date);
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, date);

-- Enable Row Level Security on journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for journal_entries
CREATE POLICY "Users can view their own journal entries" ON journal_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries" ON journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries" ON journal_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries" ON journal_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_journal_entries_updated_at 
    BEFORE UPDATE ON journal_entries 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Create a view for easier querying of journal entries with planetary data
CREATE OR REPLACE VIEW journal_entries_with_planets AS
SELECT 
    je.*,
    dp.planetary_data,
    dp.last_updated as planetary_data_updated
FROM journal_entries je
LEFT JOIN daily_planets dp ON je.date = dp.date::date;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON journal_entries TO authenticated;
GRANT SELECT ON journal_entries_with_planets TO authenticated;
GRANT SELECT ON daily_planets TO authenticated;
