-- Create the daily_planets table for your existing planetary data

CREATE TABLE IF NOT EXISTS daily_planets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    planetary_data JSONB NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_daily_planets_date ON daily_planets(date);

-- Grant permissions to authenticated users
GRANT SELECT ON daily_planets TO authenticated;
