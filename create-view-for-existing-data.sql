-- Create a view that maps your existing daily_gochar table to daily_planets
-- This allows the app to use your existing data without modifying your table

CREATE VIEW daily_planets AS 
SELECT 
    id,
    date,
    planetary_data,
    last_updated
FROM daily_gochar;

-- Grant permissions to authenticated users
GRANT SELECT ON daily_planets TO authenticated;

-- Test the view works
SELECT date, jsonb_array_length(planetary_data) as planet_count 
FROM daily_planets 
ORDER BY date DESC 
LIMIT 5;
