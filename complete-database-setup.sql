-- Complete Database Setup for Astrology Research App
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Create the view for your existing daily_gochar table
CREATE OR REPLACE VIEW daily_planets AS 
SELECT 
    id,
    date,
    planetary_data,
    last_updated
FROM daily_gochar;

-- Grant permissions to authenticated users
GRANT SELECT ON daily_planets TO authenticated;

-- Step 2: Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    sleep_duration DECIMAL(3,1),
    mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
    disturbances BOOLEAN DEFAULT FALSE,
    notes TEXT,
    planetary_data_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, date);

-- Enable Row Level Security on journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can insert their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can update their own journal entries" ON journal_entries;
DROP POLICY IF EXISTS "Users can delete their own journal entries" ON journal_entries;

-- Create policies for journal_entries
CREATE POLICY "Users can view their own journal entries" ON journal_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own journal entries" ON journal_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries" ON journal_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries" ON journal_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Create a view for easier querying of journal entries with planetary data
CREATE OR REPLACE VIEW journal_entries_with_planets AS
SELECT 
    je.*,
    dp.planetary_data,
    dp.last_updated as planetary_data_updated
FROM journal_entries je
LEFT JOIN daily_planets dp ON je.date = dp.date;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON journal_entries TO authenticated;
GRANT SELECT ON journal_entries_with_planets TO authenticated;

-- Step 3: Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    birth_rasi VARCHAR(50) NOT NULL,
    birth_nakshatra VARCHAR(50) NOT NULL,
    birth_date DATE,
    birth_time TIME,
    birth_place VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable Row Level Security on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_journal_entries_updated_at ON journal_entries;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_journal_entries_updated_at 
    BEFORE UPDATE ON journal_entries 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_user_profiles_updated_at();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;

-- Step 4: Create admin view for user management
CREATE OR REPLACE VIEW admin_user_overview AS
SELECT 
    u.id as user_id,
    u.email,
    u.created_at as registered_at,
    u.last_sign_in_at,
    up.birth_rasi,
    up.birth_nakshatra,
    up.birth_date,
    COUNT(je.id) as total_entries,
    MAX(je.created_at) as last_entry_date,
    AVG(je.mood_score) as avg_mood,
    AVG(je.sleep_duration) as avg_sleep
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN journal_entries je ON u.id = je.user_id
GROUP BY u.id, u.email, u.created_at, u.last_sign_in_at, up.birth_rasi, up.birth_nakshatra, up.birth_date
ORDER BY u.created_at DESC;

-- Final verification
SELECT 'Setup Complete!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('journal_entries', 'user_profiles');
SELECT table_name, table_type FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daily_planets';
