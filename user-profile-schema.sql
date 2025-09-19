-- User Profile Schema for Rasi and Nakshatra

-- Create user_profiles table
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

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_user_profiles_updated_at();

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;

-- Create admin view for user management (admin dashboard)
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

-- Grant admin view permissions (you'll need to create an admin role)
-- GRANT SELECT ON admin_user_overview TO admin_role;
